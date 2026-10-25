import { build } from "esbuild";
import assert from "node:assert/strict";
import http from "node:http";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const packageRoot = fileURLToPath(new URL("../../../../", import.meta.url));
const consumer = path.resolve(process.env.CORE_CONSUMER || packageRoot);
const core = createRequire(path.join(consumer, "package.json"))("@openuidev/react-ui-core");

test(
  "EditableTable preserves controlled edits, keyboard cancellation, portal cells and changes actions",
  { timeout: 45000 },
  async () => {
    assert(core.EditableTable, "EditableTable must be exported from the public root");
    assert(core.EditableTableChangesBar, "EditableTableChangesBar must be exported");
    let fixture = `import React,{useRef,useState}from'react';import{createRoot}from'react-dom/client';import{EditableTable,EditableTableChangesBar,ThemeProvider}from'@openuidev/react-ui-core';const h=React.createElement;
const columns=[{key:'text',header:'Name',type:'text',width:180},{key:'number',header:'Amount',type:'number',width:180},{key:'select',header:'Choice',type:'select',width:180,options:[{value:'one',label:'One'},{value:'two',label:'Two'}]},{key:'date',header:'Date',type:'date-single',width:200},{key:'url',header:'URL',type:'url',width:240}];
window.actions={reset:0,save:0};function App(){const[data,setData]=useState([{id:'a',text:'Alpha',number:1.5,select:'one',date:'2026-10-15T00:00:00.000Z',url:'https://example.com'},{id:'b',text:'Beta',number:0,select:'two',date:undefined,url:'javascript:alert(1)'}]);const[changes,setChanges]=useState([]);const ref=useRef(null);window.gridRef=()=>ref.current;window.setData=setData;window.data=()=>data;window.changes=()=>changes;return h(ThemeProvider,null,h('section',{style:{width:700}},h(EditableTable,{ref,data,columns,className:'custom-grid',onDataChange:next=>{setData(next);setChanges(previous=>[...previous,next]);}}),h(EditableTableChangesBar,{changedCellCount:changes.length,resetLabel:'Discard',saveLabel:'Persist',onReset:()=>{window.actions.reset++;setChanges([]);},onSave:()=>window.actions.save++})));}createRoot(document.getElementById('app')).render(h(App));`;
    if (process.env.CORE_TABLE_BASELINE === "1")
      fixture = fixture.replace(
        "import{EditableTable,EditableTableChangesBar,ThemeProvider}from'@openuidev/react-ui-core';",
        `import{EditableTable,EditableTableChangesBar}from${JSON.stringify(path.resolve(packageRoot, "../react-ui/src/components/EditableTable"))};import{ThemeProvider}from${JSON.stringify(path.resolve(packageRoot, "../react-ui/src/components/ThemeProvider"))};`,
      );
    const built = await build({
      stdin: { contents: fixture, resolveDir: consumer, loader: "jsx" },
      bundle: true,
      write: false,
      format: "esm",
      platform: "browser",
      external: ["*.css"],
      define: { "process.env.NODE_ENV": '"production"' },
    });
    let browser;
    const server = http.createServer((request, response) => {
      response.setHeader(
        "content-type",
        request.url === "/app.js" ? "text/javascript" : "text/html",
      );
      response.end(
        request.url === "/app.js"
          ? built.outputFiles[0].text
          : '<!doctype html><html><head><link rel="icon" href="data:,"></head><body><div id="app"></div><script type="module" src="/app.js"></script></body></html>',
      );
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    try {
      browser = await chromium.launch({ channel: "chrome", headless: true });
      const page = await browser.newPage({
        viewport: { width: 1000, height: 800 },
        timezoneId: "UTC",
      });
      page.setDefaultTimeout(7000);
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(`http://127.0.0.1:${server.address().port}`);
      await page.locator(".custom-grid").waitFor();
      assert.equal(
        await page.evaluate(() => window.gridRef() === document.querySelector(".custom-grid")),
        true,
      );
      assert.equal(await page.locator("tbody tr").count(), 2);
      assert.equal(await page.locator(".openui-editable-table-changes-container").count(), 0);
      assert.equal(await page.locator('a[href^="javascript:"]').count(), 0);
      assert.equal(
        await page.locator('a[href="https://example.com"]').getAttribute("rel"),
        "noopener noreferrer",
      );
      await page.locator(".custom-grid").focus();
      await page.keyboard.press("Tab");
      await page.keyboard.press("Enter");
      await page.locator('input[type="text"]').fill("Updated");
      await page.keyboard.press("Enter");
      await page.waitForFunction(() => window.data()[0].text === "Updated");
      // Enter plus blur produces two callbacks in both legacy and extracted implementations.
      assert.equal(await page.evaluate(() => window.changes().length), 2);
      const first = page.locator("tbody tr").first().locator("td");
      await first.nth(0).click();
      await first.nth(0).click();
      await page.locator('input[type="text"]').fill("Cancelled");
      await page.keyboard.press("Escape");
      assert.equal(await page.evaluate(() => window.data()[0].text), "Updated");
      // Enter plus blur produces two callbacks in both legacy and extracted implementations.
      assert.equal(await page.evaluate(() => window.changes().length), 2);
      await first.nth(1).click();
      await first.nth(1).click();
      await page.locator('input[type="number"]').fill("17.5");
      await page.keyboard.press("Tab");
      await page.waitForFunction(() => window.data()[0].number === 17.5);
      await page.keyboard.press("Enter");
      await page.getByRole("option", { name: "Two", exact: true }).click();
      await page.waitForFunction(() => window.data()[0].select === "two");
      await first.nth(3).click();
      await first.nth(3).click();
      const day = page
        .locator(".openui-calendar-container [data-day]")
        .filter({ has: page.locator("button:not([disabled])") })
        .nth(8);
      await day.waitFor();
      const selectedDay = await day.getAttribute("data-day");
      await day.locator("button").click();
      await page.waitForFunction((value) => window.data()[0].date.startsWith(value), selectedDay);
      await page.getByRole("button", { name: "Persist", exact: true }).click();
      assert.equal(await page.evaluate(() => window.actions.save), 1);
      await page.getByRole("button", { name: "Discard", exact: true }).click();
      assert.equal(await page.evaluate(() => window.actions.reset), 1);
      assert.equal(await page.locator(".openui-editable-table-changes-container").count(), 0);
      await page.evaluate(() => window.setData([]));
      await page.waitForFunction(() => document.querySelectorAll("tbody tr").length === 0);
      assert.deepEqual(errors, []);
    } finally {
      if (browser) await browser.close();
      await new Promise((resolve) => server.close(resolve));
    }
  },
);
