import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import http from "node:http";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const consumer = process.env.CORE_CONSUMER
  ? path.resolve(process.env.CORE_CONSUMER)
  : fileURLToPath(new URL("../../../../", import.meta.url));
const repository = fileURLToPath(new URL("../../../../../../", import.meta.url));
const tools = createRequire(
  path.resolve(process.env.CORE_BROWSER_TOOLS || consumer, "package.json"),
);
const { build } = tools("esbuild");
const { chromium } = await import(pathToFileURL(process.env.CORE_PLAYWRIGHT).href);
const baseline = path.resolve(
  process.env.CORE_BASELINE || path.join(repository, "packages/react-ui/src/components"),
);
const evidence = path.resolve(
  process.env.CORE_STYLE_EVIDENCE ||
    path.join(repository, "validation/stock-goober-followup/artifacts/browser"),
);
const fixture = await fs.readFile(new URL("browser.fixture.tsx", import.meta.url), "utf8");
const scripts = {};
const buildHashes = {};
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
for (const arm of ["baseline", "runtime"]) {
  const prefix =
    arm === "runtime"
      ? 'import {Button,Input,TextArea,ThemeProvider,createTheme} from "@openuidev/react-ui-core";'
      : ["Button", "Input", "TextArea", "ThemeProvider"]
          .map((name) => `import {${name}} from ${JSON.stringify(baseline + "/" + name)};`)
          .join("\n") +
        `\nimport {createTheme} from ${JSON.stringify(baseline + "/ThemeProvider")};`;
  const built = await build({
    stdin: {
      contents: `const ARM=${JSON.stringify(arm)};\n${prefix}\n${fixture}`,
      resolveDir: consumer,
      loader: "tsx",
    },
    bundle: true,
    format: "esm",
    platform: "browser",
    jsx: "automatic",
    write: false,
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
      !Object.keys(built.metafile.inputs).some((file) => file.includes("packages/react-ui/src")),
      "runtime graph must not contain legacy source",
    );
  scripts[arm] = built.outputFiles[0].text;
  buildHashes[arm] = sha256(scripts[arm]);
}
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname.endsWith(".js")) {
      res.setHeader("content-type", "text/javascript");
      return res.end(scripts[url.pathname.slice(1, -3)]);
    }
    if (url.pathname.endsWith(".css")) {
      const files = {
        "/baseline.css": "baseline.css",
        "/plain.css": "frameworks/plain.css",
        "/tailwind3.css": "frameworks/tailwind3.css",
        "/tailwind4.css": "frameworks/tailwind4.css",
      };
      assert(files[url.pathname]);
      res.setHeader("content-type", "text/css");
      return res.end(await fs.readFile(path.join(evidence, files[url.pathname])));
    }
    const arm = url.searchParams.get("arm"),
      framework = url.searchParams.get("framework");
    assert(["baseline", "runtime"].includes(arm));
    assert(["plain", "tailwind3", "tailwind4"].includes(framework));
    res.setHeader("content-type", "text/html");
    res.end(
      `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">${arm === "baseline" ? '<link id="component-style" rel="stylesheet" href="/baseline.css">' : ""}<link id="host-style" rel="stylesheet" href="/${framework}.css"><style>body{margin:0}#zone{width:100%;max-width:900px;padding:16px;box-sizing:border-box}main{display:grid;gap:12px}#variants{display:flex;flex-wrap:wrap;gap:8px}#unrelated{font:17px/23px serif;color:rgb(11,22,33);padding:7px}</style></head><body><div id="app"></div><script type="module" src="/${arm}.js"></script></body></html>`,
    );
  } catch (error) {
    res.writeHead(500);
    res.end(String(error));
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const url = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const result = {
  browser: browser.version(),
  cases: [],
  samples: 0,
  buildHashes,
  fixtureSha256: sha256(fixture),
  runnerSha256: sha256(await fs.readFile(fileURLToPath(import.meta.url))),
  themes: ["none", "light", "dark", "custom-light", "custom-dark"],
};
const properties = [
  "font",
  "letterSpacing",
  "fontVariationSettings",
  "backgroundColor",
  "color",
  "border",
  "borderRadius",
  "boxShadow",
  "padding",
  "gap",
  "display",
  "alignItems",
  "boxSizing",
  "cursor",
  "resize",
  "outline",
  "width",
  "height",
];
const sample = async (page) => {
  await page.evaluate(() => {
    // Like animation-disabled visual snapshots, sample each native transition at its endpoint.
    document
      .querySelectorAll("[data-sample]")
      .forEach((node) => getComputedStyle(node).backgroundColor);
    for (const animation of document.getAnimations()) {
      if (animation instanceof CSSTransition) animation.finish();
    }
  });
  return page.locator("[data-sample]").evaluateAll(
    (nodes, properties) =>
      nodes.map((node) => ({
        name: node.getAttribute("data-sample"),
        style: Object.fromEntries(properties.map((key) => [key, getComputedStyle(node)[key]])),
        placeholder: getComputedStyle(node, "::placeholder").color,
        svg: node.querySelector("svg")
          ? [
              getComputedStyle(node.querySelector("svg")).width,
              getComputedStyle(node.querySelector("svg")).height,
            ]
          : null,
      })),
    properties,
  );
};
try {
  for (const framework of ["plain", "tailwind3", "tailwind4"])
    for (const order of ["before", "after"]) {
      const pages = [],
        contexts = [],
        errors = [];
      try {
        for (const arm of ["baseline", "runtime"]) {
          const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
          contexts.push(context);
          const page = await context.newPage();
          pages.push(page);
          page.on("pageerror", (error) => errors.push(error.message));
          await page.goto(`${url}/?arm=${arm}&framework=${framework}`);
          await page.locator("#action").waitFor();
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
        let compared = 0;
        const equal = async (label) => {
          const actual = await Promise.all(pages.map(sample));
          assert.equal(actual[1].length, actual[0].length);
          for (let i = 0; i < actual[0].length; i++)
            assert.deepEqual(
              actual[1][i],
              actual[0][i],
              `${framework}/${order}/${label}/${actual[0][i].name}`,
            );
          compared += actual[0].length;
        };
        for (const theme of result.themes) {
          for (const page of pages) await page.mouse.move(0, 0);
          for (const page of pages) {
            await page.evaluate((theme) => window.setMode(theme), theme);
            await page.waitForTimeout(30);
          }
          console.log(`${framework}/${order}/${theme}`);
          await equal(theme + "/normal");
          if (theme.startsWith("custom"))
            for (const page of pages) {
              const button = page.locator("[data-sample=button-normal-primary-medium]");
              assert.equal(
                await button.evaluate((node) => getComputedStyle(node).backgroundColor),
                "rgb(150, 50, 100)",
                "custom token applies in both light and dark",
              );
              assert.equal(
                await button.evaluate((node) => getComputedStyle(node).paddingRight),
                "15px",
              );
            }
          for (const selector of [
            "[data-sample^=button][data-sample$=medium]",
            "[data-sample^=input]",
            "[data-sample^=textarea]",
          ]) {
            const count = await pages[0].locator(selector).count();
            for (let i = 0; i < count; i++) {
              for (const page of pages) {
                await page.locator(selector).nth(i).hover();
                await page.waitForTimeout(30);
              }
              await equal(theme + "/hover/" + selector + i);
              if (selector.startsWith("[data-sample^=button]")) {
                for (const page of pages) {
                  await page.mouse.down();
                  await page.waitForTimeout(30);
                }
                await equal(theme + "/active/" + i);
                for (const page of pages) await page.mouse.up();
              } else {
                for (const page of pages) {
                  await page.locator(selector).nth(i).focus();
                  await page.waitForTimeout(30);
                }
                await equal(theme + "/focus/" + selector + i);
              }
            }
          }
          for (const page of pages) {
            await page.mouse.move(0, 0);
            await page.evaluate(() => window.setDisabled(true));
            await page.locator("#start").focus();
            await page.waitForTimeout(30);
          }
          await equal(theme + "/disabled");
          for (const page of pages) {
            await page.evaluate(() => {
              window.setOverrides(true);
              window.setDisabled(false);
            });
            await page.waitForTimeout(30);
          }
          await equal(theme + "/override");
          for (const page of pages)
            assert.equal(
              await page
                .locator("[data-sample]")
                .first()
                .evaluate((node) => getComputedStyle(node).padding),
              "32px",
            );
          for (const selector of [
            "[data-sample=button-normal-primary-medium]",
            "[data-sample=input-medium-false]",
            "[data-sample=textarea-false]",
          ]) {
            for (const page of pages) await page.locator(selector).hover();
            await equal(theme + "/override-hover/" + selector);
            for (const page of pages) {
              const color = await page
                .locator(selector)
                .evaluate((node) => getComputedStyle(node).backgroundColor);
              assert.equal(
                color,
                framework === "tailwind4" ? "oklch(0.723 0.219 149.579)" : "rgb(34, 197, 94)",
              );
            }
          }
          for (const page of pages) {
            await page.mouse.move(0, 0);
            await page.evaluate(() => window.setDisabled(true));
            await page.waitForTimeout(30);
          }
          await equal(theme + "/override-disabled");
          for (const page of pages) {
            await page.evaluate(() => {
              window.setOverrides(false);
              window.setDisabled(false);
            });
            await page.waitForTimeout(30);
          }
        }
        for (const page of pages) {
          await page.locator("#start").focus();
          for (const id of ["action", "name", "notes", "end"]) {
            await page.keyboard.press("Tab");
            assert.equal(await page.evaluate(() => document.activeElement.id), id);
          }
          await page.locator("#action").focus();
          await page.keyboard.press("Space");
          assert.equal(await page.locator("#clicks").textContent(), "1");
          await page.locator("#name").fill("Ankit");
          assert.equal(await page.locator("#name").inputValue(), "Ankit");
          await page.locator("#notes").fill("Updated notes");
          assert.equal(await page.locator("#notes").inputValue(), "Updated notes");
          const original = await page
            .locator("#unrelated")
            .evaluate((node) => getComputedStyle(node).cssText + getComputedStyle(node).color);
          const sheet = (await page.locator("#_goober").count())
            ? await page.locator("#_goober").textContent()
            : null;
          await page.evaluate(() => window.setVisible(false));
          await page.locator("#action").waitFor({ state: "detached" });
          await page.evaluate(() => window.setVisible(true));
          await page.locator("#action").waitFor();
          assert.equal(
            await page
              .locator("#unrelated")
              .evaluate((node) => getComputedStyle(node).cssText + getComputedStyle(node).color),
            original,
          );
          if (sheet) assert.equal(await page.locator("#_goober").textContent(), sheet);
        }
        assert.deepEqual(errors, []);
        result.cases.push({ framework, order, compared, status: "passed" });
        result.samples += compared;
        console.log(`${framework}/${order}: ${compared} paired snapshots passed`);
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
