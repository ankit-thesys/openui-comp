import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import http from "node:http";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repository = fileURLToPath(new URL("../../../../../../", import.meta.url));
const consumer = path.resolve(process.env.CORE_CONSUMER),
  tools = createRequire(path.resolve(process.env.CORE_BROWSER_TOOLS || consumer, "package.json"));
const { build } = tools("esbuild"),
  { chromium } = await import(pathToFileURL(process.env.CORE_PLAYWRIGHT).href);
const sass = createRequire(path.resolve(process.env.CORE_SASS_TOOLS, "package.json"))("sass");
const baseline = path.join(repository, "packages/react-ui/src/components");
const source = await fs.readFile(new URL("controls.fixture.tsx", import.meta.url), "utf8");
const oldNames = {
  Chips: ["Chips"],
  Select: [
    "Select",
    "SelectTrigger",
    "SelectContent",
    "SelectGroup",
    "SelectLabel",
    "SelectItem",
    "SelectSeparator",
    "SelectValue",
  ],
  Slider: ["Slider", "SliderBlock"],
  Calendar: ["Calendar"],
  DatePicker: ["DatePicker"],
  ThemeProvider: ["ThemeProvider"],
};
const oldPrefix =
  Object.entries(oldNames)
    .map(
      ([folder, names]) =>
        `import {${names.join(",")}} from ${JSON.stringify(path.join(baseline, folder))};`,
    )
    .join("\n") + `\nconst Core={${Object.values(oldNames).flat().join(",")}};`;
const scripts = {},
  graphs = {};
const hash = (data) => createHash("sha256").update(data).digest("hex");
for (const arm of ["baseline", "runtime"]) {
  const contents =
    arm === "baseline"
      ? source.replace('import * as Core from "@openuidev/react-ui-core";', oldPrefix)
      : source;
  const result = await build({
    stdin: { contents, resolveDir: consumer, loader: "tsx" },
    bundle: true,
    write: false,
    format: "esm",
    platform: "browser",
    jsx: "automatic",
    metafile: true,
    define: { "process.env.NODE_ENV": '"production"' },
    ...(arm === "baseline"
      ? {
          nodePaths: [consumer + "/node_modules"],
          alias: {
            react: consumer + "/node_modules/react",
            "react-dom": consumer + "/node_modules/react-dom",
          },
        }
      : {}),
  });
  if (arm === "runtime")
    assert(
      !Object.keys(result.metafile.inputs).some((file) => file.includes("packages/react-ui/src")),
      "runtime must not import old source",
    );
  scripts[arm] = result.outputFiles[0].text;
  graphs[arm] = hash(scripts[arm]);
}
// Legacy CSS is an explicit comparison input; it is never used by the candidate package build or runtime arm.
const legacyCss = sass.compile(path.join(baseline, "index.scss"), {
  style: "expanded",
  logger: sass.Logger.silent,
}).css;
const hostRoot = path.resolve(process.env.CORE_HOST_STYLES),
  hosts = {};
for (const framework of ["plain", "tailwind3", "tailwind4"])
  hosts[framework] = await fs.readFile(
    path.join(hostRoot, "frameworks", framework + ".css"),
    "utf8",
  );
const layout =
  "body{margin:0}#zone{width:100%;max-width:900px;padding:16px;box-sizing:border-box}#unrelated{font:17px/23px serif;color:rgb(11,22,33);padding:7px;background:rgb(240,241,242)}";
