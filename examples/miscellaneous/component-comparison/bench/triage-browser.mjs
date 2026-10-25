// Isolated, read-only installed-artifact repro; no component styles are overridden.
import fs from "node:fs/promises";
import path from "node:path";
import { once } from "node:events";
import { createHash } from "node:crypto";
import { chromium } from "playwright";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { createApp } from "../server.mjs";
import { DEFAULT_CHROME } from "./model.mjs";
import { measureDocument } from "./probes.mjs";
import { getThemePreset } from "../src/theme-presets.mjs";
const runId = process.argv[2];
if (!runId || !/^[a-zA-Z0-9-]+$/.test(runId)) throw Error("Run ID required");
const root = path.resolve(import.meta.dirname, "..");
const run = JSON.parse(
  await fs.readFile(path.join(root, ".bench-runs", runId, "run.json")),
);
const output = path.join(root, ".bench-runs", runId, "isolated-repros");
await fs.mkdir(output, { recursive: true });
const app = await createApp({
  env: { NODE_ENV: "production", COMPARISON_MODE: "mock" },
  distRoot: path.join(root, ".bench-runs", runId, "runtime"),
});
app.server.listen(0, "127.0.0.1");
await once(app.server, "listening");
const origin = `http://127.0.0.1:${app.server.address().port}`;
const browser = await chromium.launch({
  executablePath: DEFAULT_CHROME,
  headless: true,
});
const summaries = [];
try {
  for (const caseId of process.argv.slice(3)) {
    const c = run.cases.find((c) => c.id === caseId);
    if (!c) throw Error("Unknown case " + caseId);
    const captures = [];
    const arms = [];
    for (const arm of ["legacy", "migrated"]) {
      const context = await browser.newContext({
        viewport: { width: 390, height: 720 },
        deviceScaleFactor: 1,
        locale: "en-US",
        timezoneId: "UTC",
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      await context.route("**/*", (route) => {
        const u = new URL(route.request().url());
        return u.origin !== origin || u.pathname.startsWith("/api/")
          ? route.abort()
          : route.continue();
      });
      await page.clock.setFixedTime(new Date("2026-01-15T12:00:00Z"));
      await page.goto(`${origin}/${arm}.html`);
      await page.waitForFunction(() => document.querySelector(".pane-empty"));
      await page.addStyleTag({
        content:
          "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}",
      });
      await page.evaluate(async () => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "/bench-host/plain.css";
        const loaded = new Promise((r, j) => {
          link.onload = r;
          link.onerror = j;
        });
        document.head.prepend(link);
        await loaded;
      });
      await page.evaluate(
        ({ c, preset }) =>
          window.postMessage(
            {
              channel: "openui-component-comparison/v1",
              type: "snapshot",
              snapshot: {
                messages: [
                  { id: "isolated", role: "assistant", content: c.source },
                ],
                status: "idle",
                error: "",
                theme: "light",
                viewId: "isolated",
                revision: 1,
                allowActions: true,
                presetId: preset.id,
                themePreset: preset,
              },
            },
            location.origin,
          ),
        { c, preset: getThemePreset("default") },
      );
      await page.waitForFunction(
        () => document.querySelector("#pane-revision")?.textContent === "1",
      );
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all(
          [...document.images].map((i) => i.decode().catch(() => {})),
        );
      });
      await page.waitForTimeout(500);
      let keyboardTrace;
      if (caseId === "radio-keyboard") {
        keyboardTrace = [];
        for (const key of ["ArrowRight", "ArrowDown", " "]) {
          await page.getByRole("radio").first().click();
          await page.getByRole("radio").first().focus();
          await page.getByRole("radio").first().press(key, { delay: 50 });
          await page.waitForTimeout(150);
          keyboardTrace.push({
            key,
            items: await page
              .getByRole("radio")
              .evaluateAll((es) =>
                es.map((e) => ({
                  label: e.textContent,
                  checked: e.getAttribute("aria-checked"),
                  focused: e === document.activeElement,
                  outer: e.outerHTML,
                })),
              ),
          });
        }
      }
      const probes = await page.evaluate(measureDocument);
      const diagnostics = await page.evaluate(() => ({
        fonts: {
          status: document.fonts.status,
          faces: [...document.fonts].map((f) => ({
            family: f.family,
            status: f.status,
            weight: f.weight,
          })),
        },
        resources: performance
          .getEntriesByType("resource")
          .map((e) => ({
            name: new URL(e.name).pathname,
            type: e.initiatorType,
          })),
        stylesheets: [...document.styleSheets].map((s) => ({
          href: s.href ? new URL(s.href).pathname : null,
          id: s.ownerNode?.id,
          text: [...s.cssRules].map((r) => r.cssText).join("\n"),
        })),
        inheritance: [
          ...document.querySelectorAll(
            "#comparison-pane, #comparison-pane button, #comparison-pane input, #comparison-pane label",
          ),
        ]
          .slice(0, 12)
          .map((e) => ({
            tag: e.tagName,
            classes: e.className,
            ancestors: [
              e,
              ...(function* (n) {
                while (n.parentElement) {
                  n = n.parentElement;
                  yield n;
                }
              })(e),
            ].map((n) => ({
              tag: n.tagName,
              classes: n.className,
              font: getComputedStyle(n).font,
              fontBody:
                getComputedStyle(n).getPropertyValue("--openui-font-body"),
              textBody: getComputedStyle(n).getPropertyValue(
                "--openui-text-body-default",
              ),
            })),
          })),
        pseudo: [
          ...document.querySelectorAll(".openui-image-block-wrapper"),
        ].map((e) =>
          Object.fromEntries(
            ["::before", "::after"].map((p) => [
              p,
              Object.fromEntries(
                [
                  "content",
                  "backgroundImage",
                  "backgroundSize",
                  "filter",
                  "opacity",
                  "inset",
                  "borderRadius",
                ].map((k) => [k, getComputedStyle(e, p)[k]]),
              ),
            ]),
          ),
        ),
      }));
      const cdp = await context.newCDPSession(page);
      await cdp.send("DOM.enable");
      await cdp.send("CSS.enable");
      const doc = await cdp.send("DOM.getDocument");
      const matched = [];
      for (const selector of [
        "#comparison-pane",
        "#comparison-pane button",
        "#comparison-pane input",
        ".openui-image-block-wrapper",
      ]) {
        const { nodeId } = await cdp.send("DOM.querySelector", {
          nodeId: doc.root.nodeId,
          selector,
        });
        if (!nodeId) continue;
        matched.push({
          selector,
          platformFonts: await cdp.send("CSS.getPlatformFontsForNode", {
            nodeId,
          }),
          matched: await cdp.send("CSS.getMatchedStylesForNode", { nodeId }),
        });
      }
      const pictures = [];
      for (let n = 0; n < 3; n++) {
        await page.waitForTimeout(200);
        const file = `${caseId}-${arm}-${n}.png`;
        await page.screenshot({
          path: path.join(output, file),
          fullPage: true,
          animations: "disabled",
        });
        pictures.push(file);
      }
      captures.push(pictures);
      arms.push({ arm, keyboardTrace, probes, diagnostics, matched });
      await context.close();
    }
    const comparisons = [];
    for (const [label, left, right] of [
      ["legacy-repeat", captures[0][0], captures[0][2]],
      ["migrated-repeat", captures[1][0], captures[1][2]],
      ["cross-arm", captures[0][2], captures[1][2]],
    ]) {
      const a = PNG.sync.read(await fs.readFile(path.join(output, left))),
        b = PNG.sync.read(await fs.readFile(path.join(output, right)));
      if (a.width !== b.width || a.height !== b.height) {
        comparisons.push({
          label,
          dimensions: [
            [a.width, a.height],
            [b.width, b.height],
          ],
        });
        continue;
      }
      const diff = new PNG({ width: a.width, height: a.height });
      const pixels = pixelmatch(a.data, b.data, diff.data, a.width, a.height, {
        threshold: 0,
        includeAA: true,
      });
      await fs.writeFile(
        path.join(output, `${caseId}-${label}-diff.png`),
        PNG.sync.write(diff),
      );
      comparisons.push({ label, pixels });
    }
    const evidence = {
      caseId,
      source: c.source,
      artifactIdentity: run.provenance.artifacts,
      comparisons,
      arms,
    };
    await fs.writeFile(
      path.join(output, caseId + ".json"),
      JSON.stringify(evidence, null, 2),
    );
    summaries.push({
      caseId,
      comparisons,
      fonts: arms.map((a) => a.diagnostics.fonts),
    });
  }
  await fs.writeFile(
    path.join(output, "summary.json"),
    JSON.stringify(summaries, null, 2),
  );
  console.log(JSON.stringify(summaries));
} finally {
  await browser.close();
  await app.close();
}
