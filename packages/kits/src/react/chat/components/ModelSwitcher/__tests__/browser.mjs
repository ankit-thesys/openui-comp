import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import http from "node:http";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const required = (name) => {
  assert(process.env[name], `${name} must name the approved artifact/tool location`);
  return path.resolve(process.env[name]);
};
const consumer = required("KIT_CONSUMER");
const hostCss = required("KIT_HOST_CSS");
const browserTools = createRequire(path.join(required("KIT_BROWSER_TOOLS"), "package.json"));
const sass = createRequire(path.join(required("KIT_SASS_TOOLS"), "package.json"))("sass");
const { build } = browserTools("esbuild");
const directory = path.dirname(fileURLToPath(import.meta.url));
const repository = path.resolve(directory, "../../../../../../../..");
const legacy = path.join(repository, "packages/react-ui/src");
const output = process.env.KIT_BROWSER_OUT
  ? path.resolve(process.env.KIT_BROWSER_OUT)
  : path.join(directory, "results/browser");
assert(output.startsWith(directory + path.sep), "evidence must remain in the owned test directory");
const prepareOnly = process.argv.includes("--prepare");
if (!prepareOnly)
  assert.equal(
    process.env.KIT_BROWSER_RELEASE,
    "1",
    "await explicit browser release before running",
  );
const sha256 = (data) => createHash("sha256").update(data).digest("hex");
const hashFile = async (file) => sha256(await fs.readFile(file));

async function inventory() {
  const files = {};
  for (const name of ["@openuidev/kits", "@openuidev/react-ui-core"]) {
    const root = await fs.realpath(path.join(consumer, "node_modules", name));
    assert(
      root.startsWith((await fs.realpath(consumer)) + "/node_modules/"),
      "use a normal installed artifact, not a workspace/source symlink",
    );
    const manifest = JSON.parse(await fs.readFile(path.join(root, "package.json"), "utf8"));
    assert.equal(manifest.name, name);
    files[`${name}/package.json`] = await hashFile(path.join(root, "package.json"));
    async function visit(relative) {
      for (const entry of await fs.readdir(path.join(root, relative), { withFileTypes: true })) {
        const next = path.join(relative, entry.name);
        if (entry.isDirectory()) await visit(next);
        else if (entry.isFile()) files[`${name}/${next}`] = await hashFile(path.join(root, next));
      }
    }
    await visit("dist");
  }
  files["consumer/package.json"] = await hashFile(path.join(consumer, "package.json"));
  files["consumer/package-lock.json"] = await hashFile(path.join(consumer, "package-lock.json"));
  return Object.fromEntries(Object.entries(files).sort(([a], [b]) => a.localeCompare(b)));
}

