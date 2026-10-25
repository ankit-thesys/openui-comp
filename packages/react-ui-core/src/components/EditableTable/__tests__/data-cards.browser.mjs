import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import http from "node:http";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repository = path.resolve(here, "../../../../../..");
const consumer = path.resolve(process.env.CORE_CONSUMER);
const tools = createRequire(
  path.resolve(process.env.CORE_BROWSER_TOOLS || consumer, "package.json"),
);
const { build } = tools("esbuild");
const candidatePath = path.join(consumer, "node_modules/@openuidev/react-ui-core");
assert(
  !(await fs.lstat(candidatePath)).isSymbolicLink(),
  "use a normally installed packed package, not a workspace/scratch symlink",
);
const candidate = createRequire(path.join(candidatePath, "package.json"));
const required = [
  "ThemeProvider",
  "InlineMarkdownRenderer",
  "TextBlockView",
  "Button",
  "Tag",
  "EditableTable",
  "EditableTableChangesBar",
  "CompositeCardBlock",
  "CompositeCard",
  "ContextCardBlock",
  "ContextCard",
  "VisualCardBlock",
  "VisualCard",
];
const exports = candidate("@openuidev/react-ui-core");
for (const name of required)
  assert(exports[name], `integrated public root export required: ${name}`);
const hash = (value) => createHash("sha256").update(value).digest("hex");
const source = await fs.readFile(path.join(here, "data-cards.fixture.tsx"), "utf8");
const baseline = path.join(repository, "packages/react-ui/src/components");
const legacyPrefix =
  required
    .map((name) => {
      const folder =
        name === "TextBlockView"
          ? "TextBlock"
          : name === "EditableTableChangesBar"
            ? "EditableTable"
            : name === "CompositeCard"
              ? "CompositeCardBlock"
              : name === "ContextCard"
                ? "ContextCardBlock"
                : name === "VisualCard"
                  ? "VisualCardBlock"
                  : name;
      return `import {${name}} from ${JSON.stringify(path.join(baseline, folder))};`;
    })
    .join("\n") + `\nconst Core={${required.join(",")}};`;
const aliases = Object.fromEntries(
  [
    "react",
    "react-dom",
    "lucide-react",
    "@tanstack/react-table",
    "@radix-ui/react-select",
    "@radix-ui/react-slot",
    "@radix-ui/react-label",
    "@radix-ui/react-tooltip",
    "react-day-picker",
    "date-fns",
    "react-markdown",
    "remark-gfm",
    "remark-breaks",
    "zod",
  ].map((name) => [name, path.join(consumer, "node_modules", name)]),
);
const implementationFiles = {};
async function record(relative) {
  const full = path.join(candidatePath, relative);
  const stat = await fs.stat(full);
  if (stat.isDirectory()) {
    for (const name of (await fs.readdir(full)).sort()) await record(path.join(relative, name));
  } else {
    const data = await fs.readFile(full);
    implementationFiles[relative] = { bytes: data.length, sha256: hash(data) };
  }
}
await record("package.json");
await record("dist");
const scripts = {},
  graphs = {};
for (const arm of ["baseline", "runtime"]) {
  const result = await build({
    stdin: {
      contents:
        arm === "baseline"
          ? source.replace('import * as Core from "@openuidev/react-ui-core";', legacyPrefix)
          : source,
      resolveDir: consumer,
      loader: "tsx",
    },
    external: ["*.css"],
    bundle: true,
    write: false,
    format: "esm",
    platform: "browser",
    jsx: "automatic",
    metafile: true,
    define: { "process.env.NODE_ENV": '"production"' },
    ...(arm === "baseline" ? { nodePaths: [consumer + "/node_modules"], alias: aliases } : {}),
  });
  if (arm === "runtime")
    assert(
      !Object.keys(result.metafile.inputs).some((file) => file.includes("packages/react-ui/src")),
      "candidate cannot import legacy production source",
    );
  scripts[arm] = result.outputFiles[0].text;
  graphs[arm] = { sha256: hash(scripts[arm]), bytes: Buffer.byteLength(scripts[arm]) };
}
const sass = createRequire(path.resolve(process.env.CORE_SASS_TOOLS, "package.json"))("sass");
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
  implementationFiles,
  implementationManifestSha256: hash(JSON.stringify(implementationFiles)),
  artifactRevision: process.env.CORE_ARTIFACT_REVISION,
  graphs,
  fixtureSha256: hash(source),
  runnerSha256: hash(await fs.readFile(fileURLToPath(import.meta.url))),
  consumerLockSha256: hash(await fs.readFile(path.join(consumer, "package-lock.json"))),
  legacyCssSha256: hash(legacyCss),
  cases: [],
  snapshots: 0,
  exclusions: [
    "No vendor math pipeline in these components; JS-only esbuild externalizes CSS",
    "SSR/hydration/performance/memory not covered",
  ],
};
assert(/^[a-f0-9]{40}$/.test(report.artifactRevision || ""));
const save = () =>
  fs.writeFile(process.env.CORE_BROWSER_RESULTS, JSON.stringify(report, null, 2) + "\n");
