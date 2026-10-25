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
const lockHash = hash(await fs.readFile(path.join(consumer, "package-lock.json")));
const unpack = await fs.mkdtemp(path.join(os.tmpdir(), "openui-data-cards-archive-"));
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
  "MetricIndicatorWithStrikethrough",
  "MetricIndicatorInline",
  "EntityList",
  "ListItem",
  "ListBlock",
  "OverviewCardBlock",
  "SnippetCardBlock",
  "TextBlockView",
];
const publicCore = candidate("@openuidev/react-ui-core");
for (const name of required) assert(publicCore[name], `integrated root export missing: ${name}`);
const source = await fs.readFile(path.join(here, "data-cards.fixture.tsx"), "utf8");
const baseline = path.join(repository, "packages/react-ui/src/components");
const legacyImports =
  required
    .map((name) => {
      const family = name.startsWith("MetricIndicator")
        ? "MetricIndicator"
        : name === "TextBlockView"
          ? "TextBlock"
          : name;
      return `import {${name}} from ${JSON.stringify(path.join(baseline, family))};`;
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
const image = await fs.readFile(path.join(here, "../../Sources/__tests__/image.svg"));
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
    "No public loading/disabled prop is added",
    "Shared medium layout is exercised by Worker1's composed-card public families",
    "Settled styles/geometry, not transition-frame parity",
    "Math vendor delivery remains separate Vite evidence",
  ],
};
const save = () =>
  fs.writeFile(process.env.CORE_BROWSER_RESULTS, JSON.stringify(report, null, 2) + "\n");
