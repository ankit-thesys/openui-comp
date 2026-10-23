import { spawn } from 'node:child_process';
import net from 'node:net';
import fs from 'node:fs/promises';
import { performance } from 'node:perf_hooks';

// Standalone React/Node, closed-loop local diagnostic. This is not Next.js,
// an open-loop load generator, or an estimate of production capacity.
const port = Number(process.env.REAL_SSR_PORT || 4181);
const origin = `http://127.0.0.1:${port}`;
const levels = process.env.REAL_SSR_INCLUDE_50 === '1' ? [1, 10, 25, 50] : [1, 10, 25];
const repetitions = 3;
const timeoutMs = 30000;
await new Promise((resolve, reject) => {
  const probe = net.createServer();
  probe.once('error', () => reject(new Error(`Port ${port} is occupied; refusing to test an existing server`)));
  probe.listen(port, '127.0.0.1', () => probe.close(resolve));
});
const server = spawn(process.execPath, ['.real-dist/server.cjs'], { cwd: process.cwd(), env: { ...process.env, PORT: String(port), NODE_ENV: 'production' }, stdio: ['ignore', 'pipe', 'pipe'] });
let logs = '';
server.stdout.on('data', chunk => { logs = (logs + chunk).slice(-12000); });
server.stderr.on('data', chunk => { logs = (logs + chunk).slice(-12000); });
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const stats = async () => (await fetch(`${origin}/stats`, { signal: AbortSignal.timeout(5000) })).json();
const percentile = (values, p) => values.length ? [...values].sort((a, b) => a - b)[Math.min(values.length - 1, Math.ceil(values.length * p) - 1)] : null;
const summary = values => ({ p50: percentile(values, .5), p95: percentile(values, .95), max: values.length ? Math.max(...values) : null });
const failures = [];
const cells = [];
const report = { createdAt: new Date().toISOString(), kind: 'standalone-node-react-streaming-ssr', scope: 'Shared laptop, local HTTP client, fixed concurrency, closed-loop bounded batches. Not Next.js, hydration validation, or production capacity. SSR size is 2 panels/blocks; separate browser replay uses size 20, so their timings are not comparable. Includes deliberate 25ms Suspense delay. CSS is linked, not fetched by this Node check. Full longer repeat and production soak remain pending.', config: { levels, repetitions, requestsPerRepetition: '3 * concurrency', size: 2, delayMs: 25 }, cells, failures };

