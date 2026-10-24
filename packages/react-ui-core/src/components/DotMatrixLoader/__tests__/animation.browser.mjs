import assert from "node:assert/strict";
import fs from "node:fs/promises";
import http from "node:http";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const consumer = path.resolve(process.env.CORE_CONSUMER),
  repo = fileURLToPath(new URL("../../../../../../", import.meta.url));
const { build } = createRequire(path.resolve(process.env.CORE_BROWSER_TOOLS, "package.json"))(
  "esbuild",
);
const sass = createRequire(path.resolve(process.env.CORE_SASS_TOOLS, "package.json"))("sass");
const { chromium } = await import(pathToFileURL(process.env.CORE_PLAYWRIGHT).href);
const dependencies = path.resolve(
  await fs.realpath(path.join(consumer, "node_modules/@openuidev/react-ui-core")),
  "../..",
);
const app = `import {useState} from 'react';import {createRoot} from 'react-dom/client';function App(){const [variant,setVariant]=useState('default'),[visible,setVisible]=useState(true);Object.assign(window,{setVariant,setVisible});return visible?<><DotMatrixLoader variant={variant}/><Skeleton count={2}/><PieChartSkeleton size={96}/></>:null;}createRoot(document.querySelector('#app')).render(<App/>);`;
const scripts = {};
for (const arm of ["baseline", "runtime"]) {
  const prefix =
    arm === "runtime"
      ? `import {DotMatrixLoader,Skeleton,PieChartSkeleton} from '@openuidev/react-ui-core';`
      : `import {DotMatrixLoader} from ${JSON.stringify(path.join(repo, "packages/react-ui/src/components/DotMatrixLoader"))};import {Skeleton,PieChartSkeleton} from ${JSON.stringify(path.join(repo, "packages/react-ui/src/components/Skeleton"))};`;
  const result = await build({
    stdin: { contents: prefix + app, resolveDir: consumer, loader: "tsx" },
    bundle: true,
    write: false,
    format: "esm",
    platform: "browser",
    jsx: "automatic",
    define: { "process.env.NODE_ENV": '"production"' },
    ...(arm === "baseline"
      ? {
          nodePaths: [consumer + "/node_modules", dependencies],
          alias: {
            react: consumer + "/node_modules/react",
            "react-dom": consumer + "/node_modules/react-dom",
          },
        }
      : {}),
  });
  scripts[arm] = result.outputFiles[0].text;
}
const legacy = sass.compile(path.join(repo, "packages/react-ui/src/components/index.scss"), {
  logger: sass.Logger.silent,
}).css;
const server = http.createServer((req, res) => {
  const arm = req.url.includes("baseline") ? "baseline" : "runtime";
  if (req.url.endsWith(".js")) {
    res.setHeader("content-type", "text/javascript");
    return res.end(scripts[arm]);
  }
  res.setHeader("content-type", "text/html");
  res.end(
    `<!doctype html><html><head>${arm === "baseline" ? `<style>${legacy}</style>` : ""}</head><body><div id="app"></div><script type="module" src="/${arm}.js"></script></body></html>`,
  );
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const pages = [],
    errors = [];
  for (const arm of ["baseline", "runtime"]) {
    const page = await browser.newPage();
    pages.push(page);
    page.on("pageerror", (e) => errors.push(e.message));
    await page.clock.install({ time: new Date("2026-10-25T00:00:00Z") });
    await page.clock.pauseAt(new Date("2026-10-25T00:00:10Z"));
    await page.goto(`http://127.0.0.1:${server.address().port}/${arm}`);
    await page.getByRole("status").waitFor();
  }
  for (const variant of ["default", "compact"]) {
    for (const page of pages) {
      await page.evaluate((variant) => window.setVariant(variant), variant);
      await page
        .locator(`.openui-dot-matrix-loader[style*="grid-size: ${variant === "default" ? 5 : 4}"]`)
        .waitFor();
    }
    const phases = [];
    for (const elapsed of [16, 200, 400]) {
      for (const page of pages) await page.clock.runFor(elapsed);
      const values = await Promise.all(
        pages.map((page) =>
          page
            .locator(".openui-dot-matrix-loader__dot")
            .evaluateAll((nodes) => nodes.map((n) => Number(getComputedStyle(n).opacity))),
        ),
      );
      assert.deepEqual(values[1], values[0], variant + " matched loader phase");
      assert.equal(values[0].length, variant === "default" ? 25 : 16);
      assert(values[0].every((n) => n >= 0.14 && n <= 1));
      assert(new Set(values[0]).size > 1);
      phases.push(values[0]);
    }
    assert.notDeepEqual(phases[0], phases[2], "loader advances between phases");
    console.log(variant + ": three matched RAF phases and grid count passed");
  }
  for (const [time, opacity] of [
    [0, 0.3],
    [600, 0.85],
    [1200, 0.3],
  ]) {
    for (const page of pages) {
      const values = await page.evaluate((time) => {
        const targets = [
          ...document.querySelectorAll(
            ".openui-skeleton-bar,.openui-skeleton-pie-chart-shape,.openui-skeleton-pie-chart-legend-dot",
          ),
        ];
        return targets.map((node) => {
          const [animation] = node.getAnimations();
          animation.pause();
          animation.currentTime = time;
          return {
            opacity: Number(getComputedStyle(node).opacity),
            duration: animation.effect.getTiming().duration,
          };
        });
      }, time);
      assert(values.length > 2);
      for (const value of values) {
        assert(Math.abs(value.opacity - opacity) < 0.00001, `pulse opacity at ${time}`);
        assert.equal(value.duration, 1200);
      }
    }
  }
  for (const page of pages) {
    await page.evaluate(() => window.setVisible(false));
    await page.getByRole("status").waitFor({ state: "detached" });
    await page.clock.runFor(100);
    assert.equal(await page.locator('[class*="openui-"]').count(), 0);
  }
  assert.deepEqual(errors, []);
  console.log("CSS pulse phases and loading unmount passed (" + browser.version() + ")");
} finally {
  await browser.close();
  await new Promise((r) => server.close(r));
}
