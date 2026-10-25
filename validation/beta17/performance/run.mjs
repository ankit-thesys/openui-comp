import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { cancellationErrors, summarizeBenchmark, summarizeSoak } from "./analysis.mjs";
import { browserLaunchOptions } from "./browser-config.mjs";
import {
  cancelStream,
  closeArm,
  measureStream,
  mount,
  openArm,
  snapshot,
  unmount,
} from "./browser.mjs";
import { arms, loads, pairOrder, thresholds, workloads } from "./protocol.mjs";
import { installedInventory } from "./provenance.mjs";

const hash = (value) => createHash("sha256").update(value).digest("hex");
const [mode, manifestPath, outputDirectory] = process.argv.slice(2);
if (process.env.BETA17_QUIET_WINDOW_RELEASED !== "yes")
  throw new Error(
    "Worker1 fixture freeze and quiet-window release are required; this runner has not been released",
  );
if (!["benchmark", "soak"].includes(mode) || !manifestPath || !outputDirectory)
  throw new Error("Usage: run.mjs benchmark|soak manifest.json NEW_OUTPUT_DIRECTORY");
const manifestBytes = await fs.readFile(manifestPath);
const manifest = JSON.parse(manifestBytes);
if (manifest.schemaVersion !== 1 || !path.isAbsolute(manifest.consumer) || !manifest.productCommit)
  throw new Error("Missing frozen fixture identity");
if (!Object.keys(manifest.inputs ?? {}).length) throw new Error("No frozen input inventory");
if (!manifest.runtimeModules?.length) throw new Error("Missing compiled runtime module inventory");
for (const module of manifest.runtimeModules)
  if (!(module in manifest.inputs))
    throw new Error(`Runtime module missing from frozen inventory: ${module}`);
for (const workload of workloads)
  for (const load of loads) {
    const cell = manifest.cells[`${workload}/${load}`];
    if (
      !cell.expectedText ||
      !cell.expectedDom ||
      !cell.renderedRoot ||
      !cell.requiredText?.length ||
      !/^[a-f0-9]{64}$/.test(cell.payloadSha256) ||
      !/^[a-f0-9]{64}$/.test(cell.scheduleSha256)
    )
      throw new Error(`Incomplete frozen cell ${workload}/${load}`);
  }
async function inventory() {
  const actual = {};
  for (const [file, expected] of Object.entries(manifest.inputs)) {
    if (!path.isAbsolute(file)) throw new Error(`Input path must be absolute: ${file}`);
    actual[file] = hash(await fs.readFile(file));
    if (actual[file] !== expected) throw new Error(`Frozen input changed: ${file}`);
  }
  return actual;
}
await browserLaunchOptions(manifest);
const before = await inventory();
const installedBefore = await installedInventory(manifest.consumer);
const require = createRequire(path.join(manifest.consumer, "package.json"));
const { chromium } = require(process.env.BETA17_PLAYWRIGHT_MODULE ?? "playwright");
await fs.mkdir(outputDirectory); // Refuse to overwrite earlier evidence.
await fs.copyFile(manifestPath, path.join(outputDirectory, "manifest.json"));
await fs.mkdir(path.join(outputDirectory, "runner"));
for (const file of await fs.readdir(import.meta.dirname))
  if (file.endsWith(".mjs"))
    await fs.copyFile(
      path.join(import.meta.dirname, file),
      path.join(outputDirectory, "runner", file),
    );
const report = {
  schemaVersion: 1,
  kind: mode,
  fixtureManifestSha256: hash(manifestBytes),
  productCommit: manifest.productCommit,
  startedAt: new Date().toISOString(),
  node: process.version,
  browser: manifest.browser,
  integrity: { before, installed: { before: installedBefore } },
  cold: [],
  runs: [],
  errors: [],
};
const save = () =>
  fs.writeFile(path.join(outputDirectory, "report.json"), JSON.stringify(report, null, 2));