const before = await inventory();
const fixture = await fs.readFile(path.join(directory, "browser.fixture.tsx"), "utf8");
const scripts = {};
const report = {
  status: "prepared",
  consumer,
  manifestBefore: before,
  runnerSha256: await hashFile(fileURLToPath(import.meta.url)),
  fixtureSha256: sha256(fixture),
  bundles: {},
  baselineInputs: {},
  hostCss: {},
  cases: [],
  coverage: {
    frameworks: ["plain", "tailwind3", "tailwind4"],
    hostOrders: ["host-before", "host-after"],
    themes: ["none", "light", "dark", "custom-light", "custom-dark", "nested"],
    modelDisabled: "not exposed by the existing ModelSwitcher API",
    ssr: "deferred",
  },
};
for (const arm of ["baseline", "runtime"]) {
  const prefix =
    arm === "runtime"
      ? 'import {ModelSwitcher,FollowUpBlock,FollowUpItem} from "@openuidev/kits/react/chat";import {ThemeProvider,createTheme} from "@openuidev/react-ui-core";'
      : ["ModelSwitcher", "FollowUpBlock", "FollowUpItem"]
          .map((name) => `import {${name}} from ${JSON.stringify(`${legacy}/components/${name}`)};`)
          .join("\n") +
        `import {ThemeProvider,createTheme} from ${JSON.stringify(`${legacy}/components/ThemeProvider`)};`;
  const built = await build({
    absWorkingDir: consumer,
    stdin: { contents: prefix + "\n" + fixture, resolveDir: consumer, loader: "tsx" },
    bundle: true,
    write: false,
    format: "esm",
    platform: "browser",
    jsx: "automatic",
    metafile: true,
    define: { "process.env.NODE_ENV": '"production"' },
    ...(arm === "baseline"
      ? {
          nodePaths: [path.join(consumer, "node_modules")],
          alias: {
            react: path.join(consumer, "node_modules/react"),
            "react-dom": path.join(consumer, "node_modules/react-dom"),
          },
        }
      : {}),
  });
  assert.equal(built.outputFiles.length, 1, "the component consumer must not require a CSS bundle");
  scripts[arm] = built.outputFiles[0].text;
  report.bundles[arm] = { sha256: sha256(scripts[arm]), bytes: Buffer.byteLength(scripts[arm]) };
  report.bundles[arm].metafile = built.metafile;
  if (arm === "runtime") {
    assert(
      !Object.keys(built.metafile.inputs).some((file) => file.includes("packages/react-ui/src/")),
    );
    assert(!Object.keys(built.metafile.inputs).some((file) => file.includes("/react/chat/libs/")));
  } else {
    for (const file of Object.keys(built.metafile.inputs)) {
      const absolute = path.resolve(consumer, file);
      if (absolute.startsWith(legacy + "/"))
        report.baselineInputs[absolute] = await hashFile(absolute);
    }
  }
}
const baselineCss = sass.compileString(
  [
    "openui-defaults.scss",
    "components/Select/select.scss",
    "components/Tag/tag.scss",
    "components/ModelSwitcher/modelSwitcher.scss",
    "components/FollowUpBlock/followUpBlock.scss",
    "components/FollowUpItem/followUpItem.scss",
  ]
    .map((file) => `@use ${JSON.stringify(file)};`)
    .join("\n"),
  { loadPaths: [legacy] },
);
report.baselineCssSha256 = sha256(baselineCss.css);
for (const url of baselineCss.loadedUrls) {
  if (url.protocol === "file:")
    report.baselineInputs[fileURLToPath(url)] = await hashFile(fileURLToPath(url));
}
const stylesheets = { "/baseline.css": baselineCss.css };
for (const framework of report.coverage.frameworks) {
  const file = path.join(hostCss, `${framework}.css`);
  const text = await fs.readFile(file, "utf8");
  report.hostCss[framework] = { path: file, sha256: sha256(text) };
  stylesheets[`/${framework}.css`] =
    text +
    `
.model-overrides .openui-model-switcher-trigger {background-color:rgb(150,50,100)!important;padding-left:27px!important}
`;
  report.hostCss[framework].servedSha256 = sha256(stylesheets[`/${framework}.css`]);
}
await fs.mkdir(output, { recursive: true });
await fs.writeFile(path.join(output, "baseline.css"), baselineCss.css);
for (const framework of report.coverage.frameworks)
  await fs.writeFile(path.join(output, `${framework}.css`), stylesheets[`/${framework}.css`]);
for (const arm of ["baseline", "runtime"])
  await fs.writeFile(path.join(output, `${arm}.js`), scripts[arm]);
if (prepareOnly) {
  report.manifestAfter = await inventory();
  assert.deepEqual(report.manifestAfter, before);
  await fs.writeFile(path.join(output, "prepared.json"), JSON.stringify(report, null, 2) + "\n");
  console.log("Prepared both arms without starting a server or browser.");
  process.exit(0);
}

