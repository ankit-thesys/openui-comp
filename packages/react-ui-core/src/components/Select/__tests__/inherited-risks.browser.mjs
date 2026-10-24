// Diagnostic parity checks for inherited failures, not assertions of desired behavior.
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import http from "node:http";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const consumer = path.resolve(process.env.CORE_CONSUMER);
const dependencies = path.resolve(
  await fs.realpath(path.join(consumer, "node_modules/@openuidev/react-ui-core")),
  "../..",
);
const { build } = createRequire(path.resolve(process.env.CORE_BROWSER_TOOLS, "package.json"))(
  "esbuild",
);
const { chromium } = await import(pathToFileURL(process.env.CORE_PLAYWRIGHT).href);
const root = fileURLToPath(new URL("../../../../../../", import.meta.url));
const body = `
import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
const date=n=>new Date(2024,2,n,12);
class Boundary extends React.Component {state={error:null};static getDerivedStateFromError(e){return {error:e.message}}render(){return this.state.error?<output id="error">{this.state.error}</output>:this.props.children}}
function App(){const [day,setDay]=useState(14),[value,setValue]=useState(undefined),[mode,setMode]=useState('select');window.setDay=setDay;window.setMode=setMode;return <div>
<section id="plain"><Core.Calendar mode="single" month={date(1)} selected={date(day)} captionLayout="label"/></section>
<section id="controlled"><Core.Calendar mode="single" month={date(1)} selected={date(day)} onSelect={()=>{}} captionLayout="label"/></section>
<section id="date"><button id="clear" onClick={()=>setValue(undefined)}>clear</button><Core.DatePicker selectedSingleDate={value} setSelectedSingleDate={setValue}/></section>
{mode==='stuck'&&<section id="stuck"><Core.DatePicker isOpen={true}/></section>}
{mode==='select'&&<section id="select"><Core.Select defaultOpen><Core.SelectTrigger><Core.SelectValue/></Core.SelectTrigger><Core.SelectContent><Core.SelectItem value="a" textValue="Search Alpha">Alpha</Core.SelectItem></Core.SelectContent></Core.Select></section>}
{mode==='hide'&&<Boundary><Core.Select><Core.SelectTrigger hideDropdownIcon><Core.SelectValue/></Core.SelectTrigger></Core.Select></Boundary>}
</div>}
createRoot(document.getElementById('app')).render(<App/>);`;
const scripts = {};
for (const arm of ["baseline", "runtime"]) {
  const prefix =
    arm === "runtime"
      ? `import * as Core from '@openuidev/react-ui-core';`
      : `import {Calendar} from '${root}/packages/react-ui/src/components/Calendar';import {DatePicker} from '${root}/packages/react-ui/src/components/DatePicker';import * as S from '${root}/packages/react-ui/src/components/Select';const Core={Calendar,DatePicker,...S};`;
  const result = await build({
    stdin: { contents: prefix + body, resolveDir: consumer, loader: "tsx" },
    bundle: true,
    write: false,
    format: "esm",
    platform: "browser",
    jsx: "automatic",
    ...(arm === "baseline"
      ? {
          nodePaths: [consumer + "/node_modules", dependencies],
          alias: {
            react: consumer + "/node_modules/react",
            "react-dom": consumer + "/node_modules/react-dom",
          },
        }
      : {}),
    define: { "process.env.NODE_ENV": '"production"' },
  });
  scripts[arm] = result.outputFiles[0].text;
}
const server = http.createServer((req, res) => {
  if (req.url.endsWith(".js")) {
    res.setHeader("content-type", "text/javascript");
    res.end(scripts[req.url.slice(1, -3)]);
  } else {
    res.setHeader("content-type", "text/html");
    res.end(
      `<div id="app"></div><script type="module" src="/${req.url.includes("runtime") ? "runtime" : "baseline"}.js"></script>`,
    );
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = {};
try {
  for (const arm of ["baseline", "runtime"]) {
    const page = await browser.newPage();
    page.setDefaultTimeout(8000);
    await page.clock.install({ time: new Date("2024-03-14T12:00:00Z") });
    await page.goto(`http://127.0.0.1:${server.address().port}/${arm}`);
    await page.locator("#plain [aria-selected=true]").waitFor();
    // Close permanently open Select so its modal focus/aria handling doesn't interfere with independent controls.
    const text = await page.locator("[role=option]").textContent();
    await page.keyboard.press("Escape");
    await page.evaluate(() => window.setMode("normal"));
    await page.evaluate(() => window.setDay(20));
    await page.waitForFunction(
      () => document.querySelector("#controlled [aria-selected=true]").textContent.trim() === "20",
    );
    const selected = await page.locator("#plain [aria-selected=true]").textContent();
    const trigger = page.locator("#date .openui-date-picker-renderer-floating-input-container");
    await trigger.click();
    await page
      .locator(".openui-date-picker-renderer-floating-content button")
      .filter({ hasText: /^14$/ })
      .last()
      .click();
    await trigger.click();
    await page.locator("#clear").click();
    const afterClear = await trigger.textContent();
    await page.evaluate(() => window.setMode("stuck"));
    const stuckTrigger = page.locator(
      "#stuck .openui-date-picker-renderer-floating-input-container",
    );
    await stuckTrigger.click();
    const stuck = await stuckTrigger.getAttribute("class");
    const triggerSemantics = await trigger.evaluate((el) => ({
      tag: el.tagName,
      tabindex: el.getAttribute("tabindex"),
      role: el.getAttribute("role"),
      onKey: el.getAttribute("onkeydown"),
    }));
    await page.evaluate(() => window.setMode("hide"));
    await page.locator("#error").waitFor();
    const hideError = await page.locator("#error").textContent();
    results[arm] = {
      plainCalendarSelectedAfterPropUpdate: selected.trim(),
      calendarWithOnSelectSelected: "20",
      textValueOptionText: text,
      datePickerAfterClear: afterClear,
      datePickerIsOpenTrueRemainsOpen: stuck.includes("-container-open"),
      triggerSemantics,
      hideError,
    };
    await page.close();
  }
  assert.deepEqual(results.baseline, results.runtime);
  console.log(JSON.stringify(results, null, 2));
  if (process.env.CORE_RISK_RESULTS)
    await fs.writeFile(process.env.CORE_RISK_RESULTS, JSON.stringify(results, null, 2) + "\n");
} finally {
  await browser.close();
  await new Promise((r) => server.close(r));
}
