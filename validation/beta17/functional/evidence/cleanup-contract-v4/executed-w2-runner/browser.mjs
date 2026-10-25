import { execFile } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";
import { promisify } from "node:util";

const exec = promisify(execFile);
const hash = (value) => createHash("sha256").update(value).digest("hex");

export async function openArm(chromium, manifest, workload, load, arm) {
  const server = await chromium.launchServer({ channel: "chrome", headless: true });
  let browser;
  try {
    browser = await chromium.connect(server.wsEndpoint());
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    page.setDefaultTimeout(60_000);
    const session = randomUUID();
    const url = new URL(manifest.cells[`${workload}/${load}`].urls[arm], manifest.origin);
    url.searchParams.set("session", session);
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(url.href);
    await page
      .locator(manifest.selectors.ready)
      .filter({ hasText: /^true$/ })
      .waitFor();
    const stats = async () => {
      const url = new URL(manifest.statsPath, manifest.origin);
      url.searchParams.set("session", session);
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Stats returned ${response.status}`);
      return response.json();
    };
    return { server, browser, context, page, stats, errors, arm, workload, load };
  } catch (error) {
    try {
      await closeArm({ browser, server });
    } catch (cleanupError) {
      throw new AggregateError([error, cleanupError], "Could not open browser arm");
    }
    throw error;
  }
}

async function waitState(host, manifest, key, value) {
  await host.page.waitForFunction(
    ({ selector, value }) => document.querySelector(selector)?.textContent === value,
    { selector: manifest.selectors[key], value },
  );
}

export async function mount(host, manifest, hue) {
  await host.page.locator(manifest.selectors.theme).fill(String(hue));
  if ((await host.page.locator(manifest.selectors.mounted).textContent()) !== "true")
    await host.page.locator(manifest.selectors.mount).click();
  await waitState(host, manifest, "mounted", "true");
}

export async function unmount(host, manifest) {
  await host.page.locator(manifest.selectors.unmount).click();
  await waitState(host, manifest, "mounted", "false");
  await host.page.waitForTimeout(800);
  const stats = await host.stats();
  if (stats.active !== 0 || stats.activeTimers !== 0)
    throw new Error("Unmount left active streams or timers");
}

export async function measureStream(host, manifest, { input = false } = {}) {
  const { page, workload, load } = host;
  const cell = manifest.cells[`${workload}/${load}`];
  const before = await host.stats();
  const started = performance.now();
  await page.locator(manifest.selectors.start).click();
  let inputMs = null;
  let inputObservation = null;
  if (input) {
    await waitState(host, manifest, "status", "streaming");
    const activeBefore = (await host.stats()).active;
    const statusBefore = await page.locator(manifest.selectors.status).textContent();
    const valueBefore = await page.locator(manifest.selectors.input).inputValue();
    const inputValue = `Measured input during streaming ${(host.inputSequence = (host.inputSequence ?? 0) + 1)}`;
    const inputStarted = performance.now();
    await page.locator(manifest.selectors.input).fill(inputValue);
    inputMs = performance.now() - inputStarted;
    inputObservation = {
      activeBefore,
      statusBefore,
      valueBefore,
      valueAfter: await page.locator(manifest.selectors.input).inputValue(),
      statusAfter: await page.locator(manifest.selectors.status).textContent(),
      activeAfter: (await host.stats()).active,
    };
  }
  await page.waitForFunction(
    ({ selectors, expected }) =>
      document.querySelector(selectors.message)?.textContent === expected &&
      document.querySelector(selectors.status)?.textContent === "idle",
    { selectors: manifest.selectors, expected: cell.expectedText },
  );
  const elapsedMs = performance.now() - started;
  await page.waitForFunction(
    (cell) =>
      Object.values(cell.expectedDom).every(
        (probe) => document.querySelectorAll(probe.selector).length === probe.count,
      ) &&
      cell.requiredText.every((text) =>
        document.querySelector(cell.renderedRoot)?.textContent?.includes(text),
      ),
    cell,
  );
  let visibleBarCount = null;
  if (cell.expectedDom.bars) {
    await page.waitForFunction(
      (probe) =>
        [...document.querySelectorAll(probe.selector)].filter((element) => {
          const bounds = element.getBoundingClientRect();
          return bounds.width > 0 && bounds.height > 0;
        }).length === probe.count,
      cell.expectedDom.bars,
    );
    visibleBarCount = await page.locator(cell.expectedDom.bars.selector).evaluateAll(
      (elements) =>
        elements.filter((element) => {
          const bounds = element.getBoundingClientRect();
          return bounds.width > 0 && bounds.height > 0;
        }).length,
    );
  }
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
  const renderedElapsedMs = performance.now() - started;
  const actualText = await page.locator(manifest.selectors.message).textContent();
  const domCounts = {};
  for (const [name, probe] of Object.entries(cell.expectedDom))
    domCounts[name] = await page.locator(probe.selector).count();
  const rendered = await page.locator(cell.renderedRoot).textContent();
  const after = await host.stats();
  if (
    after.started !== before.started + 1 ||
    after.completed !== before.completed + 1 ||
    after.cancelled !== before.cancelled
  )
    throw new Error("Stream did not complete exactly once");
  if (host.errors.length) throw new Error(host.errors.join("\n"));
  return {
    workload,
    load,
    arm: host.arm,
    elapsedMs,
    renderedElapsedMs,
    inputMs,
    actualText,
    inputObservation,
    actualTextSha256: hash(actualText),
    domCounts,
    visibleBarCount,
    requiredTextFound: cell.requiredText.map((text) => rendered.includes(text)),
    status: await page.locator(manifest.selectors.status).textContent(),
    activeAfter: after.active,
    timersAfter: after.activeTimers,
  };
}

export async function cancelStream(host, manifest) {
  const { page, workload, load } = host;
  const expected = manifest.cells[`${workload}/${load}`].expectedText;
  const before = await host.stats();
  const failed = page.waitForEvent("requestfailed", {
    predicate: (request) => new URL(request.url()).pathname === manifest.streamPath,
  });
  // Attach rejection immediately so a failed click cannot leave an unhandled promise.
  failed.catch(() => {});
  await page.locator(manifest.selectors.start).click();
  await page.waitForFunction(
    ({ selectors, expected }) => {
      const value = document.querySelector(selectors.message)?.textContent;
      return (
        document.querySelector(selectors.status)?.textContent === "streaming" &&
        value &&
        value.length < expected.length &&
        expected.startsWith(value)
      );
    },
    { selectors: manifest.selectors, expected },
  );
  const active = await host.stats();
  const partialBefore = await page.locator(manifest.selectors.message).textContent();
  await page.locator(manifest.selectors.cancel).click();
  const request = await failed;
  await waitState(host, manifest, "status", "idle");
  await page.waitForTimeout(800);
  const after = await host.stats();
  return {
    arm: host.arm,
    workload,
    load,
    activeBefore: active.active,
    partialBefore,
    abortError: request.failure()?.errorText,
    activeAfter: after.active,
    timersAfter: after.activeTimers,
    cancelledBefore: before.cancelled,
    cancelledAfter: after.cancelled,
  };
}

export async function snapshot(host, { collect = false } = {}) {
  const session = await host.context.newCDPSession(host.page);
  const browserSession = await host.browser.newBrowserCDPSession();
  try {
    await session.send("Performance.enable");
    if (collect) {
      await session.send("HeapProfiler.collectGarbage");
      await session.send("HeapProfiler.collectGarbage");
    }
    const metrics = Object.fromEntries(
      (await session.send("Performance.getMetrics")).metrics.map(({ name, value }) => [
        name,
        value,
      ]),
    );
    const dom = await session.send("Memory.getDOMCounters");
    const styles = await host.page.evaluate(() => {
      const tags = [...document.querySelectorAll("style")];
      return {
        styleTags: tags.length,
        cssBytes: tags.reduce(
          (sum, tag) => sum + new TextEncoder().encode(tag.textContent).length,
          0,
        ),
        rules: [...document.styleSheets].reduce((sum, sheet) => sum + sheet.cssRules.length, 0),
      };
    });
    const processes = [];
    for (const process of (await browserSession.send("SystemInfo.getProcessInfo")).processInfo) {
      try {
        const { stdout } = await exec("ps", ["-o", "rss=", "-p", String(process.id)]);
        const bytes = Number(stdout.trim()) * 1024;
        if (!Number.isFinite(bytes) || bytes <= 0) throw new Error("Invalid RSS");
        processes.push({ pid: process.id, type: process.type, bytes });
      } catch (error) {
        throw new Error(`Could not sample owned Chrome process ${process.id}: ${error.message}`);
      }
    }
    const stats = await host.stats();
    return {
      heapUsedBytes: metrics.JSHeapUsedSize,
      heapTotalBytes: metrics.JSHeapTotalSize,
      dom,
      styles,
      activeStreams: stats.active,
      activeTimers: stats.activeTimers,
      rss: { totalBytes: processes.reduce((sum, process) => sum + process.bytes, 0), processes },
    };
  } finally {
    const cleanup = await Promise.allSettled([session.detach(), browserSession.detach()]);
    const failures = cleanup.filter((result) => result.status === "rejected");
    if (failures.length)
      throw new AggregateError(
        failures.map((result) => result.reason),
        "CDP cleanup failed",
      );
  }
}

export async function closeArm(host) {
  const failures = [];
  try {
    await host.browser?.close();
  } catch (error) {
    failures.push(error);
  }
  try {
    await host.server.close();
  } catch (error) {
    failures.push(error);
  }
  if (failures.length) throw new AggregateError(failures, "Chrome cleanup failed");
}
