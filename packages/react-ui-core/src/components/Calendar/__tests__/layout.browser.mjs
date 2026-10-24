import assert from "node:assert/strict";
import fs from "node:fs/promises";
import http from "node:http";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const consumer = path.resolve(process.env.CORE_CONSUMER);
const tools = createRequire(path.resolve(process.env.CORE_BROWSER_TOOLS, "package.json"));
const { build } = tools("esbuild");
const sass = createRequire(path.resolve(process.env.CORE_SASS_TOOLS, "package.json"))("sass");
const { chromium } = await import(pathToFileURL(process.env.CORE_PLAYWRIGHT).href);
const repo = fileURLToPath(new URL("../../../../../../", import.meta.url));
const legacy = path.join(repo, "packages/react-ui/src");
const dependencies = path.resolve(
  await fs.realpath(path.join(consumer, "node_modules/@openuidev/react-ui-core")),
  "../..",
);
const app = `import {useState} from 'react';import {createRoot} from 'react-dom/client';
function App(){const [selected,setSelected]=useState(new Date(2026,9,15)),[layout,setLayout]=useState('fullscreen');
Object.assign(window,{setDate:day=>setSelected(new Date(2026,9,day)),setLayout});
return <LayoutContextProvider layout={layout}><Calendar mode="single" defaultMonth={new Date(2026,9,1)} selected={selected} onSelect={setSelected}/></LayoutContextProvider>;}
createRoot(document.querySelector('#app')).render(<App/>);`;
const scripts = {};
for (const arm of ["baseline", "runtime"]) {
  const imports =
    arm === "runtime"
      ? `import {Calendar,LayoutContextProvider} from '@openuidev/react-ui-core';`
      : `import {Calendar} from ${JSON.stringify(path.join(legacy, "components/Calendar"))};import {LayoutContextProvider} from ${JSON.stringify(path.join(legacy, "context/LayoutContext"))};`;
  const result = await build({
    stdin: { contents: imports + app, resolveDir: consumer, loader: "tsx" },
    bundle: true,
    write: false,
    format: "esm",
    platform: "browser",
    jsx: "automatic",
    define: { "process.env.NODE_ENV": '"production"' },
    ...(arm === "baseline"
      ? {
          nodePaths: [dependencies, consumer + "/node_modules"],
          alias: {
            react: consumer + "/node_modules/react",
            "react-dom": consumer + "/node_modules/react-dom",
          },
        }
      : {}),
  });
  scripts[arm] = result.outputFiles[0].text;
}
const css = sass.compile(path.join(legacy, "components/index.scss"), {
  logger: sass.Logger.silent,
}).css;
const server = http.createServer((req, res) => {
  const arm = req.url.includes("baseline") ? "baseline" : "runtime";
  if (req.url.endsWith(".js")) {
    res.setHeader("content-type", "text/javascript");
    res.end(scripts[arm]);
  } else {
    res.setHeader("content-type", "text/html");
    res.end(
      `<!doctype html><html><head>${arm === "baseline" ? `<style>${css}</style>` : ""}</head><body><div id="app"></div><script type="module" src="/${arm}.js"></script></body></html>`,
    );
  }
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
    await page.clock.install({ time: new Date("2026-10-24T12:00:00Z") });
    await page.goto(`http://127.0.0.1:${server.address().port}/${arm}`);
    await page.locator(".openui-calendar-container").waitFor();
  }
  for (const layout of ["mobile", "fullscreen", "tray", "copilot"]) {
    for (const page of pages) {
      await page.evaluate((layout) => window.setLayout(layout), layout);
      await page.locator(".openui-calendar-nav-" + layout).waitFor({ state: "attached" });
      await page.evaluate(() => window.setDate(22));
      await page.locator('[data-day="2026-10-22"].openui-calendar-single-day-selected').waitFor();
      await page.locator('[data-day="2026-10-20"] button').click();
      await page.locator('[data-day="2026-10-20"].openui-calendar-single-day-selected').waitFor();
    }
    const snapshots = await Promise.all(
      pages.map((page) =>
        page
          .locator(".openui-calendar-nav-" + layout + ",.openui-calendar-dropdowns-" + layout)
          .evaluateAll((nodes) =>
            nodes.map((n) => {
              const s = getComputedStyle(n);
              return {
                display: s.display,
                width: s.width,
                height: s.height,
                gap: s.gap,
                position: s.position,
                flexDirection: s.flexDirection,
              };
            }),
          ),
      ),
    );
    assert.deepEqual(snapshots[1], snapshots[0], layout + " layout parity");
    console.log(layout + ": controlled rerender, onSelect and layout parity passed");
  }
  assert.deepEqual(errors, []);
  console.log("Calendar layout/controlled checks passed (" + browser.version() + ")");
} finally {
  await browser.close();
  await new Promise((r) => server.close(r));
}
