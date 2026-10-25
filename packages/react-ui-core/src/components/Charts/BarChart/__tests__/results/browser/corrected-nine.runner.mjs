import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import http from "node:http";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repository = path.resolve(here, "../../../../../../..");
const consumer = path.resolve(process.env.CORE_CONSUMER);
const artifact = path.resolve(process.env.CORE_ARTIFACT_PATH);
const revision = process.env.CORE_ARTIFACT_REVISION;
const expectedHash = process.env.CORE_ARTIFACT_SHA256;
assert(/^[a-f0-9]{40}$/i.test(revision || ""), "full integrated revision required");
assert(/^[a-f0-9]{64}$/i.test(expectedHash || ""), "expected tarball SHA256 required");
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
assert.equal(hash(await fs.readFile(artifact)), expectedHash, "exact frozen tarball");
const candidatePath = path.join(consumer, "node_modules/@openuidev/react-ui-core");
assert(!(await fs.lstat(candidatePath)).isSymbolicLink(), "normal npm package required");
async function manifest(directory) {
  const files = {};
  async function visit(current) {
    for (const name of (await fs.readdir(current)).sort()) {
      const file = path.join(current, name),
        stat = await fs.lstat(file);
      if (stat.isDirectory()) await visit(file);
      else {
        assert(stat.isFile(), "installed package files must be regular files");
        const data = await fs.readFile(file);
        files[path.relative(directory, file)] = { bytes: data.length, sha256: hash(data) };
      }
    }
  }
  await visit(directory);
  return files;
}
const implementationFiles = await manifest(candidatePath);
const lockHash = hash(await fs.readFile(path.join(consumer, "package-lock.json")));
const unpack = await fs.mkdtemp(path.join(os.tmpdir(), "openui-cartesian-archive-"));
try {
  const entries = execFileSync("tar", ["-tzf", artifact], { encoding: "utf8" }).trim().split("\n");
  assert(entries.every((name) => name.startsWith("package/") && !name.split("/").includes("..")));
  execFileSync("tar", ["-xzf", artifact, "-C", unpack]);
  assert.deepEqual(
    implementationFiles,
    await manifest(path.join(unpack, "package")),
    "installed files match tarball",
  );
} finally {
  await fs.rm(unpack, { recursive: true, force: true });
}
const tools = createRequire(path.join(process.env.CORE_BROWSER_TOOLS || consumer, "package.json"));
const candidate = createRequire(path.join(candidatePath, "package.json"));
const { build } = tools("esbuild");
const required = [
  "ThemeProvider",
  "PrintContextProvider",
  "AreaChart",
  "AreaChartCondensed",
  "LineChart",
  "LineChartCondensed",
  "BarChart",
  "BarChartCondensed",
  "HorizontalBarChart",
  "ScatterChart",
  "MiniAreaChart",
  "MiniBarChart",
  "MiniLineChart",
];
const publicCore = candidate("@openuidev/react-ui-core");
for (const name of required) assert(publicCore[name], `integrated root export missing: ${name}`);
const source = await fs.readFile(path.join(here, "charts.fixture.tsx"), "utf8");
const baseline = path.join(repository, "packages/react-ui/src/components");
const legacyImports =
  required
    .map((name) => {
      const family = name === "HorizontalBarChart" ? "BarChart" : name.replace("Condensed", "");
      const target =
        name === "PrintContextProvider"
          ? path.join(repository, "packages/react-ui/src/context/PrintContext")
          : name === "ThemeProvider"
            ? path.join(baseline, family)
            : path.join(baseline, "Charts", family);
      return `import {${name}} from ${JSON.stringify(target)};`;
    })
    .join("\n") + `\nconst Core={${required.join(",")}};`;