const hosts = [];
async function open(workload, load, arm) {
  const host = await openArm(chromium, manifest, workload, load, arm);
  hosts.push(host);
  report.chromeVersion ??= host.browser.version();
  return host;
}
async function closeAll() {
  const closing = hosts.splice(0);
  const results = await Promise.allSettled(closing.map(closeArm));
  for (const result of results)
    if (result.status === "rejected")
      report.errors.push(`Browser cleanup: ${result.reason.message}`);
}
async function benchmark() {
  for (const workload of workloads)
    for (const load of loads) {
      const cellHosts = {};
      for (const arm of arms) {
        const host = await open(workload, load, arm);
        cellHosts[arm] = host;
        await mount(host, manifest, 220);
        report.cold.push(await measureStream(host, manifest));
        await unmount(host, manifest);
      }
      for (let pair = 0; pair < thresholds.pairsPerCell; pair++)
        for (const arm of pairOrder(pair)) {
          const host = cellHosts[arm];
          await mount(host, manifest, 220);
          report.runs.push({
            pair,
            ...(await measureStream(host, manifest, { input: load === "paced" })),
          });
          await unmount(host, manifest);
          await save();
        }
      await closeAll();
    }
}
async function soak() {
  for (const workload of workloads) {
    const cellHosts = await Promise.all(arms.map((arm) => open(workload, "paced", arm)));
    const run = {
      workload,
      warmupCycles: thresholds.warmupCycles,
      iterations: 0,
      arms: {},
      samples: [],
      cancellations: [],
    };
    report.runs.push(run);
    async function cycle(index, warmup) {
      await Promise.all(
        cellHosts.map(async (host) => {
          await mount(host, manifest, (index * 47) % 360);
          if (index % 10 === 9) {
            const observation = { cycle: index, ...(await cancelStream(host, manifest)) };
            const errors = cancellationErrors(
              observation,
              manifest.cells[`${workload}/paced`].expectedText,
            );
            if (errors.length) throw new Error(errors.join("; "));
            if (!warmup) run.cancellations.push(observation);
          } else await measureStream(host, manifest);
          await unmount(host, manifest);
        }),
      );
    }
    for (let index = 0; index < thresholds.warmupCycles; index++) await cycle(index, true);
    for (const host of cellHosts)
      run.arms[host.arm] = { warm: await snapshot(host, { collect: true }) };
    const start = performance.now();
    let nextSample = thresholds.sampleEveryMs;
    while (performance.now() - start < thresholds.soakMs || nextSample <= thresholds.soakMs) {
      await cycle(run.iterations, false);
      run.iterations++;
      if (performance.now() - start >= nextSample) {
        const sample = { targetMs: nextSample, arms: {} };
        for (const host of cellHosts) sample.arms[host.arm] = await snapshot(host);
        sample.elapsedMs = performance.now() - start;
        run.samples.push(sample);
        nextSample += thresholds.sampleEveryMs;
      }
      await save();
    }
    for (const host of cellHosts)
      run.arms[host.arm].terminal = await snapshot(host, { collect: true });
    run.durationMs = performance.now() - start;
    await save();
    await closeAll();
  }
}
try {
  await save();
  if (mode === "benchmark") await benchmark();
  else await soak();
} catch (error) {
  report.errors.push(error.stack ?? error.message);
} finally {
  await closeAll();
  try {
    await browserLaunchOptions(manifest);
    report.integrity.after = await inventory();
    report.integrity.installed.after = await installedInventory(manifest.consumer);
  } catch (error) {
    report.errors.push(error.message);
  }
  report.endedAt = new Date().toISOString();
  await save();
}
let summary;
try {
  summary = (mode === "benchmark" ? summarizeBenchmark : summarizeSoak)(
    manifest,
    report,
    hash(manifestBytes),
  );
} catch (error) {
  summary = { valid: false, pass: false, errors: [...report.errors, error.message] };
}
await fs.writeFile(path.join(outputDirectory, "summary.json"), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
if (!summary.pass) process.exitCode = 1;
