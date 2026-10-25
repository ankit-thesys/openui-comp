import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { once } from "node:events";
import { execFileSync } from "node:child_process";
import { chromium } from "playwright";
import { createApp } from "../server.mjs";
import { DEFAULT_CHROME } from "../bench/model.mjs";
const app = await createApp({
  env: { NODE_ENV: "production", COMPARISON_MODE: "mock" },
});
app.server.listen(0, "127.0.0.1");
await once(app.server, "listening");
const origin = `http://127.0.0.1:${app.server.address().port}`;
const browser = await chromium.launch({
  executablePath: DEFAULT_CHROME,
  headless: true,
});
const page = await browser.newPage({
  viewport: { width: 1680, height: 1050 },
  deviceScaleFactor: 1,
});
const errors = [],
  generation = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("request", (r) => {
  if (new URL(r.url()).pathname.startsWith("/api/"))
    generation.push(new URL(r.url()).pathname);
});
let savedId;
const waitRun = async (id) => {
  for (let n = 0; n < 240; n++) {
    const p = await (
      await fetch(origin + "/bench-api/runs/" + id + "/progress")
    ).json();
    if (p.status !== "running")
      return await (await fetch(origin + "/bench-api/runs/" + id)).json();
    await new Promise((r) => setTimeout(r, 500));
  }
  throw Error("UI run did not finalize");
};
try {
  await page.goto(origin + "/bench.html");
  await page
    .getByRole("heading", { name: "Card · default composition", exact: true })
    .waitFor();
  await page.getByLabel("Search component cases").fill("Card · empty");
  await page
    .getByRole("checkbox", { name: "Select Card · empty", exact: true })
    .check();
  const started = page.waitForResponse(
    (r) =>
      r.url() === origin + "/bench-api/runs" && r.request().method() === "POST",
  );
  await page
    .getByRole("button", { name: "Run selected 1", exact: true })
    .click();
  const job = await (await started).json();
  const run = await waitRun(job.id);
  assert.equal(run.summary.executed, 12);
  assert.equal(run.cases.length, 1);
  assert.equal(run.cases[0].id, "card-empty");
  assert.equal(run.themePreset.id, "default");
  assert.equal(run.status, "completed");
  await page
    .getByRole("heading", { name: "Recorded run", exact: true })
    .waitFor({ timeout: 10000 });
  const jsonLink = page.getByRole("link", { name: "JSON", exact: true });
  assert.equal(
    (await (await fetch(origin + (await jsonLink.getAttribute("href")))).json())
      .id,
    job.id,
  );
  const bundle = await (
    await fetch(origin + "/bench-api/runs/" + job.id + "/bundle")
  ).arrayBuffer();
  const bundlePath = path.join("/private/tmp", job.id + "-ui-export.tar.gz");
  await fs.writeFile(bundlePath, Buffer.from(bundle));
  const entries = execFileSync("tar", ["-tzf", bundlePath], {
    encoding: "utf8",
  });
  assert(entries.includes("./run.json"));
  assert(entries.includes("./report.html"));
  assert(entries.includes("./manifest.json"));
  assert(entries.includes("/complete-legacy.png"));
  await page.getByLabel("Bench shared preset").selectOption("cyberpunk");
  await page
    .getByText(
      "This preview preset/version has no matching evidence in the loaded run.",
      { exact: false },
    )
    .waitFor();
  await page.getByRole("button", { name: "History", exact: true }).click();
  await page
    .getByRole("button")
    .filter({ has: page.locator("code", { hasText: job.id }) })
    .click();
  assert(
    (await page.locator(".detail-body").innerText()).includes(
      "Tested preset: Default",
    ),
  );
  await page
    .getByLabel("Search component cases")
    .fill("Form · default composition");
  await page
    .locator(".case-row")
    .filter({
      has: page.locator("strong", { hasText: "Form · default composition" }),
    })
    .getByRole("button")
    .click();
  const frames = page
    .frames()
    .filter((f) => /\/(legacy|migrated)\.html$/.test(f.url()));
  await frames[0].getByPlaceholder("Offline name").fill("Persistent draft");
  await page.getByLabel("Bench shared theme").selectOption("dark");
  assert.equal(
    await frames[0].getByPlaceholder("Offline name").inputValue(),
    "Persistent draft",
  );
  assert.equal(
    await frames[1].getByPlaceholder("Offline name").inputValue(),
    "",
  );
  await page.getByLabel("Renderer viewport").selectOption("768");
  assert.deepEqual(
    await Promise.all(frames.map((f) => f.evaluate(() => innerWidth))),
    [768, 768],
  );
  await page.getByRole("button", { name: "Case", exact: true }).click();
  await page.getByLabel("Independent assertions JSON").fill("[]");
  const saving = page.waitForResponse(
    (r) =>
      r.url() === origin + "/bench-api/cases" &&
      r.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Save as new local case" }).click();
  const saved = await (await saving).json();
  savedId = saved.case.id;
  assert.equal(saved.case.themePreset.id, "cyberpunk");
  assert.equal(saved.case.themePreset.mode, "dark");
  assert.equal(saved.case.assertions.length, 0);
  assert.match(saved.status, /Not covered/);
  await page.getByLabel("Search component cases").fill("Card · empty");
  await page
    .getByRole("checkbox", { name: "Select Card · empty", exact: true })
    .check();
  await page.getByLabel("Matrix mode").selectOption("full");
  const cancelling = page.waitForResponse(
    (r) =>
      r.url() === origin + "/bench-api/runs" && r.request().method() === "POST",
  );
  await page
    .getByRole("button", { name: "Run selected 1", exact: true })
    .click();
  const cancelJob = await (await cancelling).json();
  for (let n = 0; n < 100; n++) {
    const p = await (
      await fetch(origin + "/bench-api/runs/" + cancelJob.id + "/progress")
    ).json();
    if (p.completed > 0) break;
    await new Promise((r) => setTimeout(r, 100));
  }
  await page.getByRole("button", { name: "Cancel run", exact: true }).click();
  const cancelled = await waitRun(cancelJob.id);
  assert.equal(cancelled.status, "cancelled");
  assert(cancelled.summary.executed < cancelled.summary.expected);
  assert(
    cancelled.results.some((r) => !r.executed && r.verdict === "Not covered"),
  );
  assert.deepEqual(errors, []);
  assert.deepEqual(generation, []);
  await fs.mkdir(".test-results", { recursive: true });
  await page.screenshot({ path: ".test-results/bench-ui.png", fullPage: true });
  const report = {
    pass: true,
    runId: job.id,
    cancelledRunId: cancelJob.id,
    executed: run.summary.executed,
    bundleEntries: entries.split("\n").length,
    savedPreset: "cyberpunk/dark",
    generationRequests: 0,
    pageErrors: 0,
  };
  await fs.writeFile(
    ".test-results/bench-ui.json",
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report));
} finally {
  if (savedId) await fs.unlink(".bench-cases/" + savedId + ".json");
  await browser.close();
  await app.close();
}