const alias = Object.fromEntries(
  [
    "react",
    "react-dom",
    "lucide-react",
    "zod",
    "react-markdown",
    "remark-gfm",
    "remark-breaks",
    "@radix-ui/react-tooltip",
  ].map((name) => [
    name,
    ["react", "react-dom", "lucide-react", "zod"].includes(name)
      ? path.dirname(candidate.resolve(name + "/package.json"))
      : candidate.resolve(name),
  ]),
);
const scripts = {},
  graphs = {};
for (const arm of ["baseline", "runtime"]) {
  const result = await build({
    stdin: {
      contents:
        arm === "baseline"
          ? source.replace('import * as Core from "@openuidev/react-ui-core";', legacyImports)
          : source,
      resolveDir: consumer,
      loader: "tsx",
    },
    bundle: true,
    write: false,
    format: "esm",
    platform: "browser",
    jsx: "automatic",
    metafile: true,
    define: { "process.env.NODE_ENV": '"production"' },
    // These fixtures do not use math; Vite owns the separately validated vendor-CSS contract.
    external: ["katex/dist/katex.min.css"],
    ...(arm === "baseline" ? { alias, nodePaths: [path.join(consumer, "node_modules")] } : {}),
  });
  scripts[arm] = result.outputFiles[0].text;
  if (arm === "runtime") {
    assert(
      !Object.keys(result.metafile.inputs).some((name) => name.includes("packages/react-ui/src")),
    );
    assert(
      !scripts[arm].includes("katex/dist/katex.min.css"),
      "no hidden math CSS import in the browser fixture",
    );
  }
  graphs[arm] = { sha256: hash(scripts[arm]), bytes: Buffer.byteLength(scripts[arm]) };
}
const sass = createRequire(path.join(process.env.CORE_SASS_TOOLS, "package.json"))("sass");
const legacyCss = sass.compile(path.join(baseline, "index.scss"), {
  style: "expanded",
  logger: sass.Logger.silent,
}).css;
const hosts = {};
for (const framework of ["plain", "tailwind3", "tailwind4"])
  hosts[framework] = await fs.readFile(
    path.join(process.env.CORE_HOST_STYLES, "frameworks", framework + ".css"),
    "utf8",
  );
const image = await fs.readFile(path.join(here, "../../../Sources/__tests__/image.svg"));
const report = {
  status: "prepared",
  artifactRevision: revision,
  tarballSha256: expectedHash,
  tarballBytes: (await fs.stat(artifact)).size,
  implementationFiles,
  installedMatchesArchive: true,
  consumerLockSha256: lockHash,
  fixtureSha256: hash(source),
  runnerSha256: hash(await fs.readFile(fileURLToPath(import.meta.url))),
  graphs,
  legacyCssSha256: hash(legacyCss),
  imageSha256: hash(image),
  hostHashes: Object.fromEntries(Object.entries(hosts).map(([name, css]) => [name, hash(css)])),
  cases: [],
  snapshots: 0,
  inheritedObservations: [],
  exclusions: [
    "SSR/hydration/streaming/performance/memory not tested",
    "Reference baseline remains read-only; unsupported inherited behavior is reported separately",
    "Settled style/geometry parity, not frame-by-frame animation timing equivalence",
    "Math vendor delivery remains separate Vite evidence",
  ],
};
const save = () =>
  fs.writeFile(process.env.CORE_BROWSER_RESULTS, JSON.stringify(report, null, 2) + "\n");
