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
const source = await fs.readFile(new URL("primitives.fixture.tsx", import.meta.url), "utf8");
const oldNames = Object.fromEntries(
  [
    "Buttons",
    "Button",
    "IconButton",
    "Label",
    "FormControl",
    "Input",
    "CheckBoxGroup",
    "CheckBoxItem",
    "RadioGroup",
    "RadioItem",
    "SwitchGroup",
    "SwitchItem",
    "ToggleGroup",
    "ToggleItem",
    "ThemeProvider",
  ].map((n) => [n, [n]]),
);
oldNames.FormControl.push("Hint");
const oldPrefix =
  Object.entries(oldNames)
    .map(
      ([folder, names]) =>
        `import {${names.join(",")}} from ${JSON.stringify(path.join(baseline, folder))};`,
    )
    .join("\n") + `\nconst Core={${Object.values(oldNames).flat().join(",")}};`;
// Resolve legacy comparison dependencies from the same installed package graph.
const installedDependencies = path.resolve(
  await fs.realpath(path.join(consumer, "node_modules/@openuidev/react-ui-core")),
  "../..",
);
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
          nodePaths: [consumer + "/node_modules", installedDependencies],
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
  pending: ["OptionCards explicitly deferred"],
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
  "stroke",
  "strokeWidth",
  "flexDirection",
  "flexWrap",
  "overflowWrap",
  "minWidth",
  "maxWidth",
  "transform",
];
const selector = '[class*="openui-"]:not([class*="openui-theme-"])';
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
try {
  for (const framework of (process.env.CORE_MATRIX_FRAMEWORKS || "plain,tailwind3,tailwind4").split(
    ",",
  ))
    for (const order of ["before", "after"]) {
      const contexts = [],
        pages = [],
        errors = [];
      let comparisons = 0;
      try {
        for (const arm of ["baseline", "runtime"]) {
          const context = await browser.newContext({ viewport: { width: 1280, height: 1200 } });
          contexts.push(context);
          const page = await context.newPage();
          pages.push(page);
          page.on("pageerror", (e) => errors.push(e.message));
          await page.goto(
            `http://127.0.0.1:${server.address().port}/?arm=${arm}&framework=${framework}`,
          );
          await page.locator("#icon-target").waitFor();
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
          assert.equal(actual.length, expected.length, label + " nodes");
          for (let i = 0; i < expected.length; i++)
            assert.deepEqual(
              actual[i],
              expected[i],
              `${framework}/${order}/${label}/${i}/${expected[i].classes}`,
            );
          comparisons += expected.length;
        };
        for (const mode of ["none", "light", "dark", "custom-light", "custom-dark"]) {
          for (const page of pages) {
            await page.mouse.move(0, 0);
            await page.evaluate((mode) => window.setMode(mode), mode);
          }
          await compare(mode + "/normal");
          for (const variant of ["card", "sunk", "clear"]) {
            for (const page of pages) await page.evaluate((v) => window.setVariant(v), variant);
            await compare(mode + "/" + variant);
          }
          for (const target of [
            "#icon-target",
            ".openui-checkbox-item-root",
            ".openui-radio-item-root",
            ".openui-switch-item-root",
            ".openui-toggle-item",
          ]) {
            for (const page of pages) await page.locator(target).first().hover();
            await compare(mode + "/hover/" + target);
            for (const page of pages) await page.mouse.down();
            await compare(mode + "/active/" + target);
            for (const page of pages) {
              await page.mouse.up();
              await page.mouse.move(0, 0);
            }
          }
          for (const page of pages) {
            await page.locator("#start").focus();
            await page.keyboard.press("Tab");
          }
          await compare(mode + "/keyboard-focus");
          for (const page of pages) await page.evaluate(() => window.setDisabled(true));
          await compare(mode + "/disabled");
          for (const page of pages)
            await page.evaluate(() => {
              window.setDisabled(false);
              window.setOverrides(true);
            });
          await compare(mode + "/override");
          for (const page of pages) {
            assert.equal(
              await page.locator("#icon-target").evaluate((n) => getComputedStyle(n).padding),
              "32px",
            );
            await page.locator("#icon-target").hover();
          }
          await compare(mode + "/override-hover");
          for (const page of pages) await page.evaluate(() => window.setDisabled(true));
          await compare(mode + "/override-disabled");
          for (const page of pages) {
            await page.evaluate(() => {
              window.setDisabled(false);
              window.setOverrides(false);
            });
            await page.setViewportSize({ width: 360, height: 1200 });
            await page.mouse.move(0, 0);
          }
          await compare(mode + "/narrow");
          for (const page of pages) await page.setViewportSize({ width: 1280, height: 1200 });
        }
        for (const page of pages) {
          assert.equal(
            await page.locator("#unrelated").evaluate((n) => getComputedStyle(n).color),
            "rgb(11, 22, 33)",
          );
          const sheet = (await page.locator("#_goober").count())
            ? await page.locator("#_goober").textContent()
            : null;
          await page.evaluate(() => window.setVisible(false));
          await page.locator("#zone").waitFor({ state: "detached" });
          await page.evaluate(() => window.setVisible(true));
          await page.locator("#zone").waitFor();
          if (sheet) assert.equal(await page.locator("#_goober").textContent(), sheet);
        }
        assert.deepEqual(errors, []);
        result.cases.push({ framework, order, comparisons, status: "passed" });
        result.snapshots += comparisons;
        console.log(`${framework}/${order}: ${comparisons} comparisons passed`);
      } finally {
        await Promise.all(contexts.map((c) => c.close()));
      }
    }
  if (process.env.CORE_BROWSER_RESULTS)
    await fs.writeFile(process.env.CORE_BROWSER_RESULTS, JSON.stringify(result, null, 2) + "\n");
} finally {
  await browser.close();
  await new Promise((r) => server.close(r));
}
