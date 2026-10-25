import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { once } from "node:events";
import { chromium } from "playwright";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { createApp } from "../server.mjs";
import { runBench } from "../bench/runner.mjs";
import { measureDocument } from "../bench/probes.mjs";
import { compareLayer, DEFAULT_CHROME } from "../bench/model.mjs";
let upstreamCalls = 0;
const app = await createApp({
  env: { NODE_ENV: "production", COMPARISON_MODE: "mock" },
  generate: async function* () {
    upstreamCalls++;
    yield "not allowed";
  },
});
app.server.listen(0, "127.0.0.1");
await once(app.server, "listening");
const origin = `http://127.0.0.1:${app.server.address().port}`;
const browser = await chromium.launch({
  executablePath: DEFAULT_CHROME,
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 796, height: 720 } });
const controls = {};
try {
  await page.goto(origin + "/bench-runner.html");
  await page.waitForFunction(() => window.benchReady.size === 2);
  await page.evaluate(() => {
    for (const f of document.querySelectorAll("iframe")) {
      f.style.width = "390px";
      f.style.height = "720px";
      f.contentWindow.postMessage(
        {
          channel: "openui-component-comparison/v1",
          type: "snapshot",
          snapshot: {
            messages: [
              {
                id: "control",
                role: "assistant",
                content: 'root = Card([TextContent("Actual text")])',
              },
            ],
            status: "idle",
            error: "",
            theme: "light",
            viewId: "control",
            revision: 1,
            allowActions: false,
          },
        },
        location.origin,
      );
    }
  });
  const frame = page.frames().find((f) => f.url().endsWith("/migrated.html"));
  await frame.getByText("Actual text", { exact: true }).waitFor();
  const before = await frame.evaluate(measureDocument);
  await frame
    .getByText("Actual text", { exact: true })
    .evaluate((e) => (e.textContent = "Seeded semantic fault"));
  const altered = await frame.evaluate(measureDocument);
  assert.equal(compareLayer(before.text, altered.text, "text").status, "Fail");
  controls.semanticFaultDetected = true;
  await frame
    .getByText("Seeded semantic fault", { exact: true })
    .evaluate((e) => (e.textContent = "Actual text"));
  const clean = await frame.evaluate(measureDocument);
  const pictureBefore = PNG.sync.read(await page.screenshot());
  await frame
    .getByText("Actual text", { exact: true })
    .evaluate((e) => (e.style.color = "rgb(255, 0, 0)"));
  const changed = await frame.evaluate(measureDocument);
  assert.equal(
    compareLayer(clean.styles, changed.styles, "computed-style").status,
    "Fail",
  );
  const pictureAfter = PNG.sync.read(await page.screenshot());
  assert(
    pixelmatch(
      pictureBefore.data,
      pictureAfter.data,
      null,
      pictureBefore.width,
      pictureBefore.height,
      { threshold: 0, includeAA: true },
    ) > 0,
  );
  controls.styleAndPixelFaultDetected = true;
  await browser.close();
  const common = {
    version: "explicit-control-v1",
    name: "Browser control",
    coverage: [],
    steps: [],
    deliveries: ["instant"],
    setup: {},
    knownIssues: [],
    chunkSchedule: {
      seed: 0,
      characters: 180,
      checkpoints: [0.5, 1],
      delayMs: 0,
    },
  };
  const blocked = await runBench({
    origin,
    caseIds: ["control-network"],
    casesOverride: [
      {
        ...common,
        id: "control-network",
        source: 'root = Card([Image("Blocked API", "/api/generate")])',
        assertions: [{ id: "error-observed", kind: "imageError", expected: 1 }],
      },
    ],
    widths: [390],
    themes: ["light"],
    concurrency: 1,
  });
  assert.equal(blocked.results[0].layers.network.status, "Fail");
  assert(blocked.results[0].layers.network.violations.length >= 2);
  assert.equal(upstreamCalls, 0);
  controls.prohibitedRequestsBlockedAndFailed = true;
  const cancelled = await runBench({
    origin,
    caseIds: ["control-cancel"],
    casesOverride: [
      {
        ...common,
        id: "control-cancel",
        source: 'root = Card([TextContent("Cancellation control")])',
        assertions: [
          {
            id: "visible",
            kind: "text",
            value: "Cancellation control",
            expected: true,
          },
        ],
      },
    ],
    concurrency: 1,
    onProgress: (p) => {
      if (p.completed === 1)
        writeFileSync(
          path.join(".bench-runs", p.id, "cancel.requested"),
          "Deliberate cancellation test\n",
        );
    },
  });
  assert.equal(cancelled.status, "cancelled");
  assert.equal(cancelled.summary.verdict, "Not covered");
  assert.equal(cancelled.summary.executed, 1);
  assert(cancelled.results.some((r) => !r.executed));
  controls.cancelledCellsNeverPass = true;
  const persisted = JSON.parse(
    await fs.readFile(path.join(".bench-runs", blocked.id, "run.json"), "utf8"),
  );
  assert.equal(
    persisted.cases[0].source,
    'root = Card([Image("Blocked API", "/api/generate")])',
  );
  controls.immutableInputsRetained = true;
  const report = {
    pass: true,
    ...controls,
    upstreamCalls,
    networkControlRun: blocked.id,
    cancellationControlRun: cancelled.id,
  };
  await fs.mkdir(".test-results", { recursive: true });
  await fs.writeFile(
    ".test-results/bench-controls.json",
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report));
} finally {
  if (browser.isConnected()) await browser.close();
  await app.close();
}
