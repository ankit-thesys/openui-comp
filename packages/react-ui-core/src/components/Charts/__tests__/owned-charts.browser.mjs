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
const repository = path.resolve(here, "../../../../../..");
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
const packageHash = hash(await fs.readFile(path.join(consumer, "package.json")));
const lockHash = hash(await fs.readFile(path.join(consumer, "package-lock.json")));
const unpack = await fs.mkdtemp(path.join(os.tmpdir(), "openui-owned-charts-archive-"));
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
  "PieChart",
  "RadialChart",
  "RadarChart",
  "HeatmapChart",
  "FunnelChart",
  "CalendarHeatmap",
  "SegmentedBar",
];
const publicCore = candidate("@openuidev/react-ui-core");
for (const name of required) assert(publicCore[name], `integrated root export missing: ${name}`);
const source = await fs.readFile(path.join(here, "owned-charts.fixture.tsx"), "utf8");
const baseline = path.join(repository, "packages/react-ui/src/components");
const legacyImports =
  required
    .map((name) => {
      const target =
        name === "ThemeProvider"
          ? path.join(baseline, name)
          : name === "PrintContextProvider"
            ? path.resolve(baseline, "../context/PrintContext")
            : path.join(baseline, "Charts", name);
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

const report = {
  status: "prepared",
  artifactRevision: revision,
  tarballSha256: expectedHash,
  tarballBytes: (await fs.stat(artifact)).size,
  implementationFiles,
  installedMatchesArchive: true,
  consumerLockSha256: lockHash,
  consumerPackageSha256: packageHash,
  fixtureSha256: hash(source),
  runnerSha256: hash(await fs.readFile(fileURLToPath(import.meta.url))),
  graphs,
  legacyCssSha256: hash(legacyCss),
  hostHashes: Object.fromEntries(Object.entries(hosts).map(([name, css]) => [name, hash(css)])),
  cases: [],
  snapshots: 0,
  inheritedObservations: [],
  exclusions: [
    "SSR/hydration/streaming/performance/memory not tested",
    "Settled styles/geometry, not transition-frame parity",
    "Math vendor delivery remains separate Vite evidence",
  ],
};
const save = () =>
  fs.writeFile(process.env.CORE_BROWSER_RESULTS, JSON.stringify(report, null, 2) + "\n");
if (process.argv.includes("--prepare-only")) {
  await save();
  console.log(
    "Prepared normal-installed matched owned Charts bundles and provenance; no Chrome launched.",
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
  "boxShadow",
  "transform",
  "whiteSpace",
  "opacity",
  "fill",
  "fillOpacity",
  "stroke",
  "strokeWidth",
  "strokeDasharray",
  "pointerEvents",
  "textAnchor",
  "transitionProperty",
  "transitionDuration",
  "animationDuration",
  "animationDelay",
  "animationTimingFunction",
  "animationFillMode",
];
const settle = async (page) => {
  await page.evaluate(async () => {
    document.querySelectorAll("#zone *").forEach((node) => getComputedStyle(node).color);
    for (const animation of document.getAnimations())
      if (Number.isFinite(animation.effect.getComputedTiming().iterations)) animation.finish();
    await document.fonts.ready;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
};
async function snapshot(page) {
  await settle(page);
  return page.locator("#zone *, .openui-chart-tooltip, .openui-chart-tooltip *").evaluateAll(
    (nodes, props) =>
      nodes.map((node) => {
        const style = getComputedStyle(node),
          rect = node.getBoundingClientRect();
        return {
          tag: node.tagName,
          classes: [...node.classList]
            .filter((name) => name.startsWith("openui-") && !name.startsWith("openui-theme-"))
            .sort(),
          text: node.childElementCount ? null : node.textContent,
          style: Object.fromEntries(props.map((key) => [key, style[key]])),
          rect: Object.fromEntries(
            ["x", "y", "width", "height"].map((key) => [key, Math.round(rect[key] * 1000) / 1000]),
          ),
          attrs: Object.fromEntries(
            [
              "role",
              "aria-label",
              "d",
              "points",
              "cx",
              "cy",
              "r",
              "x",
              "y",
              "width",
              "height",
              "rx",
              "fill",
              "stroke",
              "fill-opacity",
              "data-openui-chart",
            ].map((key) => [key, node.getAttribute(key)]),
          ),
          after: node.classList.contains("openui-heatmap-chart-color-scale-ramp--diverging")
            ? {
                width: getComputedStyle(node, "::after").width,
                background: getComputedStyle(node, "::after").backgroundColor,
              }
            : null,
        };
      }),
    properties,
  );
}
async function configure(pages, next) {
  for (const page of pages) {
    await page.evaluate((value) => window.configure(value), next);
    await page.waitForFunction(
      (value) =>
        Object.entries(value).every(
          ([key, expected]) =>
            JSON.parse(document.querySelector("[data-ready]").dataset.config)[key] === expected,
        ),
      next,
    );
    await settle(page);
  }
}
let browser;
try {
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  browser = await tools("playwright").chromium.launch({ channel: "chrome", headless: true });
  report.browser = browser.version();
  report.status = "running";
  for (const framework of ["plain", "tailwind3", "tailwind4"])
    for (const order of ["before", "after"]) {
      const contexts = [],
        pages = [],
        errors = [];
      let comparisons = 0;
      async function compare(label) {
        const [expected, actual] = await Promise.all(pages.map(snapshot));
        try {
          assert.deepEqual(actual, expected, `${framework}/${order}/${label}`);
        } catch (error) {
          report.failedComparison = { framework, order, label, expected, actual };
          throw error;
        }
        for (const page of pages) {
          assert.equal(
            await page.locator("#unrelated").evaluate((n) => getComputedStyle(n).color),
            "rgb(11, 22, 33)",
            "host sentinel color remains unchanged",
          );
          assert.equal(
            await page.locator("#independent span").evaluate((n) => getComputedStyle(n).color),
            "oklch(0.097 0 0)",
            "independent light scope remains isolated",
          );
        }
        comparisons += expected.length;
      }
      try {
        for (const arm of ["baseline", "runtime"]) {
          const context = await browser.newContext({
            viewport: { width: 1280, height: 1200 },
            reducedMotion: "reduce",
          });
          contexts.push(context);
          const page = await context.newPage();
          pages.push(page);
          page.setDefaultTimeout(10000);
          page.on("pageerror", (error) => errors.push({ arm, error: error.message }));
          page.on("requestfailed", (request) =>
            errors.push({ arm, url: request.url(), error: request.failure() }),
          );
          await page.goto(
            `http://127.0.0.1:${server.address().port}/?arm=${arm}&framework=${framework}`,
          );
          await page.waitForFunction(() => typeof window.mountCharts === "function");
          await page.evaluate(
            ({ arm, order }) => {
              const host = document.getElementById("host-style"),
                component = document.querySelector(
                  arm === "baseline" ? "#component-style" : "#_goober",
                );
              if (!component) throw Error("Component stylesheet missing");
              if (order === "before") component.before(host);
              else component.after(host);
            },
            { arm, order },
          );
          await page.evaluate(() => window.mountCharts());
          await page.locator("[data-ready]").waitFor();
        }
        for (const family of [
          "PieChart",
          "RadialChart",
          "RadarChart",
          "HeatmapChart",
          "FunnelChart",
          "CalendarHeatmap",
          "SegmentedBar",
        ]) {
          for (const theme of ["none", "light", "dark", "custom-light", "custom-dark"]) {
            await configure(pages, {
              family,
              theme,
              variant: false,
              empty: false,
              width: 520,
              height: 340,
              print: false,
              nested: false,
              overrides: false,
              animate: false,
            });
            for (const page of pages) await page.mouse.move(1100, 1000);
            await compare(`${family}/${theme}/default`);
            await configure(pages, { variant: true });
            await compare(`${family}/${theme}/variant`);
          }
          for (const width of [320, 399, 400, 650]) {
            await configure(pages, { theme: "light", width });
            await compare(`${family}/resize-${width}`);
          }
          await configure(pages, { width: 520, nested: true, theme: "custom-light" });
          await compare(`${family}/nested-theme`);
          await configure(pages, { nested: false, overrides: true });
          for (const page of pages) {
            assert.equal(
              await page
                .locator(".consumer-chart")
                .evaluate((n) => getComputedStyle(n).outlineColor),
              "rgb(200, 20, 30)",
              "explicit consumer root outline applies",
            );
            assert.equal(
              await page
                .locator(".consumer-chart")
                .evaluate((n) => getComputedStyle(n).outlineWidth),
              "3px",
            );
            const grid = page
              .locator('#zone [class*="-chart-grid"], #zone .openui-calendar-heatmap-separator')
              .first();
            if (await grid.count())
              assert.equal(
                await grid.evaluate((n) => getComputedStyle(n).stroke),
                "rgb(170, 20, 80)",
                "explicit descendant stroke applies",
              );
          }
          await compare(`${family}/explicit-overrides`);
          await configure(pages, { overrides: false, empty: true });
          await compare(`${family}/empty`);
          await configure(pages, { empty: false });
          await compare(`${family}/empty-recovery`);
          await configure(pages, { print: true });
          await compare(`${family}/export-provider`);
          for (const page of pages) await page.emulateMedia({ media: "print" });
          await compare(`${family}/print-media`);
          for (const page of pages) await page.emulateMedia({ media: "screen" });
          await configure(pages, { print: false, visible: false });
          await compare(`${family}/unmount`);
          await configure(pages, { visible: true });
          await compare(`${family}/remount`);
        }
        assert.deepEqual(errors, [], `${framework}/${order} browser errors`);
        report.cases.push({ framework, order, status: "passed", snapshots: comparisons });
        report.snapshots += comparisons;
        await save();
      } finally {
        for (const context of contexts) await context.close();
      }
    }
  report.status = "passed";
} catch (error) {
  report.status = "failed";
  report.error = error.stack;
  throw error;
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
  assert.equal(
    hash(await fs.readFile(path.join(consumer, "package.json"))),
    packageHash,
    "consumer package unchanged",
  );
  assert.equal(
    hash(await fs.readFile(path.join(consumer, "package-lock.json"))),
    lockHash,
    "consumer lock unchanged",
  );
  assert.deepEqual(
    await manifest(candidatePath),
    implementationFiles,
    "installed implementation unchanged",
  );
  await save();
}
console.log(
  JSON.stringify({
    status: report.status,
    cases: report.cases.length,
    snapshots: report.snapshots,
    browser: report.browser,
  }),
);