const properties = [
  "display",
  "boxSizing",
  "font",
  "fontVariationSettings",
  "letterSpacing",
  "color",
  "backgroundColor",
  "borderTop",
  "borderRight",
  "borderBottom",
  "borderLeft",
  "borderRadius",
  "boxShadow",
  "padding",
  "margin",
  "gap",
  "width",
  "height",
  "minWidth",
  "maxWidth",
  "minHeight",
  "maxHeight",
  "alignItems",
  "justifyContent",
  "flex",
  "flexDirection",
  "whiteSpace",
  "wordBreak",
  "overflow",
  "textOverflow",
  "textAlign",
  "cursor",
  "outline",
];
const overrideColors = {
  plain: ["rgb(239, 68, 68)", "rgb(34, 197, 94)", "rgb(107, 114, 128)"],
  tailwind3: ["rgb(239, 68, 68)", "rgb(34, 197, 94)", "rgb(107, 114, 128)"],
  tailwind4: [
    "oklch(0.637 0.237 25.331)",
    "oklch(0.723 0.219 149.579)",
    "oklch(0.551 0.027 264.364)",
  ],
};
const selectors = {
  trigger: "#model-zone [role=combobox]",
  triggerName: "#model-zone .openui-model-switcher-name",
  triggerLogo: "#model-zone .openui-model-switcher-logo",
  triggerIcon: "#model-zone .openui-select-trigger-icon",
  triggerBadge: "#model-zone .openui-model-switcher-badge-trigger",
  block: ".openui-follow-up-block",
  header: ".openui-follow-up-block__header",
  defaultItem: "#default-item",
  itemText: "#default-item .openui-follow-up-item-text",
  itemIcon: "#default-item .openui-follow-up-item-icon",
  lastItem: "#button-item",
  host: "#host-content",
};

