import assert from "node:assert/strict";
import http from "node:http";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const packageRoot = fileURLToPath(new URL("../../../../", import.meta.url));
const consumer = path.resolve(process.env.CORE_CONSUMER || packageRoot);
const { build } = createRequire(
  path.resolve(process.env.CORE_BROWSER_TOOLS || packageRoot, "package.json"),
)("esbuild");
const { chromium } = await import(pathToFileURL(process.env.CORE_PLAYWRIGHT).href);
const fixture = `import * as Core from '@openuidev/react-ui-core';
import {createElement as h,useRef,useState} from 'react';import {createRoot} from 'react-dom/client';
if(!Core.ScrollableTable)throw Error('ScrollableTable must be exported');
function App(){const [columns,setColumns]=useState(4);const ref=useRef(null);window.setColumns=setColumns;window.tableRef=()=>ref.current;
const cells=(head)=>Array.from({length:columns},(_,i)=>h(head?Core.TableHead:Core.TableCell,{key:i,style:{minWidth:160}},head?'Column '+i:'Value '+i));
return h(Core.ThemeProvider,null,h('section',{id:'zone','data-columns':columns,style:{width:'min(90vw, 900px)'}},h(Core.ScrollableTable,{ref,id:'orders',className:'table-custom',containerClassName:'container-custom',containerStyle:{borderColor:'red'}},h(Core.TableHeader,null,h(Core.TableRow,null,...cells(true))),h(Core.TableBody,null,h(Core.TableRow,null,...cells(false))))));}
createRoot(document.getElementById('app')).render(h(App));`;
const built = await build({
  stdin: { contents: fixture, resolveDir: consumer, loader: "jsx" },
  bundle: true,
  write: false,
  format: "esm",
  platform: "browser",
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
});
const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", req.url === "/app.js" ? "text/javascript" : "text/html");
  res.end(
    req.url === "/app.js"
      ? built.outputFiles[0].text
      : '<!doctype html><div id="app"></div><script type="module" src="/app.js"></script>',
  );
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 400, height: 700 } });
  page.setDefaultTimeout(7000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.waitForFunction(
    () => document.querySelector("#orders") || document.body.textContent.includes("missing"),
  );
  assert.deepEqual(errors, [], "no uncaught errors");
  assert.equal(
    await page.evaluate(() => window.tableRef() === document.querySelector("#orders")),
    true,
    "forwarded native table ref",
  );
  assert.equal(
    await page.locator(".container-custom").evaluate((el) => getComputedStyle(el).borderColor),
    "rgb(255, 0, 0)",
    "existing container style override",
  );
  assert.equal(await page.locator("#orders.table-custom").count(), 1);
  await page.waitForFunction(
    () => document.querySelector('[aria-label="Scroll right"]')?.disabled === false,
  );
  assert.equal(
    await page.getByRole("button", { name: "Scroll left", includeHidden: true }).isDisabled(),
    true,
  );
  await page.getByRole("button", { name: "Scroll right" }).click();
  await page.waitForFunction(
    () => document.querySelector(".openui-scrollable-table-scroll-container").scrollLeft > 0,
  );
  await page.waitForFunction(() => {
    const c = document.querySelector(".openui-scrollable-table-scroll-container"),
      th = document.querySelectorAll("thead th")[1];
    return Math.abs(th.getBoundingClientRect().left - c.getBoundingClientRect().left) < 2;
  });
  for (let i = 0; i < 6; i++) {
    if (await page.getByRole("button", { name: "Scroll right", includeHidden: true }).isDisabled())
      break;
    await page.getByRole("button", { name: "Scroll right" }).click();
    await page.waitForTimeout(400);
  }
  assert.equal(
    await page.getByRole("button", { name: "Scroll right", includeHidden: true }).isDisabled(),
    true,
    "right end disables right control",
  );
  for (let i = 0; i < 6; i++) {
    if (await page.getByRole("button", { name: "Scroll left", includeHidden: true }).isDisabled())
      break;
    await page.getByRole("button", { name: "Scroll left" }).click();
    await page.waitForTimeout(400);
  }
  await page.waitForFunction(
    () => document.querySelector(".openui-scrollable-table-scroll-container").scrollLeft === 0,
  );
  await page.setViewportSize({ width: 1200, height: 700 });
  await page.waitForFunction(
    () => document.querySelectorAll(".openui-scrollable-table-control").length === 0,
  );
  await page.evaluate(() => window.setColumns(8));
  await page.waitForFunction(
    () =>
      document.querySelector("#zone").dataset.columns === "8" &&
      document.querySelectorAll(".openui-scrollable-table-control").length === 2,
  );
  assert.equal(await page.locator("thead th").count(), 8, "updated children recompute overflow");
  assert.deepEqual(errors, [], "no errors through resize and children update");
  console.log(
    "ScrollableTable public ref, props, column scrolling, bounds, real resize and children updates passed (" +
      browser.version() +
      ")",
  );
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