if (process.argv.includes("--prepare-only")) {
  await save();
  console.log("Prepared matched data/card bundles; no Chrome launched.");
  process.exit(0);
}
const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (url.pathname === "/image.svg") {
    res.setHeader("content-type", "image/svg+xml");
    return res.end(
      '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="#345678"/></svg>',
    );
  }
  if (url.pathname.endsWith(".js")) {
    res.setHeader("content-type", "text/javascript");
    return res.end(scripts[url.pathname.slice(1, -3)]);
  }
  if (url.pathname === "/baseline.css") {
    res.setHeader("content-type", "text/css");
    return res.end(legacyCss);
  }
  if (url.pathname.startsWith("/host/")) {
    res.setHeader("content-type", "text/css");
    return res.end(hosts[url.pathname.slice(6, -4)]);
  }
  const arm = url.searchParams.get("arm"),
    framework = url.searchParams.get("framework");
  res.setHeader("content-type", "text/html");
  res.end(
    `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1">${arm === "baseline" ? '<link id="component-style" rel="stylesheet" href="/baseline.css">' : ""}<link id="host-style" rel="stylesheet" href="/host/${framework}.css"><style>body{margin:0}#zone{padding:16px;max-width:760px;box-sizing:border-box}#typography{display:flex;flex-direction:column;gap:12px}#unrelated{font:17px/23px serif;color:rgb(11,22,33)}</style><div id="app"></div><script type="module" src="/${arm}.js"></script>`,
  );
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const { chromium } = tools("playwright");
let browser;
const properties = [
  "fontFamily",
  "fontSize",
  "fontWeight",
  "fontVariationSettings",
  "fontStyle",
  "lineHeight",
  "letterSpacing",
  "color",
  "backgroundColor",
  "backgroundImage",
  "border",
  "borderRadius",
  "boxShadow",
  "padding",
  "margin",
  "gap",
  "display",
  "position",
  "zIndex",
  "boxSizing",
  "alignItems",
  "justifyContent",
  "flexDirection",
  "flexGrow",
  "width",
  "height",
  "minWidth",
  "maxWidth",
  "maxHeight",
  "overflow",
  "textAlign",
  "textOverflow",
  "whiteSpace",
  "cursor",
  "opacity",
  "outline",
  "outlineOffset",
  "transform",
  "backdropFilter",
];
const snapshot = (page) =>
  page
    .locator(
      "#zone,#zone *,.openui-select-content,.openui-select-content *,.openui-calendar-container,.openui-calendar-container *",
    )
    .evaluateAll(
      (nodes, props) =>
        nodes.map((node) => {
          const r = node.getBoundingClientRect();
          return {
            tag: node.tagName,
            text: node.children.length ? null : node.textContent,
            style: Object.fromEntries(props.map((p) => [p, getComputedStyle(node)[p]])),
            rect: Object.fromEntries(
              ["x", "y", "width", "height"].map((k) => [k, Math.round(r[k] * 100) / 100]),
            ),
            pseudo: ["::before", "::after"].map((p) => {
              const s = getComputedStyle(node, p);
              return Object.fromEntries(
                [
                  "content",
                  "backgroundColor",
                  "backgroundImage",
                  "transform",
                  "zIndex",
                  "position",
                ].map((k) => [k, s[k]]),
              );
            }),
          };
        }),
      properties,
    );
