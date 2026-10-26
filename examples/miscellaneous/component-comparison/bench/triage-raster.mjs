import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { once } from "node:events";
import { chromium } from "playwright";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { createApp } from "../server.mjs";
import { DEFAULT_CHROME } from "./model.mjs";
import { getThemePreset } from "../src/theme-presets.mjs";
const id = process.argv[2],
  root = path.resolve(import.meta.dirname, "..");
if (!/^[a-zA-Z0-9-]+$/.test(id)) throw Error("Run ID required");
const dir = path.join(root, ".bench-runs", id),
  run = JSON.parse(await fs.readFile(path.join(dir, "run.json"))),
  out = path.join(
    root,
    ".bench-investigations",
    id,
    new Date().toISOString().replace(/[:.]/g, "-") +
      "-raster-" +
      randomUUID().slice(0, 6),
  );
await fs.mkdir(out, { recursive: true });
const app = await createApp({
  env: { NODE_ENV: "production", COMPARISON_MODE: "mock" },
  distRoot: path.join(dir, "runtime"),
});
app.server.listen(0, "127.0.0.1");
await once(app.server, "listening");
const origin = `http://127.0.0.1:${app.server.address().port}`,
  browser = await chromium.launch({
    executablePath: DEFAULT_CHROME,
    headless: true,
  });
const summary = [];
try {
  for (const caseId of process.argv.slice(3)) {
    const c = run.cases.find((c) => c.id === caseId);
    const page = await browser.newPage({
      viewport: { width: 796, height: 720 },
      deviceScaleFactor: 1,
      reducedMotion: "reduce",
    });
    await page.goto(origin + "/bench-runner.html");
    await page.waitForFunction(() => window.benchReady.size === 2);
    await page.evaluate(
      ({ source, preset }) => {
        for (const f of document.querySelectorAll("iframe")) {
          f.style.width = "390px";
          f.style.height = "720px";
          f.contentWindow.postMessage(
            {
              channel: "openui-component-comparison/v1",
              type: "snapshot",
              snapshot: {
                messages: [
                  { id: "raster", role: "assistant", content: source },
                ],
                status: "idle",
                error: "",
                theme: "light",
                viewId: "raster",
                revision: 1,
                allowActions: true,
                themePreset: preset,
              },
            },
            location.origin,
          );
        }
      },
      { source: c.source, preset: getThemePreset("default") },
    );
    const frames = page
      .frames()
      .filter((f) => /\/(legacy|migrated)\.html$/.test(f.url()));
    for (const f of frames) {
      await f.locator("#pane-revision").waitFor({ state: "attached" });
      await f.addStyleTag({
        content:
          "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}",
      });
      await f.evaluate(async () => {
        const l = document.createElement("link");
        l.rel = "stylesheet";
        l.href = "/bench-host/plain.css";
        const p = new Promise((r) => (l.onload = r));
        document.head.prepend(l);
        await p;
        await document.fonts.ready;
        await Promise.all(
          [...document.images].map((i) => i.decode().catch(() => {})),
        );
      });
    }
    await page.waitForTimeout(500);
    const captures = [];
    for (const placement of ["side-by-side", "same-origin"]) {
      for (let arm = 0; arm < 2; arm++) {
        if (placement === "same-origin")
          await page.evaluate((arm) => {
            [...document.querySelectorAll("iframe")].forEach((f, i) => {
              f.style.position = "absolute";
              f.style.left = i === arm ? "0px" : "406px";
              f.style.top = "0px";
            });
          }, arm);
        await page.waitForTimeout(50);
        const file = `${caseId}-${placement}-${arm}.png`;
        await page
          .locator("iframe")
          .nth(arm)
          .screenshot({ path: path.join(out, file), animations: "disabled" });
        captures.push(file);
      }
    }
    const comparisons = [];
    for (const [label, left, right] of [
      ["cross-side", captures[0], captures[1]],
      ["cross-same-origin", captures[2], captures[3]],
      ["legacy-position-only", captures[0], captures[2]],
      ["migrated-position-only", captures[1], captures[3]],
    ]) {
      const a = PNG.sync.read(await fs.readFile(path.join(out, left))),
        b = PNG.sync.read(await fs.readFile(path.join(out, right)));
      const d = new PNG({ width: a.width, height: a.height });
      const pixels = pixelmatch(a.data, b.data, d.data, a.width, a.height, {
        threshold: 0,
        includeAA: true,
      });
      await fs.writeFile(
        path.join(out, caseId + "-" + label + "-diff.png"),
        PNG.sync.write(d),
      );
      comparisons.push({ label, pixels });
    }
    summary.push({ caseId, comparisons });
    await page.close();
  }
  await fs.writeFile(
    path.join(out, "summary.json"),
    JSON.stringify(summary, null, 2),
  );
  console.log(JSON.stringify(summary));
} finally {
  await browser.close();
  await app.close();
}