const server = http.createServer((req, res) => {
  const u = new URL(req.url, "http://localhost");
  if (u.pathname === "/baseline.js" || u.pathname === "/runtime.js") {
    res.setHeader("content-type", "text/javascript");
    return res.end(scripts[u.pathname.slice(1, -3)]);
  }
  if (u.pathname === "/baseline.css") {
    res.setHeader("content-type", "text/css");
    return res.end(legacyCss);
  }
  const framework = u.searchParams.get("framework"),
    arm = u.searchParams.get("arm");
  if (u.pathname.startsWith("/host/")) {
    res.setHeader("content-type", "text/css");
    return res.end(hosts[u.pathname.slice(6, -4)]);
  }
  if (!["baseline", "runtime"].includes(arm) || !hosts[framework]) {
    res.writeHead(404);
    return res.end();
  }
  res.setHeader("content-type", "text/html");
  res.end(
    `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">${arm === "baseline" ? '<link id="component-style" rel="stylesheet" href="/baseline.css">' : ""}<link id="host-style" rel="stylesheet" href="/host/${framework}.css"><style>${layout}</style></head><body><div id="app"></div><script type="module" src="/${arm}.js"></script></body></html>`,
  );
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const browser = await chromium.launch({ channel: "chrome", headless: true });
const result = {
  browser: browser.version(),
  graphs,
  legacyCssSha256: hash(legacyCss),
  hostHashes: Object.fromEntries(Object.entries(hosts).map(([k, v]) => [k, hash(v)])),
  fixtureSha256: hash(source),
  runnerSha256: hash(await fs.readFile(fileURLToPath(import.meta.url))),
  clock: "advancing Playwright clock initialized at 2026-10-24T12:00:00Z",
  cases: [],
  snapshots: 0,
  pending: ["OptionCards: shared markdown prerequisites require an ownership/scope decision"],
};
const properties = [
  "fontFamily",
  "fontSize",
  "fontWeight",
  "lineHeight",
  "letterSpacing",
  "fontVariationSettings",
  "backgroundColor",
  "color",
  "border",
  "borderRadius",
  "boxShadow",
  "padding",
  "margin",
  "gap",
  "display",
  "alignItems",
  "justifyContent",
  "boxSizing",
  "cursor",
  "resize",
  "outline",
  "outlineOffset",
  "opacity",
  "pointerEvents",
  "width",
  "height",
  "fill",
  "transform",
];
const selector =
  '[class*="openui-select"],[class*="openui-slider"],[class*="openui-chip"],[class*="openui-calendar"],[class*="openui-date-picker"],[class*="openui-input"]';
const settle = async (page) => {
  await page.waitForTimeout(150);
  await page.evaluate(() => {
    document.querySelectorAll('[class*="openui-"]').forEach((node) => getComputedStyle(node).color);
    for (const animation of document.getAnimations())
      if (Number.isFinite(animation.effect.getComputedTiming().iterations)) animation.finish();
  });
};
const snapshot = async (page) => {
  await settle(page);
  return page.locator(selector).evaluateAll(
    (nodes, props) =>
      nodes.map((node) => ({
        tag: node.tagName,
        classes: [...node.classList]
          .filter((name) => name.startsWith("openui-") && !name.startsWith("openui-theme-"))
          .sort(),
        style: Object.fromEntries(props.map((key) => [key, getComputedStyle(node)[key]])),
        disabled: node.hasAttribute("disabled") || node.hasAttribute("data-disabled"),
        state: node.getAttribute("data-state"),
      })),
    properties,
  );
};
const roots = {
  chips: ".openui-chips",
  select: "#trigger",
  slider: ".openui-slider-root",
  sliderBlock: ".openui-slider-root",
  calendar: ".openui-calendar-container",
  datePicker: ".openui-date-picker-renderer-floating-container",
};
const hoverTargets = {
  chips: ".openui-chip-item:not(:disabled):not(.openui-chip-item--selected)",
  select: "#trigger",
  slider: ".openui-slider-thumb-handle-inner",
  sliderBlock: ".openui-slider-thumb-handle-inner",
  calendar: '[data-day="2026-10-20"] button',
  datePicker: ".openui-date-picker-renderer-floating-input-container",
};
try {
  for (const framework of (process.env.CORE_MATRIX_FRAMEWORKS || "plain,tailwind3,tailwind4").split(
    ",",
  ))
    for (const order of ["before", "after"])
      for (const kind of (
        process.env.CORE_MATRIX_CASES || "chips,select,slider,sliderBlock,calendar,datePicker"
      ).split(",")) {
        const contexts = [],
          pages = [],
          errors = [];
        let comparisons = 0;
        try {
          for (const arm of ["baseline", "runtime"]) {
            const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
            contexts.push(context);
            const page = await context.newPage();
            pages.push(page);
            page.on("pageerror", (e) => errors.push(e.message));
            await page.clock.install({ time: new Date("2026-10-24T12:00:00Z") });
            await page.goto(
              `http://127.0.0.1:${server.address().port}/?arm=${arm}&case=${kind}&framework=${framework}`,
            );
            await page.locator(roots[kind]).waitFor();
            const clockBefore = await page.evaluate(() => Date.now());
            await page.waitForTimeout(30);
            assert(
              (await page.evaluate(() => Date.now())) > clockBefore,
              "Date.now must advance for debounce",
            );
            await page.evaluate(
              ({ arm, order }) => {
                const host = document.querySelector("#host-style"),
                  component = document.querySelector(
                    arm === "baseline" ? "#component-style" : "#_goober",
                  );
                if (order === "before") component.before(host);
                else component.after(host);
              },
              { arm, order },
            );
          }
          const compare = async (label) => {
            const [expected, actual] = await Promise.all(pages.map(snapshot));
            assert.equal(
              actual.length,
              expected.length,
              `${framework}/${order}/${kind}/${label}: node count`,
            );
            for (let i = 0; i < expected.length; i++)
              assert.deepEqual(
                actual[i],
                expected[i],
                `${framework}/${order}/${kind}/${label}/${i}/${expected[i].classes}`,
              );
            comparisons += expected.length;
          };
          for (const mode of ["none", "light", "dark", "custom-light", "custom-dark"]) {
            for (const page of pages) {
              await page.mouse.move(0, 0);
              await page.evaluate((mode) => window.setMode(mode), mode);
            }
            await compare(mode + "/normal");
            if (mode.startsWith("custom"))
              for (const page of pages) {
                const target =
                  kind === "chips"
                    ? ".openui-chip-item--selected"
                    : kind === "calendar"
                      ? ".openui-calendar-single-day-selected"
                      : kind === "select"
                        ? "#trigger"
                        : kind === "datePicker"
                          ? ".openui-date-picker-renderer-floating-input-container"
                          : ".openui-slider-range";
                const property =
                  kind === "chips"
                    ? "borderTopColor"
                    : ["select", "datePicker"].includes(kind)
                      ? "color"
                      : "backgroundColor";
                const expected =
                  kind === "chips"
                    ? "rgb(8, 90, 130)"
                    : ["select", "datePicker"].includes(kind)
                      ? "rgb(40, 70, 90)"
                      : "rgb(150, 50, 100)";
                assert.equal(
                  await page
                    .locator(target)
                    .evaluate((node, key) => getComputedStyle(node)[key], property),
                  expected,
                );
              }
            for (const page of pages) await page.locator(hoverTargets[kind]).first().hover();
            await compare(mode + "/hover");
            for (const page of pages) {
              await page.mouse.move(0, 0);
              await page.locator("#start").focus();
              await page.keyboard.press("Tab");
            }
            await compare(mode + "/keyboard-focus");
            for (const page of pages) {
              await page.locator("#start").focus();
              await page.evaluate(() => window.setDisabled(true));
            }
            await compare(mode + "/disabled");
            for (const page of pages) {
              await page.evaluate(() => {
                window.setDisabled(false);
                window.setOverrides(true);
              });
            }
            await compare(mode + "/override");
            for (const page of pages)
              assert.equal(
                await page.locator(roots[kind]).evaluate((node) => getComputedStyle(node).padding),
                "32px",
              );
            if (["select", "calendar", "datePicker", "chips"].includes(kind)) {
              for (const page of pages) await page.locator(roots[kind]).hover();
              await compare(mode + "/override-hover");
            }
            for (const page of pages) {
              await page.mouse.move(0, 0);
              await page.evaluate(() => window.setDisabled(true));
            }
            await compare(mode + "/override-disabled");
            for (const page of pages) {
              await page.evaluate(() => {
                window.setDisabled(false);
                window.setOverrides(false);
              });
            }
            if (kind === "select") {
              for (const size of ["sm", "md", "lg"]) {
                for (const page of pages) await page.evaluate((size) => window.setSize(size), size);
                await compare(mode + "/size-" + size);
              }
              for (const page of pages) {
                await page.locator("#trigger").click();
                await page.getByRole("listbox").waitFor();
              }
              await compare(mode + "/portal-open");
              for (const page of pages) await page.keyboard.press("Escape");
            }
            if (kind === "calendar") {
              for (const index of [0, 1]) {
                for (const page of pages) {
                  await page.getByRole("combobox").nth(index).click();
                  await page.getByRole("listbox").waitFor();
                }
                await compare(mode + "/caption-portal-" + index);
                for (const page of pages) await page.keyboard.press("Escape");
              }
            }
            if (kind === "slider") {
              for (const page of pages) await page.evaluate(() => window.setValues([0]));
              await compare(mode + "/at-min");
              for (const page of pages)
                await page.evaluate(() => {
                  window.setVariant("discrete");
                  window.setValues([20, 80]);
                });
              await compare(mode + "/discrete-range");
              for (const page of pages)
                await page.evaluate(() => {
                  window.setVariant("continuous");
                  window.setValues([20]);
                });
            }
            if (kind === "sliderBlock") {
              for (const page of pages) await page.locator("#zone input").fill("140");
              await compare(mode + "/validation-error");
              for (const page of pages) await page.locator("#zone input").fill("20");
              for (const page of pages)
                await page.evaluate(() => {
                  window.setBlockRange(true);
                  window.setVariant("discrete");
                });
              await compare(mode + "/discrete-range");
              for (const page of pages) await page.evaluate(() => window.setStreaming(true));
              await compare(mode + "/streaming");
              for (const page of pages)
                await page.evaluate(() => {
                  window.setStreaming(false);
                  window.setBlockRange(false);
                  window.setVariant("continuous");
                });
            }
            if (kind === "datePicker") {
              for (const page of pages) {
                await page.locator(hoverTargets[kind]).click();
                await page.locator(".openui-date-picker-renderer-floating-content").waitFor();
              }
              await compare(mode + "/portal-open");
              for (const page of pages) await page.locator("#unrelated").click();
            }
            for (const page of pages) {
              await page.setViewportSize({ width: 360, height: 900 });
              await page.mouse.move(0, 0);
            }
            await compare(mode + "/narrow");
            for (const page of pages) await page.setViewportSize({ width: 1280, height: 900 });
          }
          for (const page of pages) {
            const host = await page.locator("#unrelated").evaluate((node) => ({
              font: getComputedStyle(node).font,
              color: getComputedStyle(node).color,
              padding: getComputedStyle(node).padding,
            }));
            const sheet = (await page.locator("#_goober").count())
              ? await page.locator("#_goober").textContent()
              : null;
            await page.evaluate(() => window.setVisible(false));
            await page.locator(roots[kind]).waitFor({ state: "detached" });
            assert.equal(
              await page.locator(selector).count(),
              0,
              "owned portals unmount with controls",
            );
            await page.evaluate(() => window.setVisible(true));
            await page.locator(roots[kind]).waitFor();
            assert.deepEqual(
              await page.locator("#unrelated").evaluate((node) => ({
                font: getComputedStyle(node).font,
                color: getComputedStyle(node).color,
                padding: getComputedStyle(node).padding,
              })),
              host,
            );
            if (sheet) assert.equal(await page.locator("#_goober").textContent(), sheet);
          }
          assert.deepEqual(errors, []);
          result.cases.push({ framework, order, kind, comparisons, status: "passed" });
          result.snapshots += comparisons;
          console.log(`${framework}/${order}/${kind}: ${comparisons} comparisons passed`);
        } finally {
          await Promise.all(contexts.map((context) => context.close()));
        }
      }
  if (process.env.CORE_BROWSER_RESULTS)
    await fs.writeFile(process.env.CORE_BROWSER_RESULTS, JSON.stringify(result, null, 2) + "\n");
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