if (process.argv.includes("--prepare-only")) {
  await save();
  console.log(
    "Prepared normal-installed matched Cartesian/mini bundles and provenance; no Chrome launched.",
  );
  process.exit(0);
}
const server = http.createServer((request, response) => {
  const url = new URL(request.url, "http://localhost");
  if (["/baseline.js", "/runtime.js"].includes(url.pathname)) {
    response.setHeader("content-type", "text/javascript");
    response.end(scripts[url.pathname.slice(1, -3)]);
    return;
  }
  if (url.pathname === "/baseline.css") {
    response.setHeader("content-type", "text/css");
    response.end(legacyCss);
    return;
  }
  if (url.pathname === "/image.svg") {
    response.setHeader("content-type", "image/svg+xml");
    response.end(image);
    return;
  }
  if (url.pathname.startsWith("/host/")) {
    response.setHeader("content-type", "text/css");
    response.end(hosts[url.pathname.slice(6, -4)]);
    return;
  }
  const arm = url.searchParams.get("arm"),
    framework = url.searchParams.get("framework");
  if (!scripts[arm] || !hosts[framework]) {
    response.writeHead(404);
    response.end();
    return;
  }
  response.setHeader("content-type", "text/html");
  response.end(
    `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,">${arm === "baseline" ? '<link id="component-style" rel="stylesheet" href="/baseline.css">' : ""}<link id="host-style" rel="stylesheet" href="/host/${framework}.css"><style>body{margin:0}#zone{width:100%;max-width:1100px;padding:16px;box-sizing:border-box}#unrelated{font:17px/23px serif;color:rgb(11,22,33);padding:7px;background:rgb(240,241,242)}</style></head><body><div id="app"></div><script type="module" src="/${arm}.js"></script></body></html>`,
  );
});
const properties = [
  "fontFamily",
  "fontSize",
  "fontWeight",
  "lineHeight",
  "letterSpacing",
  "fontVariationSettings",
  "color",
  "backgroundColor",
  "border",
  "borderRadius",
  "padding",
  "margin",
  "gap",
  "display",
  "boxSizing",
  "alignItems",
  "justifyContent",
  "flexDirection",
  "flexWrap",
  "flexGrow",
  "flexShrink",
  "gridTemplateColumns",
  "gridColumn",
  "width",
  "height",
  "minWidth",
  "minHeight",
  "maxWidth",
  "overflow",
  "overflowX",
  "overflowY",
  "position",
  "cursor",
  "outline",
  "outlineOffset",
  "boxShadow",
  "transform",
  "scale",
  "textOverflow",
  "whiteSpace",
  "scrollbarWidth",
  "opacity",
  "objectFit",
  "fill",
  "stroke",
  "strokeWidth",
  "strokeDasharray",
  "transformOrigin",
  "pointerEvents",
  "maskImage",
  "webkitMaskImage",
];
const selector =
  '#zone [class*="openui-"],#zone svg,#zone svg *,.openui-portal-tooltip,.openui-portal-tooltip *';