async function request(scenario, arm, index, delay = 25, signal, requireSeparateChunk = false) {
  const theme = index % 2 ? 'red' : 'blue';
  const start = performance.now();
  const response = await fetch(`${origin}/ssr?${new URLSearchParams({ scenario, arm, size: '2', delay: String(delay), theme })}`, { signal: signal || AbortSignal.timeout(timeoutMs) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  let firstMs;
  let firstChunk = '';
  let content = '';
  let chunks = 0;
  let delayedFirstSeenMs;
  const decoder = new TextDecoder();
  for await (const chunk of response.body) {
    chunks++;
    const text = decoder.decode(chunk, { stream: true });
    if (firstMs === undefined) { firstMs = performance.now() - start; firstChunk = text; }
    content += text;
    if (delayedFirstSeenMs === undefined && content.includes('data-delayed="true"')) delayedFirstSeenMs = performance.now() - start;
  }
  content += decoder.decode();
  const other = theme === 'red' ? 'blue' : 'red';
  const assertions = {
    shell: firstChunk.includes('data-shell="true"'),
    delayedAfterShell: content.indexOf('data-delayed="true"') > content.indexOf('data-shell="true"'),
    // Read boundaries can coalesce under client CPU pressure. Prove transport
    // separation in a dedicated low-concurrency canary, record it under load.
    delayedSeparate: !requireSeparateChunk || (!firstChunk.includes('data-delayed="true"') && chunks > 1),
    theme: content.includes(`data-request-theme="${theme}"`) && !content.includes(`data-request-theme="${other}"`),
    cssBeforeBody: content.indexOf(`href="/${arm}.css"`) >= 0 && content.indexOf(`href="/${arm}.css"`) < content.indexOf('<body'),
    realContent: content.includes(scenario === 'dashboard' ? 'Regional revenue dashboard' : 'OpenUI research conversation') && content.includes('Follow-up question'),
    actualInputs: (content.match(/<input\b/g) || []).length >= 2 && content.includes('openui-input'),
    actualButtons: (content.match(/<button\b/g) || []).length >= 4 && content.includes('Explore results'),
    actualDashboardTable: scenario !== 'dashboard' || ((content.match(/<table\b/g) || []).length >= 2 && (content.match(/<td\b/g) || []).length >= 60 && content.includes('openui-table')),
    actualDashboardChart: scenario !== 'dashboard' || ((content.match(/aria-label="Bar chart"/g) || []).length >= 2 && (content.match(/class="openui-bar-chart-bar(?:\s|"|-)/g) || []).length >= 24),
  };
  const invalid = Object.entries(assertions).filter(([, ok]) => !ok).map(([name]) => name);
  if (invalid.length) throw new Error(`${scenario}/${arm}: ${invalid.join(', ')} failed (chunks=${chunks})`);
  return { ttfbMs: firstMs, endMs: performance.now() - start, delayedFirstSeenMs, bytes: Buffer.byteLength(content), chunks, delayedSeparateChunk: !firstChunk.includes('data-delayed="true"') && chunks > 1, shellOffset: content.indexOf('data-shell="true"'), delayedOffset: content.indexOf('data-delayed="true"') };
}

try {
  let available = false;
  for (let i = 0; i < 100; i++) {
    if (server.exitCode !== null) throw new Error(`Server exited ${server.exitCode}: ${logs}`);
    try { await stats(); available = true; break; } catch { await pause(100); }
  }
  if (!available) throw new Error(`Server startup timed out: ${logs}`);
  const initial = await stats();
  report.initialStats = initial;
  report.streamingCanaries = [];
  for (const scenario of ['chat', 'dashboard']) for (const arm of ['baseline', 'generated']) {
    report.streamingCanaries.push({ scenario, arm, delayMs: 150, ...await request(scenario, arm, 0, 150, undefined, true) });
  }
  for (const scenario of ['chat', 'dashboard']) {
    for (const concurrency of levels) {
      // Alternate A/B order across repetitions to reduce monotonic warmup bias.
      for (let repetition = 0; repetition < repetitions; repetition++) {
        for (const arm of repetition % 2 ? ['generated', 'baseline'] : ['baseline', 'generated']) {
          await request(scenario, arm, 0); // warmup excluded from latency samples
          const before = await stats();
          const rows = [];
          const errors = [];
          let next = 0;
          const offered = concurrency * 3;
          const start = performance.now();
          await Promise.all(Array.from({ length: concurrency }, async () => {
            while (next < offered) {
              const index = next++;
              try { rows.push(await request(scenario, arm, index)); }
              catch (error) { errors.push(String(error)); }
            }
          }));
          const elapsedMs = performance.now() - start;
          const after = await stats();
          const cell = { scenario, arm, concurrency, repetition, offered, completed: rows.length, errors, elapsedMs, throughputPerSecond: rows.length / (elapsedMs / 1000), ttfbMs: summary(rows.map(row => row.ttfbMs)), endMs: summary(rows.map(row => row.endMs)), delayedFirstSeenMs: summary(rows.map(row => row.delayedFirstSeenMs)), separateChunkResponses: rows.filter(row => row.delayedSeparateChunk).length, responseBytes: summary(rows.map(row => row.bytes)), rssBefore: before.rss, rssAfter: after.rss, rssDelta: after.rss - before.rss, cpuUserMicros: after.cpu.user - before.cpu.user, cpuSystemMicros: after.cpu.system - before.cpu.system, eventLoopSnapshot: after.eventLoop, samples: rows };
          cells.push(cell);
          if (errors.length || after.active !== 0) failures.push({ scenario, arm, concurrency, repetition, errors, active: after.active });
          console.log(`${scenario}/${arm} c=${concurrency} rep=${repetition + 1}: ${rows.length}/${offered}, end p95=${cell.endMs.p95?.toFixed(1)}ms`);
        }
      }
    }
  }
  const beforeAbort = await stats();
  await Promise.all(Array.from({ length: 10 }, async (_, i) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(`${origin}/ssr?scenario=${i % 2 ? 'dashboard' : 'chat'}&arm=${i % 2 ? 'generated' : 'baseline'}&delay=1000&theme=${i % 2 ? 'red' : 'blue'}`, { signal: controller.signal });
      const reader = response.body.getReader();
      await reader.read(); // ensure this is an actual server-side active stream
      controller.abort();
      try { await reader.cancel(); } catch {}
    } finally { clearTimeout(timeout); }
  }));
  let afterAbort;
  for (let i = 0; i < 50; i++) { afterAbort = await stats(); if (afterAbort.active === 0) break; await pause(20); }
  report.abortCheck = { requested: 10, abortedDelta: afterAbort.aborted - beforeAbort.aborted, activeAfter: afterAbort.active, renderErrorsDelta: afterAbort.renderErrors - beforeAbort.renderErrors };
  if (report.abortCheck.abortedDelta !== 10 || afterAbort.active !== 0) failures.push({ abortCheck: report.abortCheck });
  await pause(1100); // cancelled Suspense timers must not resume work later
  const drained = await stats();
  report.abortCheck.afterTimerDeadline = { active: drained.active, completedDelta: drained.completed - afterAbort.completed, abortedDelta: drained.aborted - afterAbort.aborted };
  if (drained.active !== 0 || drained.completed !== afterAbort.completed || drained.aborted !== afterAbort.aborted) failures.push({ abortAfterDeadline: report.abortCheck.afterTimerDeadline });
  if (drained.requests !== drained.completed + drained.aborted + drained.active) failures.push({ invalidRequestAccounting: drained });
  report.finalStats = drained;
  // React reports intentional stream aborts via onError; other errors are failures.
  if (beforeAbort.renderErrors !== initial.renderErrors) failures.push({ unexpectedRenderErrors: beforeAbort.renderErrors - initial.renderErrors });
} catch (error) { failures.push({ fatal: String(error), serverLogs: logs }); }
finally {
  await fs.mkdir('results', { recursive: true });
  await fs.writeFile('results/real-ssr.json', JSON.stringify(report, null, 2) + '\n');
  server.kill('SIGTERM');
  await new Promise(resolve => {
    if (server.exitCode !== null || server.signalCode !== null) { resolve(); return; }
    const timeout = setTimeout(() => { server.kill('SIGKILL'); resolve(); }, 2000);
    server.once('exit', () => { clearTimeout(timeout); resolve(); });
  });
}
if (failures.length) { console.error(JSON.stringify(failures, null, 2)); process.exitCode = 1; }
else console.log('Standalone React streaming SSR diagnostic passed; results/real-ssr.json');