try {
  browser = await chromium.launch({ channel: "chrome", headless: true });
  report.browser = browser.version();
  for (const framework of ["plain", "tailwind3", "tailwind4"])
    for (const order of ["before", "after"]) {
      const pages = [];
      const errors = [];
      for (const arm of ["baseline", "runtime"]) {
        const page = await browser.newPage({
          viewport: { width: 800, height: 900 },
          timezoneId: "UTC",
        });
        page.setDefaultTimeout(10000);
        page.on("pageerror", (e) => errors.push({ arm, message: e.message }));
        await page.goto(
          `http://127.0.0.1:${server.address().port}/?arm=${arm}&framework=${framework}`,
        );
        await page.waitForFunction(() => typeof window.mountApp === "function");
        await page.evaluate(
          ({ order, arm }) => {
            const host = document.getElementById("host-style"),
              component = document.getElementById(
                arm === "baseline" ? "component-style" : "_goober",
              );
            if (!component) throw Error("Missing styles");
            if (order === "before") document.head.insertBefore(host, component);
            else document.head.append(host);
          },
          { order, arm },
        );
        await page.evaluate(() => window.mountApp());
        await page.waitForSelector("[data-ready]");
        pages.push(page);
      }
      const compare = async (label) => {
        for (const page of pages)
          await page.evaluate(async () => {
            await document.fonts.ready;
            document.querySelectorAll("#zone *").forEach((n) => getComputedStyle(n).color);
            for (const a of document.getAnimations())
              if (Number.isFinite(a.effect.getComputedTiming().iterations)) a.finish();
            await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
          });
        const actual = await Promise.all(pages.map(snapshot));
        try {
          assert.deepEqual(actual[1], actual[0]);
        } catch (e) {
          report.firstFailure = {
            framework,
            order,
            label,
            baseline: actual[0],
            runtime: actual[1],
          };
          throw e;
        }
        report.snapshots += actual[0].length;
      };
      const configure = async (config) => {
        for (const page of pages) {
          await page.evaluate((c) => window.configure(c), config);
          await page.waitForFunction(
            (c) =>
              Object.entries(c).every(
                ([k, v]) =>
                  JSON.parse(document.querySelector("[data-ready]").dataset.ready)[k] === v,
              ),
            config,
          );
        }
      };
      for (const page of pages) {
        assert.equal(await page.locator(".openui-context-card--variant-image").count(), 1);
        assert.match(
          await page
            .locator(".openui-context-card--variant-image")
            .evaluate((n) => getComputedStyle(n).backgroundImage),
          /image.svg/,
        );
        assert.match(
          await page
            .locator(".openui-visual-first-card")
            .first()
            .evaluate((n) => getComputedStyle(n, "::before").backgroundImage),
          /image.svg/,
        );
        assert.equal(
          await page
            .locator(".openui-context-card--variant-image")
            .evaluate((n) => getComputedStyle(n, "::before").zIndex),
          "1",
        );
        assert.equal(
          await page
            .locator(".openui-context-card--variant-image > div")
            .evaluate((n) => getComputedStyle(n).zIndex),
          "2",
        );
      }
      await compare("default");
      for (const config of [
        { mode: "dark" },
        { mode: "light", custom: true },
        { mode: "light", custom: false, clickable: false },
        { clickable: true, layout: "carousel", narrow: true },
        { layout: "grid", responsive: false, gap: "9px", narrow: false },
      ]) {
        await configure(config);
        await compare(JSON.stringify(config));
      }
      await configure({
        mode: "light",
        custom: false,
        layout: "grid",
        responsive: true,
        gap: 12,
        clickable: true,
        narrow: false,
      });
      for (const selector of [
        ".openui-composite-card",
        ".openui-context-card",
        ".openui-visual-first-card",
      ]) {
        for (const page of pages) await page.locator(selector).first().hover();
        await compare(selector + "/hover");
        for (const page of pages) {
          await page.locator(selector).first().focus();
          await page.keyboard.press("Tab");
          await page.keyboard.press("Shift+Tab");
        }
        await compare(selector + "/focus");
      }
      for (const page of pages) {
        await page.locator("#table-zone").scrollIntoViewIfNeeded();
        await page.locator("tbody tr").first().locator("td").nth(0).click();
      }
      await compare("cell-selected");
      for (const page of pages) {
        await page.locator("tbody tr").first().locator("td").nth(0).click();
        await page.locator('input[type="text"]').fill("Updated");
      }
      await compare("cell-editing");
      for (const page of pages) await page.keyboard.press("Enter");
      await compare("cell-saved-changesbar");
      for (const page of pages) {
        await page.locator("tbody tr").first().locator("td").nth(2).click();
        await page.keyboard.press("Enter");
        await page.getByRole("option", { name: "Two", exact: true }).waitFor();
      }
      await compare("select-portal");
      for (const page of pages)
        await page.getByRole("option", { name: "Two", exact: true }).click();
      await compare("select-committed");
      for (const page of pages) {
        await page.locator("tbody tr").first().locator("td").nth(3).click();
        await page.locator("tbody tr").first().locator("td").nth(3).click();
        await page.locator(".openui-calendar-container").waitFor();
      }
      await compare("date-portal");
      for (const page of pages) await page.keyboard.press("Escape");
      for (const page of pages)
        await page.addStyleTag({
          content:
            ".consumer-table.openui-editable-table-wrapper{border-radius:9px}.consumer-table .openui-editable-table-header-container{color:rgb(33,44,55)}",
        });
      await configure({ override: true });
      for (const page of pages) {
        assert.equal(
          await page.locator(".consumer-table").evaluate((n) => getComputedStyle(n).borderRadius),
          "9px",
        );
        assert.equal(
          await page
            .locator(".consumer-table .openui-editable-table-header-container")
            .first()
            .evaluate((n) => getComputedStyle(n).color),
          "rgb(33, 44, 55)",
        );
      }
      await compare("explicit-class-override");
      await configure({ empty: true });
      await compare("empty");
      for (const page of pages)
        assert.equal(
          await page.locator("#unrelated").evaluate((n) => getComputedStyle(n).color),
          "rgb(11, 22, 33)",
        );
      assert.deepEqual(errors, []);
      report.cases.push({ framework, order, status: "passed" });
      for (const page of pages) await page.close();
      await save();
    }
  report.status = "passed";
  await save();
  console.log(
    JSON.stringify({
      status: report.status,
      cases: report.cases.length,
      snapshots: report.snapshots,
    }),
  );
} catch (e) {
  report.status = "failed";
  report.error = String(e);
  await save();
  throw e;
} finally {
  if (browser) await browser.close();
  await new Promise((r) => server.close(r));
}