async function settle(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    for (const animation of document.getAnimations()) {
      if (animation.effect?.getTiming().iterations !== Infinity) animation.finish();
    }
  });
}
async function snapshot(page, probes) {
  await settle(page);
  return page.evaluate(
    ({ probes, properties }) =>
      Object.fromEntries(
        Object.entries(probes).map(([name, selector]) => {
          const node = document.querySelector(selector);
          if (!node) return [name, null];
          const style = getComputedStyle(node);
          return [
            name,
            Object.fromEntries(properties.map((property) => [property, style[property]])),
          ];
        }),
      ),
    { probes, properties },
  );
}
async function text(page, selector) {
  return page.locator(selector).textContent();
}
async function state(page, values) {
  await page.evaluate((values) => {
    for (const [setter, value] of Object.entries(values)) window[setter](value);
  }, values);
  await settle(page);
}
async function expectStyle(page, selector, property, expected) {
  assert.equal(
    await page
      .locator(selector)
      .evaluate((node, property) => getComputedStyle(node)[property], property),
    expected,
  );
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (url.pathname === "/favicon.ico") {
    res.writeHead(204);
    return res.end();
  }
  if (stylesheets[url.pathname] !== undefined) {
    res.setHeader("content-type", "text/css");
    return res.end(stylesheets[url.pathname]);
  }
  if (url.pathname === "/baseline.js" || url.pathname === "/runtime.js") {
    res.setHeader("content-type", "text/javascript");
    return res.end(scripts[url.pathname.slice(1, -3)]);
  }
  const arm = url.searchParams.get("arm"),
    framework = url.searchParams.get("framework");
  if (!["baseline", "runtime"].includes(arm) || !report.coverage.frameworks.includes(framework)) {
    res.writeHead(404);
    return res.end();
  }
  res.setHeader("content-type", "text/html");
  res.end(`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
${arm === "baseline" ? '<link id="component-style" rel="stylesheet" href="/baseline.css">' : ""}
<link id="host-style" rel="stylesheet" href="/${framework}.css">
<style>body{margin:0;font:16px/24px Arial,sans-serif}#zone{width:600px;padding:24px}#queries{width:360px}#host-content{font:17px/23px serif;color:rgb(11,22,33);padding:7px}</style>
</head><body><div id="app"></div><script type="module" src="/${arm}.js"></script></body></html>`);
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const { chromium } = browserTools("playwright");
let browser;
try {
  browser = await chromium.launch({ channel: "chrome", headless: true });
  report.browser = browser.version();
  for (const framework of report.coverage.frameworks) {
    for (const order of report.coverage.hostOrders) {
      for (const theme of report.coverage.themes) {
        const record = { framework, order, theme, comparisons: [], behavior: {} };
        report.cases.push(record);
        const contexts = [],
          pages = [],
          errors = [];
        try {
          for (const arm of ["baseline", "runtime"]) {
            const context = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
            contexts.push(context);
            const page = await context.newPage();
            page.setDefaultTimeout(8000);
            pages.push(page);
            page.on("pageerror", (error) => errors.push(`${arm}: ${error.message}`));
            page.on("console", (message) => {
              if (message.type() === "error") errors.push(`${arm}: ${message.text()}`);
            });
            await page.goto(
              `http://127.0.0.1:${server.address().port}/?arm=${arm}&framework=${framework}`,
            );
            await page.locator(selectors.trigger).waitFor();
            await state(page, { setTheme: theme });
            await page.evaluate(
              ({ arm, order }) => {
                const host = document.querySelector("#host-style");
                const component = document.querySelector(
                  arm === "runtime" ? "#_goober" : "#component-style",
                );
                if (!component?.sheet?.cssRules.length)
                  throw new Error("component stylesheet missing");
                if (order === "host-before") document.head.prepend(host);
                else document.head.append(host);
                const hostPrecedes = Boolean(
                  host.compareDocumentPosition(component) & Node.DOCUMENT_POSITION_FOLLOWING,
                );
                if (hostPrecedes !== (order === "host-before"))
                  throw new Error("stylesheet order was not established");
              },
              { arm, order },
            );
          }
          const compare = async (label, probes = selectors) => {
            const [baseline, runtime] = await Promise.all(
              pages.map((page) => snapshot(page, probes)),
            );
            record.comparisons.push({ label, baseline, runtime });
            for (const [index, sample] of [baseline, runtime].entries()) {
              for (const [name, value] of Object.entries(sample)) {
                if (value === null) {
                  assert.equal(name, "triggerLogo", `required ${name} probe is missing`);
                  assert.equal(await text(pages[index], "#selected"), "plain");
                }
              }
            }
            assert.deepEqual(runtime, baseline, `${framework}/${order}/${theme}/${label}`);
          };
          await compare("normal");
          const nestedPortals = [];
          for (const page of pages) {
            await expectStyle(page, selectors.trigger, "height", "32px");
            await expectStyle(page, selectors.triggerBadge, "display", "none");
            await expectStyle(page, selectors.lastItem, "borderBottomWidth", "0px");
            await expectStyle(page, selectors.host, "color", "rgb(11, 22, 33)");
            if (theme.startsWith("custom")) {
              await expectStyle(page, selectors.trigger, "backgroundColor", "rgb(220, 230, 240)");
              await expectStyle(page, selectors.defaultItem, "paddingTop", "15px");
            }
            assert.equal(
              await text(page, selectors.triggerLogo),
              theme.includes("dark") ? "D" : "L",
            );
            await page.locator(selectors.trigger).hover();
          }
          await compare("trigger-hover");
          for (const page of pages) {
            if (theme.startsWith("custom"))
              await expectStyle(page, selectors.trigger, "backgroundColor", "rgb(190, 210, 230)");
            await page.mouse.move(0, 0);
            await page.locator("#before-item").focus();
            await page.keyboard.press("Tab");
            assert(
              await page
                .locator(selectors.defaultItem)
                .evaluate((node) => node === document.activeElement),
              "keyboard navigation focuses the enabled follow-up",
            );
          }
          await compare("follow-up-keyboard-focus");
          for (const page of pages) {
            await page.locator(selectors.defaultItem).hover();
          }
          await compare("follow-up-hover");

          for (const page of pages) {
            await page.mouse.move(0, 0);
            await page.locator(selectors.trigger).focus();
            await page.keyboard.press("Enter");
            await page.getByRole("listbox").waitFor();
            assert.equal(
              await page.locator("#zone .openui-model-switcher-content").count(),
              0,
              "menu is portaled",
            );
            assert.deepEqual(await page.locator(".openui-select-label").allTextContents(), [
              "Featured",
              "Paid",
            ]);
            assert.deepEqual(
              await page.getByRole("option").allTextContents(),
              ["LFast modelRecommended", "LDeep modelPro", "Plain modelBasic"].map((value) =>
                theme.includes("dark") ? value.replace(/^L/, "D") : value,
              ),
            );
            if (theme.startsWith("custom"))
              await expectStyle(page, ".openui-model-switcher-content", "color", "rgb(40, 70, 90)");
          }
          await compare("portal-open", {
            content: ".openui-model-switcher-content",
            row: ".openui-model-switcher-row",
            logo: ".openui-model-switcher-row .openui-model-switcher-logo",
            tag: ".openui-model-switcher-row .openui-tag",
            tagText: ".openui-model-switcher-row .openui-tag-text",
            item: ".openui-select-item",
          });
          for (const page of pages) {
            await page.keyboard.press("Home");
            await page.keyboard.press("ArrowDown");
            await page.keyboard.press("Enter");
            await page.getByRole("listbox").waitFor({ state: "hidden" });
            assert.equal(await text(page, "#selected"), "deep");
            assert.deepEqual(JSON.parse(await text(page, "#selections")), ["deep"]);
            assert(
              await page
                .locator(selectors.trigger)
                .evaluate((node) => node === document.activeElement),
            );
            await page.locator(selectors.trigger).click();
            await page.getByRole("option").filter({ hasText: "Plain model" }).click();
            assert.equal(await text(page, "#selected"), "plain");
            assert.deepEqual(JSON.parse(await text(page, "#selections")), ["deep", "plain"]);
            await page.locator(selectors.trigger).focus();
            await page.keyboard.press("Enter");
            await page.keyboard.press("Escape");
            assert(
              await page
                .locator(selectors.trigger)
                .evaluate((node) => node === document.activeElement),
            );
            if (theme === "nested") {
              assert.equal(await text(page, "#nested-zone .openui-model-switcher-logo"), "D");
              await page.locator("#nested-zone [role=combobox]").click();
              assert.equal(
                await page
                  .locator(".openui-model-switcher-content .openui-model-switcher-logo")
                  .first()
                  .textContent(),
                "D",
              );
              nestedPortals.push(
                await snapshot(page, {
                  content: ".openui-model-switcher-content",
                  row: ".openui-model-switcher-row",
                  tag: ".openui-model-switcher-row .openui-tag",
                }),
              );
              const outerColor = await page
                .locator(selectors.trigger)
                .evaluate((node) => getComputedStyle(node).color);
              assert.notEqual(
                nestedPortals.at(-1).content.color,
                outerColor,
                "nested dark portal is isolated from outer light theme",
              );
              await page.keyboard.press("Escape");
            }
          }
          if (theme === "nested") {
            record.nestedPortals = nestedPortals;
            assert.deepEqual(nestedPortals[1], nestedPortals[0]);
            await compare("nested-isolation", {
              outer: selectors.trigger,
              inner: "#nested-zone [role=combobox]",
            });
          }

          for (const [index, page] of pages.entries()) {
            const item = page.locator(selectors.defaultItem);
            assert.equal(await item.getAttribute("type"), null);
            assert.equal(await item.evaluate((node) => node.type), "submit");
            await item.click();
            await page.locator("#button-item").click();
            await item.focus();
            await page.keyboard.press("Enter");
            await page.keyboard.press("Space");
            assert.deepEqual(JSON.parse(await text(page, "#query-events")), [
              "explain",
              "compare",
              "explain",
              "explain",
            ]);
            assert.deepEqual(JSON.parse(await text(page, "#submit-events")), [
              "default-item",
              "default-item",
              "default-item",
            ]);
            await state(page, { setDisabled: true });
            assert(await item.isDisabled());
            await item.evaluate((node) => node.click());
            assert.equal(JSON.parse(await text(page, "#query-events")).length, 4);
            assert.equal(JSON.parse(await text(page, "#submit-events")).length, 3);
            await page.locator("#before-item").focus();
            await page.keyboard.press("Tab");
            assert(
              await page
                .locator("#button-item")
                .evaluate((node) => node === document.activeElement),
            );
            record.behavior[index === 0 ? "baseline" : "runtime"] = {
              selections: JSON.parse(await text(page, "#selections")),
              queries: JSON.parse(await text(page, "#query-events")),
              submits: JSON.parse(await text(page, "#submit-events")),
            };
          }
          await compare("disabled");
          for (const page of pages) {
            await state(page, { setDisabled: false, setOverrides: true });
            await page.mouse.move(0, 0);
          }
          await compare("explicit-overrides");
          for (const page of pages) {
            await expectStyle(page, selectors.defaultItem, "padding", "32px");
            await expectStyle(
              page,
              selectors.defaultItem,
              "backgroundColor",
              overrideColors[framework][0],
            );
            await expectStyle(page, selectors.defaultItem, "borderRadius", "0px");
            await expectStyle(page, selectors.defaultItem, "marginLeft", "7px");
            await expectStyle(page, selectors.block, "marginTop", "11px");
            await expectStyle(page, selectors.trigger, "paddingLeft", "27px");
            await expectStyle(page, selectors.trigger, "backgroundColor", "rgb(150, 50, 100)");
            await page.locator(selectors.defaultItem).hover();
          }
          await compare("explicit-hover");
          const hoveredColors = await Promise.all(
            pages.map((page) =>
              page
                .locator(selectors.defaultItem)
                .evaluate((node) => getComputedStyle(node).backgroundColor),
            ),
          );
          assert.deepEqual(
            hoveredColors,
            [overrideColors[framework][1], overrideColors[framework][1]],
            "hover utilities apply in both arms",
          );
          for (const page of pages) await state(page, { setDisabled: true });
          await compare("explicit-disabled");
          for (const [index, page] of pages.entries()) {
            await expectStyle(page, selectors.defaultItem, "cursor", "wait");
            await expectStyle(
              page,
              selectors.defaultItem,
              "backgroundColor",
              overrideColors[framework][2],
            );
            assert.notEqual(
              await page
                .locator(selectors.defaultItem)
                .evaluate((node) => getComputedStyle(node).backgroundColor),
              hoveredColors[index],
              "disabled background replaces hover",
            );
          }
          assert.deepEqual(errors, [], "no console or page errors");
          record.status = "passed";
        } catch (error) {
          record.status = "failed";
          record.error = String(error);
          throw error;
        } finally {
          for (const context of contexts) await context.close();
        }
      }
    }
  }
  report.status = "passed";
} catch (error) {
  report.status = "failed";
  report.error = String(error);
  throw error;
} finally {
  if (browser) await browser.close();
  await new Promise((resolve) => server.close(resolve));
  report.manifestAfter = await inventory();
  report.artifactUnchanged = JSON.stringify(report.manifestAfter) === JSON.stringify(before);
  if (!report.artifactUnchanged) report.status = "failed";
  await fs.writeFile(path.join(output, "report.json"), JSON.stringify(report, null, 2) + "\n");
  assert(report.artifactUnchanged, "installed artifacts changed during the matrix");
}