const settle = (page) =>
  page.evaluate(async () => {
    document.querySelectorAll('[class*="openui-"]').forEach((node) => getComputedStyle(node).color);
    for (const animation of document.getAnimations())
      if (Number.isFinite(animation.effect.getComputedTiming().iterations)) animation.finish();
    await document.fonts.ready;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
async function snapshot(page) {
  await settle(page);
  return page.locator(selector).evaluateAll(
    (nodes, props) =>
      nodes.map((node) => {
        const style = getComputedStyle(node),
          rect = node.getBoundingClientRect();
        return {
          tag: node.tagName,
          classes: [...node.classList]
            .filter((name) => name.startsWith("openui-") && !name.startsWith("openui-theme-"))
            .sort(),
          text: node.textContent,
          attrs: Object.fromEntries(
            [
              "d",
              "x",
              "y",
              "x1",
              "x2",
              "y1",
              "y2",
              "cx",
              "cy",
              "r",
              "width",
              "height",
              "transform",
              "aria-label",
              "data-openui-chart",
            ].map((key) => [key, node.getAttribute(key)]),
          ),
          style: Object.fromEntries(props.map((key) => [key, style[key]])),
          rect: Object.fromEntries(
            ["x", "y", "width", "height"].map((key) => [key, Math.round(rect[key] * 1000) / 1000]),
          ),
          checked: node.getAttribute("aria-checked"),
          disabled: node instanceof HTMLButtonElement ? node.disabled : null,
          role: node.getAttribute("role"),
          tabIndex: node.getAttribute("tabindex"),
          state: node.getAttribute("data-state"),
          side: node.getAttribute("data-side"),
        };
      }),
    properties,
  );
}
async function configure(pages, next) {
  for (const page of pages) {
    await page.evaluate((value) => window.configure(value), next);
    await page.waitForFunction((value) => {
      const current = JSON.parse(document.querySelector("[data-ready]").dataset.config);
      return Object.entries(value).every(([key, expected]) => current[key] === expected);
    }, next);
    await page.waitForFunction(() => [...document.images].every((image) => image.complete));
    await settle(page);
  }
}
const families = [
  "area",
  "area-condensed",
  "line",
  "line-condensed",
  "bar",
  "bar-condensed",
  "horizontal",
  "scatter",
  "mini-area",
  "mini-bar",
  "mini-line",
];
const selectedFamilies = process.env.CORE_CHART_FAMILIES
  ? process.env.CORE_CHART_FAMILIES.split(",")
  : families;
assert(
  selectedFamilies.length && selectedFamilies.every((family) => families.includes(family)),
  "known selected chart families",
);
report.selectedFamilies = selectedFamilies;
const markSelector = (family) =>
  family.startsWith("mini")
    ? `.openui-${family}-chart-container svg`
    : family.startsWith("area")
      ? ".openui-area-chart-area-path"
      : family.startsWith("line")
        ? ".openui-line-chart-line"
        : family === "scatter"
          ? ".openui-scatter-chart-dot"
          : family === "horizontal"
            ? ".openui-horizontal-bar-chart-bar"
            : ".openui-bar-chart-bar";
const center = async (page, locator) => {
  const box = await locator.boundingBox();
  assert(box && box.width > 0 && box.height > 0, "real visible chart hit target");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
};
report.inheritedUnstableScenarios = [];
report.continueInheritedInstability = process.env.CORE_CONTINUE_INHERITED_INSTABILITY === "1";
let browser;
try {
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const { chromium } = tools("playwright");
  browser = await chromium.launch({ channel: "chrome", headless: true });
  report.browser = browser.version();
  report.status = "running";
  for (const framework of ["plain", "tailwind3", "tailwind4"])
    for (const order of ["before", "after"]) {
      const contexts = [],
        pages = [],
        errors = [];
      let comparisons = 0;
      const compare = async (label) => {
        // Resize/font measurement and spring followers settle asynchronously in the browser.
        let expected, actual, previous;
        let stableSamples = 0;
        for (let attempt = 0; attempt < 30; attempt++) {
          [expected, actual] = await Promise.all(pages.map(snapshot));
          try {
            assert.deepEqual(actual, expected);
            const current = JSON.stringify(expected);
            stableSamples = current === previous ? stableSamples + 1 : 1;
            previous = current;
            if (stableSamples >= 3) {
              comparisons += expected.length;
              return;
            }
          } catch {
            previous = undefined;
            stableSamples = 0;
          }
          if (attempt < 29) await Promise.all(pages.map((page) => page.waitForTimeout(100)));
        }
        report.failedComparison = { framework, order, label, expected, actual, stableSamples };
        report.layoutTrace = await Promise.all(
          pages.map((page) =>
            page.evaluate(async () => {
              const node = document.querySelector(
                ".openui-horizontal-bar-chart-container-inner-wrapper",
              );
              if (!node) return null;
              const frames = [];
              for (let i = 0; i < 120; i++) {
                await new Promise((resolve) => requestAnimationFrame(resolve));
                frames.push({
                  inline: node.style.height,
                  measured: node.getBoundingClientRect().height,
                });
              }
              return frames;
            }),
          ),
        );
        report.fontDiagnostic = await Promise.all(
          pages.map((page) =>
            page.evaluate(() => {
              const root = document.querySelector(".consumer-chart");
              const tick = document.querySelector(".openui-line-chart-y-tick");
              if (!root || !tick) return null;
              const rootStyle = getComputedStyle(root),
                tickStyle = getComputedStyle(tick);
              const canvas = document.createElement("canvas"),
                context = canvas.getContext("2d");
              const measurementFont =
                rootStyle.getPropertyValue("--openui-text-label-xs").trim() ||
                '400 12px/1.25 "Inter", sans-serif';
              context.font = measurementFont;
              const unspaced = context.measureText("-10").width;
              context.letterSpacing = tickStyle.letterSpacing;
              return {
                cssFont: rootStyle.getPropertyValue("--openui-text-label-xs"),
                cssTracking: rootStyle.getPropertyValue("--openui-text-label-xs-letter-spacing"),
                renderedFont: tickStyle.font,
                measurementFont,
                renderedTracking: tickStyle.letterSpacing,
                unspaced,
                renderedSpacingWidth: context.measureText("-10").width,
              };
            }),
          ),
        );

        assert.deepEqual(actual, expected, `${framework}/${order}/${label}`);
        assert.fail(`${label}: paired snapshots did not remain unchanged for three samples`);
      };
      try {
        for (const arm of ["baseline", "runtime"]) {
          const context = await browser.newContext({ viewport: { width: 1280, height: 1200 } });
          contexts.push(context);
          const page = await context.newPage();
          pages.push(page);
          page.setDefaultTimeout(10000);
          page.on("pageerror", (error) => errors.push({ arm, error: error.message }));
          page.on("requestfailed", (request) =>
            errors.push({ arm, url: request.url(), error: request.failure() }),
          );
          page.on("response", (response) => {
            if (response.status() >= 400)
              errors.push({ arm, url: response.url(), status: response.status() });
          });
          await page.goto(
            `http://127.0.0.1:${server.address().port}/?arm=${arm}&framework=${framework}`,
          );
          await page.waitForFunction(() => typeof window.mountCharts === "function");
          await page.evaluate(
            ({ arm, order }) => {
              const host = document.getElementById("host-style");
              const component = document.querySelector(
                arm === "baseline" ? "#component-style" : "#_goober",
              );
              if (!component) throw Error("Component stylesheet missing");
              if (order === "before") component.before(host);
              else component.after(host);
              if (
                Boolean(
                  host.compareDocumentPosition(component) & Node.DOCUMENT_POSITION_FOLLOWING,
                ) !==
                (order === "before")
              )
                throw Error("Initial host stylesheet order mismatch");
            },
            { arm, order },
          );
          await page.evaluate(() => window.mountCharts());
          await page.locator("[data-ready]").waitFor();
        }
        for (const family of selectedFamilies) {
          await configure(pages, {
            family,
            theme: "light",
            nested: false,
            overrides: false,
            visible: true,
            width: 640,
            height: 320,
            empty: false,
            updated: false,
            animation: false,
            legend: true,
            grid: true,
            palette: false,
            stacked: true,
            sizeMode: "container",
            miniSize: 120,
            print: false,
            longLabels: false,
            fitLegend: true,
          });
          for (const page of pages) await page.locator("#zone svg[role=img]").first().waitFor();
          for (const theme of ["none", "light", "dark", "custom-light", "custom-dark"]) {
            await configure(pages, { theme });
            for (const page of pages) await page.mouse.move(0, 0);
            await compare(`${family}/${theme}`);
          }
          await configure(pages, { theme: "custom-light", nested: true, palette: true });
          await compare(`${family}/nested-custom-palette`);
          const themeColors = await Promise.all(
            pages.map((page) =>
              page
                .locator("#outer-color,#independent-color")
                .evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).color)),
            ),
          );
          assert.deepEqual(themeColors[1], themeColors[0]);
          assert.notEqual(themeColors[0][0], themeColors[0][1]);
          await configure(pages, { theme: "light", nested: false, palette: false });
          for (const width of [280, 480, 768]) {
            await configure(pages, { width });
            await compare(`${family}/container-resize-${width}`);
          }
          if (family.startsWith("mini")) {
            for (const miniSize of [80, 160, "100%"]) {
              await configure(pages, { miniSize });
              await compare(`${family}/mini-size-${miniSize}`);
            }
            await configure(pages, { miniSize: 120 });
          } else {
            for (const sizeMode of ["number", "string"]) {
              await configure(pages, { width: 640, sizeMode });
              await compare(`${family}/size-prop-${sizeMode}`);
            }
            for (const height of [240, "280px"]) {
              await configure(pages, { height });
              if (
                family === "horizontal" &&
                typeof height === "string" &&
                process.env.CORE_CONTINUE_INHERITED_INSTABILITY === "1"
              ) {
                const traces = await Promise.all(
                  pages.map((page) =>
                    page
                      .locator(".openui-horizontal-bar-chart-container-inner-wrapper")
                      .evaluate(async (node) => {
                        const frames = [];
                        for (let i = 0; i < 120; i++) {
                          await new Promise((resolve) => requestAnimationFrame(resolve));
                          frames.push({
                            inline: node.style.height,
                            measured: node.getBoundingClientRect().height,
                          });
                        }
                        return frames;
                      }),
                  ),
                );
                const states = traces.map((trace) =>
                  [...new Set(trace.map((frame) => JSON.stringify(frame)))].sort(),
                );
                assert(
                  states[0].length >= 3 && states[1].length >= 3,
                  "both existing implementations exhibit the height feedback cycle",
                );
                report.inheritedUnstableScenarios.push({
                  framework,
                  order,
                  family,
                  scenario: "string-height with fitting legend",
                  reason: "inherited ResizeObserver feedback; frame-level parity is not certified",
                  traces,
                  states,
                  observedStateSetsEqual: JSON.stringify(states[1]) === JSON.stringify(states[0]),
                });
                await configure(pages, { height: 320, legend: false, fitLegend: false });
                await configure(pages, { height: "280px" });
                await compare(`${family}/string-height-no-legend-fit-separate-scenario`);
                await configure(pages, { height: 320, legend: true, fitLegend: true });
              } else await compare(`${family}/height-prop-${height}`);
            }
            await configure(pages, { height: 320 });
          }
          await configure(pages, { sizeMode: "container", width: 640, empty: true });
          for (const page of pages) {
            if (!family.startsWith("mini"))
              assert.equal(await page.locator("#sizing-parent").textContent(), "No data available");
          }
          await compare(`${family}/empty`);
          await configure(pages, {
            empty: false,
            updated: true,
            grid: false,
            legend: false,
            stacked: false,
          });
          for (const page of pages) await page.locator("#zone svg[role=img]").first().waitFor();
          await compare(`${family}/live-populated-options`);
          await configure(pages, { updated: false, grid: true, legend: true, stacked: true });
          for (const page of pages) {
            await page.evaluate(() => window.clearEvents());
            const target = page.locator(markSelector(family)).first();
            await target.waitFor();
            const point = await center(page, target);
            if (!family.startsWith("mini")) await page.locator(".openui-chart-tooltip").waitFor();
            await page.mouse.click(point.x, point.y);
            const events = await page.evaluate(() => window.readEvents());
            if (family === "horizontal")
              assert.deepEqual(events, [], "inherited horizontal onClick is not wired");
            else {
              assert.equal(events.length, 1);
              assert.equal(events[0].kind, family);
              if (family.startsWith("mini"))
                assert.deepEqual(events[0].args, [{ type: "click", tag: "DIV" }]);
              else if (family === "scatter")
                assert.deepEqual(events[0].args, [{ x: 10, y: 20 }, "Alpha", 0, 0]);
              else {
                const [row, index] = events[0].args;
                assert(Number.isInteger(index) && index >= 0 && index <= 2);
                assert.deepEqual(
                  row,
                  [
                    { name: "Q1", Alpha: 10, Beta: 15 },
                    { name: "Q2", Alpha: 20, Beta: -8 },
                    { name: "Q3", Alpha: 30, Beta: 15 },
                  ][index],
                );
              }
            }
          }
          await compare(`${family}/pointer-tooltip-callback`);
          for (const page of pages) await page.mouse.move(0, 0);
          if (!family.startsWith("mini")) {
            for (const page of pages) {
              await page.locator(".openui-chart-tooltip").waitFor({ state: "detached" });
              const count = await page.locator(markSelector(family)).count();
              await page.locator(".openui-chart-legend-item").first().click();
              await page.waitForFunction(
                ({ selector, count }) => document.querySelectorAll(selector).length < count,
                { selector: markSelector(family), count },
              );
              assert.equal(
                await page
                  .locator(".openui-chart-legend-item")
                  .first()
                  .evaluate((node) => getComputedStyle(node).opacity),
                "0.3",
              );
            }
            await compare(`${family}/legend-hidden`);
            for (const page of pages)
              await page.locator(".openui-chart-legend-item").first().click();
            await compare(`${family}/legend-restored`);
          }
          if (!family.startsWith("mini") && family !== "scatter") {
            await configure(pages, {
              updated: true,
              longLabels: true,
              width: 280,
              height: family === "horizontal" ? 160 : 320,
            });
            const prefix =
              family === "horizontal"
                ? "horizontal-bar-chart"
                : family.startsWith("area")
                  ? "area-chart"
                  : family.startsWith("line")
                    ? "line-chart"
                    : "bar-chart";
            if (family.endsWith("condensed")) {
              await compare(`${family}/long-condensed-labels`);
            } else {
              for (const page of pages) {
                const viewport = page.locator(`.openui-${prefix}-main-container`);
                const vertical = family === "horizontal";
                const button = page.locator(
                  vertical
                    ? ".openui-chart-vertical-scroll-button--down"
                    : ".openui-chart-horizontal-scroll-button--right",
                );
                await button.waitFor();
                assert.equal(await button.isDisabled(), false, "overflow scroll control enabled");
                const before = await viewport.evaluate(
                  (node, vertical) => (vertical ? node.scrollTop : node.scrollLeft),
                  vertical,
                );
                await button.focus();
                await page.keyboard.press("Enter");
                await page.waitForFunction(
                  ({ selector, before, vertical }) => {
                    const node = document.querySelector(selector);
                    return (vertical ? node.scrollTop : node.scrollLeft) > before;
                  },
                  { selector: `.openui-${prefix}-main-container`, before, vertical },
                );
                await viewport.evaluate(
                  async (node, { before, vertical }) => {
                    const position = () => (vertical ? node.scrollTop : node.scrollLeft);
                    let previous = position();
                    let lastChange = performance.now();
                    const deadline = performance.now() + 6000;
                    while (performance.now() < deadline) {
                      await new Promise((resolve) => requestAnimationFrame(resolve));
                      const current = position();
                      if (current !== previous) {
                        previous = current;
                        lastChange = performance.now();
                      }
                      if (current > before && performance.now() - lastChange >= 200) return;
                    }
                    throw Error("Native scroll did not reach a stable changed position");
                  },
                  { before, vertical },
                );
              }
              await compare(`${family}/native-keyboard-scroll`);
            }
            await configure(pages, { updated: false, longLabels: false, width: 640, height: 320 });
          }
          await configure(pages, { overrides: true });
          for (const page of pages)
            assert.equal(
              await page
                .locator(".consumer-chart")
                .evaluate((node) => getComputedStyle(node).padding),
              "32px",
            );
          await compare(`${family}/explicit-overrides`);
          await configure(pages, { overrides: false, animation: false });
          const animationSamples = [];
          for (const page of pages) {
            await page.evaluate(() => window.configure({ animation: true }));
            await page.waitForFunction(() =>
              document
                .getAnimations()
                .some((animation) => animation.effect.target.closest("#zone")),
            );
            animationSamples.push(
              await page.evaluate(() =>
                document
                  .getAnimations()
                  .filter((animation) => animation.effect.target.closest("#zone"))
                  .map((animation) => ({
                    duration: animation.effect.getTiming().duration,
                    easing: animation.effect.getTiming().easing,
                  })),
              ),
            );
          }
          assert.deepEqual(animationSamples[1], animationSamples[0]);
          assert(animationSamples[0].length > 0);
          await compare(`${family}/entrance-settled`);
          for (const page of pages) await page.emulateMedia({ reducedMotion: "reduce" });
          await configure(pages, { animation: false });
          await configure(pages, { animation: true });
          for (const page of pages)
            assert.equal(
              await page.evaluate(
                () =>
                  document
                    .getAnimations()
                    .filter((animation) => animation.effect.target.closest("#zone")).length,
              ),
              0,
              "reduced motion suppresses decorative CSS entrances",
            );
          await compare(`${family}/reduced-motion`);
          for (const page of pages)
            await page.emulateMedia({ media: "print", reducedMotion: "no-preference" });
          await configure(pages, { print: true });
          for (const page of pages) {
            const raw = await page.locator(".consumer-chart").getAttribute("data-openui-chart");
            if (family.startsWith("mini") || family === "scatter") assert.equal(raw, null);
            else {
              assert(raw, "existing React PrintContext export metadata");
              const metadata = JSON.parse(raw);
              assert.equal(
                metadata.type,
                family.startsWith("area") ? "area" : family.startsWith("line") ? "line" : "bar",
              );
              assert.equal(metadata.data.length, 2);
              if (family === "horizontal") assert.equal(metadata.options.barDir, "bar");
            }
          }
          await compare(`${family}/print-media-and-export-context`);
          for (const page of pages) await page.emulateMedia({ media: "screen" });
          await configure(pages, { print: false, animation: false });
          const themeCounts = await Promise.all(
            pages.map((page) => page.locator("style[data-openui-theme]").count()),
          );
          await configure(pages, { visible: false });
          for (const page of pages) assert.equal(await page.locator("#sizing-parent").count(), 0);
          await configure(pages, { visible: true });
          for (const [index, page] of pages.entries()) {
            await page.locator("#zone svg[role=img]").first().waitFor();
            assert.equal(
              await page.locator("style[data-openui-theme]").count(),
              themeCounts[index],
            );
            assert.equal(
              await page.locator("#unrelated").evaluate((node) => getComputedStyle(node).color),
              "rgb(11, 22, 33)",
            );
          }
          await compare(`${family}/remount-cleanup`);
          report.inheritedObservations.push({
            framework,
            order,
            family,
            horizontalCallbackWired: family === "horizontal" ? false : undefined,
            scatterPrintMetadata: family === "scatter" ? false : undefined,
            animationSamples: animationSamples[0],
          });
          console.log(
            JSON.stringify({
              framework,
              order,
              family,
              status: "passed",
              cumulativeObservations: comparisons,
            }),
          );
          await save();
        }
        assert.equal(await pages[1].locator("#_goober").count(), 1);
        assert.deepEqual(errors, []);
        report.cases.push({
          framework,
          order,
          status: "passed",
          families: selectedFamilies.length,
          snapshots: comparisons,
        });
        report.snapshots += comparisons;
      } finally {
        for (const context of contexts) await context.close();
        await save();
      }
    }
  report.status = report.inheritedUnstableScenarios.length
    ? "completed-with-inherited-instability"
    : "passed";
} catch (error) {
  report.status = "failed";
  report.error = String(error);
  throw error;
} finally {
  if (browser) await browser.close();
  if (server.listening) await new Promise((resolve) => server.close(resolve));
  report.consumerUnchanged = {
    lock: lockHash === hash(await fs.readFile(path.join(consumer, "package-lock.json"))),
    package: JSON.stringify(implementationFiles) === JSON.stringify(await manifest(candidatePath)),
  };
  await save();
  assert(report.consumerUnchanged.lock && report.consumerUnchanged.package);
}
console.log(
  JSON.stringify({
    status: report.status,
    cases: report.cases.length,
    snapshots: report.snapshots,
  }),
);
