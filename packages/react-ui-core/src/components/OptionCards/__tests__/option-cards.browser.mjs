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
const unpack = await fs.mkdtemp(path.join(os.tmpdir(), "openui-option-cards-archive-"));
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
const required = ["ThemeProvider", "OptionCards"];
const publicCore = candidate("@openuidev/react-ui-core");
for (const name of required) assert(publicCore[name], `integrated root export missing: ${name}`);
const source = await fs.readFile(path.join(here, "option-cards.fixture.tsx"), "utf8");
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
    "Native keyboard behavior preserved; no authored arrow-key navigation added",
    "Settled styles/geometry, not transition-frame parity",
    "Math vendor delivery remains separate Vite evidence",
  ],
};
const save = () =>
  fs.writeFile(process.env.CORE_BROWSER_RESULTS, JSON.stringify(report, null, 2) + "\n");
if (process.argv.includes("--prepare-only")) {
  await save();
  console.log(
    "Prepared normal-installed matched OptionCards bundles and provenance; no Chrome launched.",
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
  "maskImage",
  "webkitMaskImage",
];
const selector =
  '#zone [class*="openui-"],#zone svg,#zone img,.openui-tooltip-content,.openui-tooltip-content [class*="openui-"]';
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
        const [expected, actual] = await Promise.all(pages.map(snapshot));
        try {
          assert.deepEqual(actual, expected, `${framework}/${order}/${label}`);
        } catch (error) {
          report.failedComparison = { framework, order, label, expected, actual };
          throw error;
        }
        comparisons += expected.length;
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
          await page.waitForFunction(() => typeof window.mountOptions === "function");
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
          await page.evaluate(() => window.mountOptions());
          await page.locator("[data-ready]").waitFor();
        }
        for (const theme of ["none", "light", "dark", "custom-light", "custom-dark"]) {
          await configure(pages, { theme, nested: false, overrides: false });
          for (const page of pages) await page.mouse.move(0, 0);
          await compare(`${theme}/default`);
          for (const page of pages) await page.locator(".openui-option-card").first().hover();
          await compare(`${theme}/hover`);
          for (const page of pages) {
            await page.mouse.move(0, 0);
            await page.locator("#outside").focus();
            await page.keyboard.press("Tab");
            assert.equal(
              await page
                .locator(".openui-option-card")
                .first()
                .evaluate((node) => node === document.activeElement),
              true,
            );
          }
          await compare(`${theme}/keyboard-focus`);
          for (const page of pages) await page.locator("#outside").focus();
        }
        await configure(pages, { theme: "light", width: 900, count: 5 });
        for (const width of [450, 480, 481, 700, 768, 769, 900]) {
          await configure(pages, { width });
          for (const count of [0, 1, 2, 3, 4, 5]) {
            await configure(pages, { count });
            await compare(`width-${width}/count-${count}`);
          }
        }
        await configure(pages, { width: 900, count: 5, type: "single", autoUpdate: false });
        for (const page of pages) {
          await page.evaluate(() => {
            window.clearEvents();
            window.resetSelection();
          });
          const buttons = page.locator(".openui-option-card");
          assert.equal(await page.locator("#options").getAttribute("role"), "radiogroup");
          await buttons.nth(0).click();
          await buttons.nth(0).focus();
          await page.keyboard.press("Enter");
          await page.keyboard.press("Space");
          assert.deepEqual(await page.evaluate(() => window.readEvents()), [
            "value-0",
            "value-0",
            "value-0",
          ]);
          assert.equal(await buttons.nth(0).getAttribute("aria-checked"), "false");
          assert.equal(await buttons.nth(1).getAttribute("aria-checked"), "true");
          await page.keyboard.press("Tab");
          assert.equal(
            await buttons.nth(1).evaluate((node) => node === document.activeElement),
            true,
          );
          await page.keyboard.press("Tab");
          assert.equal(
            await buttons.nth(3).evaluate((node) => node === document.activeElement),
            true,
            "Tab skips disabled option",
          );
          await page.keyboard.press("ArrowRight");
          assert.equal(
            await buttons.nth(3).evaluate((node) => node === document.activeElement),
            true,
            "legacy has no authored arrow navigation",
          );
          const disabledBox = await buttons.nth(2).boundingBox();
          assert(disabledBox);
          await page.mouse.click(
            disabledBox.x + disabledBox.width / 2,
            disabledBox.y + disabledBox.height / 2,
          );
          assert.equal((await page.evaluate(() => window.readEvents())).length, 3);
        }
        await compare("controlled-selection-native-keyboard-disabled");
        for (const type of ["single", "multiple"]) {
          await configure(pages, { type, autoUpdate: true });
          for (const page of pages) {
            await page.evaluate(() => {
              window.clearEvents();
              window.resetSelection();
            });
            const buttons = page.locator(".openui-option-card");
            assert.equal(
              await buttons.first().getAttribute("role"),
              type === "single" ? "radio" : "checkbox",
            );
            await buttons.nth(0).click();
            assert.equal(await buttons.nth(0).getAttribute("aria-checked"), "true");
            assert.equal(
              await buttons.nth(1).getAttribute("aria-checked"),
              type === "single" ? "false" : "true",
            );
            await buttons.nth(0).click();
            assert.equal(
              await buttons.nth(0).getAttribute("aria-checked"),
              type === "single" ? "true" : "false",
            );
            assert.deepEqual(await page.evaluate(() => window.readEvents()), [
              "value-0",
              "value-0",
            ]);
          }
          await compare(`${type}/parent-updated-selection`);
        }
        await configure(pages, { disabled: true });
        for (const page of pages) {
          assert.equal(await page.locator(".openui-option-card:disabled").count(), 5);
          await page.evaluate(() => window.clearEvents());
          const box = await page.locator(".openui-option-card").first().boundingBox();
          assert(box);
          await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
          assert.deepEqual(await page.evaluate(() => window.readEvents()), []);
        }
        await compare("global-disabled");
        await configure(pages, {
          disabled: false,
          subtitle: false,
          updated: true,
          nested: true,
          theme: "custom-light",
        });
        await compare("live-content-nested-theme");
        for (const page of pages) {
          assert.equal(await page.locator(".openui-option-card__subtitle").count(), 0);
          assert.equal(await page.evaluate(() => window.readRef()), true);
        }
        const themeColors = await Promise.all(
          pages.map((page) =>
            page
              .locator("#outer-color,#independent-color")
              .evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).color)),
          ),
        );
        assert.deepEqual(themeColors[1], themeColors[0]);
        assert.notEqual(themeColors[0][0], themeColors[0][1]);
        await configure(pages, { overrides: true, nested: false });
        for (const page of pages) await page.mouse.move(0, 0);
        await compare("explicit-root-and-descendant-overrides");
        for (const page of pages) {
          assert.equal(
            await page.locator("#options").evaluate((node) => getComputedStyle(node).padding),
            "32px",
          );
          assert.equal(
            await page
              .locator(".openui-option-card")
              .first()
              .evaluate((node) => getComputedStyle(node).backgroundColor),
            "rgb(220, 30, 50)",
          );
          await page.locator(".openui-option-card").first().hover();
          await settle(page);
          assert.equal(
            await page
              .locator(".openui-option-card")
              .first()
              .evaluate((node) => getComputedStyle(node).backgroundColor),
            "rgb(30, 180, 90)",
          );
          assert.equal(
            await page
              .locator(".openui-option-card:disabled")
              .first()
              .evaluate((node) => getComputedStyle(node).cursor),
            "wait",
          );
        }
        await compare("explicit-hover-disabled-overrides");
        await configure(pages, { overrides: false });
        const themeCounts = await Promise.all(
          pages.map((page) => page.locator("style[data-openui-theme]").count()),
        );
        await configure(pages, { visible: false });
        for (const page of pages) {
          assert.equal(await page.evaluate(() => window.readRef()), true);
          assert.equal(await page.locator(".openui-option-card").count(), 0);
        }
        await configure(pages, { visible: true });
        for (const [index, page] of pages.entries()) {
          assert.equal(await page.evaluate(() => window.readRef()), true);
          assert.equal(await page.locator("style[data-openui-theme]").count(), themeCounts[index]);
          assert.equal(
            await page.locator("#unrelated").evaluate((node) => getComputedStyle(node).color),
            "rgb(11, 22, 33)",
          );
        }
        assert.equal(await pages[1].locator("#_goober").count(), 1);
        await compare("remount-cleanup");
        assert.deepEqual(errors, []);
        report.cases.push({ framework, order, status: "passed", snapshots: comparisons });
        report.snapshots += comparisons;
      } finally {
        for (const context of contexts) await context.close();
        await save();
      }
    }
  report.inheritedObservations = [
    "Native Tab/Enter/Space supported; no authored arrow-key navigation in either implementation",
  ];
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