if (process.argv.includes("--prepare-only")) {
  await save();
  console.log("Prepared normal-installed matched A/C bundles and provenance; no Chrome launched.");
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
  "maskImage",
  "webkitMaskImage",
];
const selector =
  '#zone [class*="openui-"],#zone svg,.openui-tooltip-content,.openui-tooltip-content [class*="openui-"]';
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
          svg: node.tagName.toLowerCase() === "svg" ? node.innerHTML : null,
          style: Object.fromEntries(props.map((key) => [key, style[key]])),
          rect: Object.fromEntries(
            ["x", "y", "width", "height"].map((key) => [key, Math.round(rect[key] * 1000) / 1000]),
          ),
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
    for (const order of ["before", "after"])
      for (const kind of ["leaves", "cards"]) {
        const contexts = [],
          pages = [],
          errors = [];
        let comparisons = 0;
        const compare = async (label) => {
          const [expected, actual] = await Promise.all(pages.map(snapshot));
          try {
            assert.deepEqual(actual, expected, `${framework}/${order}/${kind}/${label}`);
          } catch (error) {
            report.failedComparison = { framework, order, kind, label, expected, actual };
            throw error;
          }
          comparisons += expected.length;
        };
        try {
          for (const arm of ["baseline", "runtime"]) {
            const context = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
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
              `http://127.0.0.1:${server.address().port}/?arm=${arm}&framework=${framework}&case=${kind}`,
            );
            await page.waitForFunction(() => typeof window.mountDataCards === "function");
            await page.evaluate(
              ({ arm, order }) => {
                const host = document.getElementById("host-style"),
                  component = document.querySelector(
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
                  throw Error("Host stylesheet order mismatch");
              },
              { arm, order },
            );
            await page.evaluate(() => window.mountDataCards());
            await page.locator("[data-ready]").waitFor();
          }
          for (const theme of ["none", "light", "dark", "custom-light", "custom-dark"]) {
            await configure(pages, { theme, nested: false, overrides: false });
            for (const page of pages) await page.mouse.move(0, 0);
            await compare(`${theme}/defaults`);
            if (kind === "leaves") {
              for (const variant of ["icon", "image", "number"]) {
                await configure(pages, { variant, size: "small" });
                await compare(`${theme}/small-${variant}`);
              }
              await configure(pages, { size: "default", variant: "number" });
            } else {
              await configure(pages, { clickable: false });
              await compare(`${theme}/static-cards`);
              for (const page of pages) {
                for (const selector of [".openui-overview-card", ".openui-value-card"]) {
                  assert.equal(await page.locator(selector).first().getAttribute("role"), null);
                  assert.equal(await page.locator(selector).first().getAttribute("tabindex"), null);
                }
              }
              await configure(pages, { clickable: true });
            }
          }
          await configure(pages, {
            theme: "light",
            nested: false,
            overrides: false,
            count: 5,
            width: 900,
            clickable: true,
          });
          for (const count of [0, 1, 2, 3, 4, 5]) {
            await configure(pages, { count });
            await compare(`count-${count}`);
          }
          await configure(pages, { count: 5 });
          if (kind === "leaves") {
            for (const page of pages) {
              await page.evaluate(() => window.clearEvents());
              await page.locator('#list-case [role="button"]').nth(1).click();
              await page.locator('#item-case [role="button"]').click();
              await page.locator('#item-case [role="button"]').focus();
              await page.keyboard.press("Enter");
              await page.keyboard.press("Space");
              assert.deepEqual(await page.evaluate(() => window.readEvents()), [
                { kind: "list", index: 1 },
                { kind: "item", index: 2 },
              ]);
              assert.equal(
                await page.locator(".openui-metric-indicator__trend").first().textContent(),
                "--2%",
              );
            }
            report.inheritedObservations.push({
              framework,
              order,
              kind,
              listKeyboardActivation: false,
              negativeTrend: "--2%",
            });
            for (const page of pages) {
              await page.locator("#outside").focus();
              await page.locator('#item-case [role="button"]').hover();
            }
            await compare("list-hover");
            for (const page of pages) {
              await page.mouse.move(0, 0);
              await page.locator('#item-case [role="button"]').focus();
            }
            await compare("list-focus");
            await configure(pages, {
              subtitle: false,
              clickable: false,
              updated: true,
              size: "small",
            });
            await compare("static-updated-no-subtitle");
            for (const page of pages)
              assert.equal(await page.locator('#zone [role="button"]').count(), 0);
          } else {
            await configure(pages, { clickable: false });
            for (const page of pages) {
              await page.evaluate(() => window.clearEvents());
              await page.locator(".openui-overview-card").first().click();
              await page.locator(".openui-value-card").first().click();
              assert.deepEqual(await page.evaluate(() => window.readEvents()), []);
              await page.mouse.move(0, 0);
            }
            await configure(pages, { clickable: true });
            for (const width of [900, 700, 450]) {
              await configure(pages, { width });
              await compare(`responsive-container-${width}`);
            }
            await configure(pages, { responsive: false });
            await compare("responsive-disabled");
            await configure(pages, { responsive: true });
            for (const gap of [0, 8, "2rem"]) {
              await configure(pages, { gap });
              await compare(`gap-${gap}`);
            }
            for (const page of pages) {
              await page.evaluate(() => window.clearEvents());
              for (const name of ["overview", "snippet"]) {
                const target = page.locator(`#${name}-case [role="button"]`).nth(1);
                await target.click();
                await target.focus();
                await page.keyboard.press("Enter");
                await page.keyboard.press("Space");
              }
              assert.deepEqual(
                await page.evaluate(() => window.readEvents()),
                ["overview", "snippet"].flatMap((kind) =>
                  Array.from({ length: 3 }, () => ({
                    kind,
                    index: 1,
                    id: `${kind}-1`,
                    sameItem: true,
                  })),
                ),
              );
              await page.mouse.move(0, 0);
              await page.locator("#outside").focus();
            }
            for (const name of ["overview", "snippet"]) {
              for (const page of pages) {
                await page.locator("#outside").focus();
                await page.locator(".openui-tooltip-content").waitFor({ state: "detached" });
                await page
                  .locator(`#${name}-case [role="button"]`)
                  .first()
                  .hover({ position: { x: 5, y: 5 } });
              }
              for (const page of pages)
                assert.equal(await page.locator(".openui-tooltip-content").count(), 0);
              await compare(`${name}/card-hover`);
              for (const page of pages) {
                await page.mouse.move(0, 0);
                await page.keyboard.press("Escape");
                await page.locator(".openui-tooltip-content").waitFor({ state: "detached" });
                await page.locator(`#${name}-case [role="button"]`).first().focus();
              }
              for (const page of pages)
                assert.equal(await page.locator(".openui-tooltip-content").count(), 0);
              await compare(`${name}/card-focus`);
            }
            for (const page of pages) await page.locator("#outside").focus();
            await configure(pages, { layout: "carousel", width: 450, gap: 0 });
            for (const [width, expected] of [
              [450, 200],
              [480, 200],
              [481, 240],
              [700, 240],
              [900, 240],
            ]) {
              await configure(pages, { width });
              for (const page of pages) {
                const widths = await page
                  .locator("#overview-case .openui-small-card-block__carousel-item")
                  .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().width));
                assert.deepEqual(
                  widths,
                  Array(5).fill(expected),
                  `legacy carousel width at ${width}px container`,
                );
              }
              await compare(`carousel-width-${width}`);
            }
            await configure(pages, { width: 450 });
            for (const page of pages)
              await page.waitForFunction(() => {
                const n = document.querySelector(
                  "#overview-case .openui-small-card-block__carousel",
                );
                return (
                  n.scrollWidth > n.clientWidth &&
                  n.classList.contains("openui-small-card-block__carousel--mask-right") &&
                  !n.classList.contains("openui-small-card-block__carousel--mask-left")
                );
              });
            await compare("carousel-start-mask");
            for (const position of ["middle", "end", "start"]) {
              for (const page of pages) {
                await page.locator("#overview-case .openui-small-card-block__carousel").evaluate(
                  (node, position) =>
                    node.scrollTo({
                      left:
                        position === "start"
                          ? 0
                          : position === "end"
                            ? node.scrollWidth
                            : (node.scrollWidth - node.clientWidth) / 2,
                      behavior: "instant",
                    }),
                  position,
                );
                await page.waitForFunction((position) => {
                  const n = document.querySelector(
                    "#overview-case .openui-small-card-block__carousel",
                  );
                  const l = n.classList.contains("openui-small-card-block__carousel--mask-left"),
                    r = n.classList.contains("openui-small-card-block__carousel--mask-right");
                  return position === "start" ? !l && r : position === "end" ? l && !r : l && r;
                }, position);
              }
              await compare(`carousel-${position}-mask`);
            }
            await configure(pages, { width: 700 });
            await compare("carousel-container-resize");
            await configure(pages, { count: 2 });
            for (const page of pages)
              await page.waitForFunction(() => {
                const node = document.querySelector(
                  "#overview-case .openui-small-card-block__carousel",
                );
                return (
                  node.scrollWidth <= node.clientWidth &&
                  !node.classList.contains("openui-small-card-block__carousel--mask-left") &&
                  !node.classList.contains("openui-small-card-block__carousel--mask-right")
                );
              });
            await compare("carousel-items-mutation");
            await configure(pages, {
              layout: "grid",
              count: 5,
              width: 450,
              theme: "custom-dark",
              nested: true,
              truncate: true,
            });
            const tooltipFocus = [];
            for (const page of pages) {
              await page.mouse.move(0, 0);
              await page.locator("#outside").focus();
              const trigger = page.locator("#snippet-case .openui-value-card__lhs").first();
              await trigger.focus();
              const observed = await trigger.evaluate((node) => ({
                focused: document.activeElement === node,
                tabIndex: node.tabIndex,
                tag: node.tagName,
              }));
              tooltipFocus.push(observed);
              if (observed.focused)
                await page.locator(".openui-tooltip-content").waitFor({ state: "visible" });
              else assert.equal(await page.locator(".openui-tooltip-content").count(), 0);
            }
            assert.deepEqual(
              tooltipFocus[1],
              tooltipFocus[0],
              "baseline tooltip trigger focus behavior",
            );
            report.inheritedObservations.push({ framework, order, tooltipFocus: tooltipFocus[1] });
            await compare("tooltip-trigger-native-focus");
            for (const page of pages) {
              await page.keyboard.press("Escape");
              await page.locator("#outside").focus();
              await page.mouse.move(0, 0);
              await page.locator(".openui-tooltip-content").waitFor({ state: "detached" });
            }
            for (const page of pages) {
              assert(
                await page
                  .locator("#snippet-case .openui-text-block__primary")
                  .first()
                  .evaluate((node) => node.scrollWidth > node.clientWidth),
                "real text truncation",
              );
              assert(
                await page
                  .locator("#snippet-case .openui-value-card__lhs")
                  .first()
                  .evaluate((node) => node.getBoundingClientRect().width > 0),
                "LHS trigger has real visible width",
              );
              await page.locator("#snippet-case .openui-value-card__lhs").first().hover();
              await page.locator(".openui-tooltip-content").waitFor({ state: "visible" });
              assert.equal(
                await page.locator("#zone .openui-tooltip-content").count(),
                0,
                "tooltip is a body portal",
              );
              assert(
                (await page.locator(".openui-tooltip-content").textContent()).includes(
                  "Full heading 1",
                ),
              );
            }
            await compare("nested-truncated-tooltip-portal");
            for (const page of pages) {
              await page.keyboard.press("Escape");
              await page.mouse.move(0, 0);
              await page.locator(".openui-tooltip-content").waitFor({ state: "detached" });
            }
            await configure(pages, { rhsLong: true });
            for (const page of pages) {
              assert(
                await page
                  .locator(
                    "#snippet-case .openui-value-card__rhs-content .openui-text-block__primary",
                  )
                  .first()
                  .evaluate((node) => node.scrollWidth > node.clientWidth),
                "real RHS truncation",
              );
              await page.locator("#snippet-case .openui-value-card__rhs-content").first().hover();
              await page.locator(".openui-tooltip-content").waitFor({ state: "visible" });
              assert(
                (await page.locator(".openui-tooltip-content").textContent()).includes(
                  "Full value 1",
                ),
              );
            }
            await compare("nested-rhs-tooltip-portal");
            for (const page of pages) {
              await page.keyboard.press("Escape");
              await page.mouse.move(0, 0);
              await page.locator(".openui-tooltip-content").waitFor({ state: "detached" });
            }
            await configure(pages, { truncate: false, rhsLong: false });
            for (const page of pages) {
              assert(
                await page
                  .locator("#snippet-case .openui-text-block__primary")
                  .first()
                  .evaluate((node) => node.scrollWidth <= node.clientWidth),
              );
              assert(
                await page
                  .locator("#snippet-case .openui-value-card__lhs")
                  .first()
                  .evaluate((node) => node.getBoundingClientRect().width > 0),
                "LHS trigger has real visible width",
              );
              await page.locator("#snippet-case .openui-value-card__lhs").first().hover();
              await page.waitForTimeout(180); // Existing TooltipWrapper delay is100ms.
              assert.equal(
                await page.locator(".openui-tooltip-content").count(),
                0,
                "untruncated text has no tooltip",
              );
            }
            await compare("untruncated-tooltip-omitted");
          }
          await configure(pages, {
            theme: "custom-light",
            nested: true,
            overrides: true,
            layout: "grid",
            count: 3,
            width: 700,
            clickable: true,
          });
          for (const page of pages) {
            assert(
              Object.values(await page.evaluate(() => window.readRefs())).every(Boolean),
              "public refs attached",
            );
            assert.equal(
              await page
                .locator("#independent-color")
                .evaluate((node) => getComputedStyle(node).color),
              "oklch(0.097 0 0)",
            );
            const ids =
              kind === "leaves"
                ? ["metric", "inline", "entity", "list", "item"]
                : ["overview", "snippet"];
            for (const id of ids)
              assert.equal(
                await page
                  .locator(`#${id}-case > div`)
                  .evaluate((node) => getComputedStyle(node).paddingTop),
                "32px",
              );
          }
          await compare("nested-explicit-overrides");
          for (const page of pages)
            await page
              .locator(kind === "leaves" ? "#item-case > div" : "#overview-case > div")
              .hover({ position: { x: 5, y: 5 } });
          await compare("explicit-override-hover");
          await configure(pages, { overrides: false, truncate: true, width: 450 });
          if (kind === "cards")
            for (const page of pages) {
              assert(
                await page
                  .locator("#snippet-case .openui-value-card__lhs")
                  .first()
                  .evaluate((node) => node.getBoundingClientRect().width > 0),
                "LHS trigger has real visible width",
              );
              await page.locator("#snippet-case .openui-value-card__lhs").first().hover();
              await page.locator(".openui-tooltip-content").waitFor({ state: "visible" });
            }
          const themeCounts = await Promise.all(
            pages.map((page) => page.locator("style[data-openui-theme]").count()),
          );
          await configure(pages, { visible: false });
          for (const page of pages) {
            assert(
              Object.values(await page.evaluate(() => window.readRefs())).every(Boolean),
              "public refs detach",
            );
            await page.locator(".openui-tooltip-content").waitFor({ state: "detached" });
            await page.evaluate(() => window.dispatchEvent(new Event("resize")));
          }
          await configure(pages, { visible: true });
          for (const [index, page] of pages.entries()) {
            assert.equal(
              await page.locator("style[data-openui-theme]").count(),
              themeCounts[index],
              "theme styles cleaned up across remount",
            );
            assert.equal(
              await page.locator("#unrelated").evaluate((node) => getComputedStyle(node).color),
              "rgb(11, 22, 33)",
            );
            assert(Object.values(await page.evaluate(() => window.readRefs())).every(Boolean));
          }
          assert.equal(
            await pages[1].locator("#_goober").count(),
            1,
            "no duplicate Goober style tag",
          );
          await compare("remounted-after-cleanup");
          assert.deepEqual(errors, []);
          report.cases.push({ framework, order, kind, status: "passed", snapshots: comparisons });
          report.snapshots += comparisons;
        } finally {
          for (const context of contexts) await context.close();
          await save();
        }
      }
  report.status = "passed";
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
