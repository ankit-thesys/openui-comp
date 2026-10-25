import assert from "node:assert/strict";
import http from "node:http";
import { createRequire } from "node:module";
import path from "node:path";
import { after, before, test } from "node:test";

const consumer = process.env.CORE_CONSUMER || path.resolve("packages/react-ui-core");
const tools = createRequire(path.resolve(process.env.CORE_TEST_TOOLS || consumer, "package.json"));
let browser, server, page;
const pageErrors = [];
before(async () => {
  const { build } = tools("esbuild");
  const result = await build({
    stdin: {
      contents: `import React from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {PieChart, RadialChart, RadarChart, HeatmapChart, FunnelChart, CalendarHeatmap, SegmentedBar, SingleStackedBar, LegendStoreProvider, StackedLegend, useLegendEntry, ThemeProvider, LineChart, PrintContextProvider} from '@openuidev/react-ui-core';
const root=createRoot(document.getElementById('root'));
window.calls=[];
window.renderChart=(props,print=false)=>flushSync(()=>root.render(
 print?React.createElement(PrintContextProvider,null,React.createElement(PieChart,props)):React.createElement(PieChart,props)
));
window.pie=(data,extra={},print=false)=>window.renderChart({data,categoryKey:'name',dataKey:'value',legend:false,width:320,height:300,onClick:(row,index)=>window.calls.push({row,index}),...extra},print);
window.radial=(data,extra={},print=false)=>flushSync(()=>{
const chart=React.createElement(RadialChart,{data,categoryKey:'name',dataKey:'value',legend:false,width:320,height:300,onClick:(row,index)=>window.calls.push({row,index}),...extra});
root.render(print?React.createElement(PrintContextProvider,null,chart):chart);
});
window.radar=(data,extra={})=>flushSync(()=>root.render(React.createElement(RadarChart,{data,categoryKey:'name',legend:false,width:360,height:320,...extra})));
window.heatmap=(data,extra={})=>flushSync(()=>root.render(React.createElement(HeatmapChart,{data,categoryKey:'name',legend:false,width:500,height:320,onClick:(row,columnIndex,rowKey)=>window.calls.push({row,columnIndex,rowKey}),...extra})));
window.funnel=(data,extra={})=>flushSync(()=>root.render(React.createElement(FunnelChart,{data,categoryKey:'name',dataKey:'value',legend:false,width:500,height:320,onClick:(row,index)=>window.calls.push({row,index}),...extra})));
window.calendar=(data,extra={})=>flushSync(()=>root.render(React.createElement(CalendarHeatmap,{data,range:['2026-01-04','2026-01-10'],width:500,height:300,isAnimationActive:false,onClick:(date,value)=>window.calls.push({date:[date.getFullYear(),date.getMonth()+1,date.getDate()],value}),...extra})));
window.segmented=(data,extra={},alias=false)=>flushSync(()=>root.render(React.createElement(alias?SingleStackedBar:SegmentedBar,{data,categoryKey:'name',dataKey:'value',legend:false,style:{width:500},...extra})));
window.sameSegmentedAlias=SingleStackedBar===SegmentedBar;
function ReadEntry(){const entry=useLegendEntry('detached');return React.createElement('output',{id:'legend-entry'},entry?JSON.stringify(entry.hiddenKeys):'none');}
window.remotePie=(data,show=true)=>flushSync(()=>root.render(React.createElement(LegendStoreProvider,null,
 show?React.createElement(PieChart,{data,categoryKey:'name',dataKey:'value',width:320,height:300,legendKey:'detached'}):null,
 React.createElement(StackedLegend,{legendKey:'detached',layout:'showMore'}),React.createElement(ReadEntry))));
window.measureLine=(tracking=null,themeTracking=undefined)=>{
flushSync(()=>root.render(null));
const chart=React.createElement('div',{style:tracking===null?{}:{'--openui-text-label-xs-letter-spacing':tracking}},React.createElement(LineChart,{data:[{name:'Q1',Alpha:10,Beta:15},{name:'Q2',Alpha:20,Beta:-8},{name:'Q3',Alpha:30,Beta:15}],categoryKey:'name',height:320,width:640,legend:false}));
flushSync(()=>root.render(themeTracking===undefined?chart:React.createElement(ThemeProvider,{cssSelector:'#root',lightTheme:{textLabelXsLetterSpacing:themeTracking}},chart)));
};
window.ready=true;`,
      resolveDir: consumer,
      loader: "tsx",
    },
    bundle: true,
    write: false,
    format: "esm",
    platform: "browser",
    jsx: "automatic",
    define: { "process.env.NODE_ENV": '"production"' },
    external: ["katex/dist/katex.min.css"],
  });
  const script = result.outputFiles[0].text;
  server = http.createServer((req, res) => {
    if (req.url === "/app.js") {
      res.setHeader("Content-Type", "text/javascript");
      res.end(script);
    } else {
      res.setHeader("Content-Type", "text/html");
      res.end('<!doctype html><div id="root"></div><script type="module" src="/app.js"></script>');
    }
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  browser = await tools("playwright").chromium.launch({ channel: "chrome", headless: true });
  page = await browser.newPage();
  page.setDefaultTimeout(10000);
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.waitForFunction(() => window.ready);
});
after(async () => {
  await browser?.close();
  if (server) await new Promise((resolve) => server.close(resolve));
  assert.deepEqual(pageErrors, [], "no uncaught chart browser errors");
});

test("public Pie chart preserves streaming empty transitions, click rows, donut tracks and print JSON", async () => {
  const rows = [
    { name: "Alpha", value: 30 },
    { name: "Beta", value: 70 },
  ];
  await page.evaluate(() => window.pie([]));
  assert.equal(await page.locator(".openui-chart-empty-text").textContent(), "No data available");
  await page.evaluate((rows) => window.pie(rows), rows);
  await page.getByRole("img", { name: "Pie chart", exact: true }).waitFor();
  assert.equal(await page.locator('path[fill="transparent"]').count(), 2);
  await page.locator('path[fill="transparent"]').first().dispatchEvent("click");
  assert.deepEqual(await page.evaluate(() => window.calls), [{ row: rows[1], index: 0 }]);
  assert.equal(await page.locator("[data-openui-chart]").count(), 0);
  await page.evaluate((rows) => window.pie(rows, { variant: "donut" }, true), rows);
  assert.equal(await page.locator(".openui-pie-chart-track").count(), 2);
  const exported = JSON.parse(
    await page.locator("[data-openui-chart]").getAttribute("data-openui-chart"),
  );
  assert.equal(exported.type, "pie");
  assert.deepEqual(exported.data, [{ name: "value", labels: ["Beta", "Alpha"], values: [70, 30] }]);
  await page.evaluate(() => window.pie([]));
  assert.equal(await page.locator(".openui-chart-empty-text").textContent(), "No data available");
  await page.evaluate((rows) => window.pie(rows), rows);
  assert.equal(await page.locator('path[fill="transparent"]').count(), 2);
});

test("public Radial chart preserves semi-circular grid, click data, empty recovery and export shape", async () => {
  const rows = [
    { name: "Alpha", value: 30 },
    { name: "Beta", value: 70 },
  ];
  await page.evaluate(() => {
    window.calls = [];
    window.radial([]);
  });
  assert.equal(await page.locator(".openui-chart-empty-text").textContent(), "No data available");
  await page.evaluate((rows) => window.radial(rows, { grid: true, variant: "semiCircular" }), rows);
  await page.getByRole("img", { name: "Radial chart", exact: true }).waitFor();
  assert.equal(
    await page.locator('.openui-radial-chart-svg-wrapper path:not([fill="none"])').count(),
    2,
  );
  assert((await page.locator(".openui-radial-chart-grid-circle").count()) > 0);
  await page
    .locator('.openui-radial-chart-svg-wrapper path:not([fill="none"])')
    .first()
    .dispatchEvent("click");
  assert.deepEqual(await page.evaluate(() => window.calls), [{ row: rows[1], index: 0 }]);
  await page.evaluate((rows) => window.radial(rows, {}, true), rows);
  const exported = JSON.parse(
    await page.locator("[data-openui-chart]").getAttribute("data-openui-chart"),
  );
  assert.equal(exported.type, "pie");
  assert.deepEqual(exported.data, [{ name: "value", labels: ["Beta", "Alpha"], values: [70, 30] }]);
});

test("public Radar chart preserves series polygons, dots, grid variants and empty streaming recovery", async () => {
  const rows = [
    { name: "Speed", first: 30, second: 70 },
    { name: "Quality", first: 80, second: 40 },
    { name: "Price", first: 50, second: 60 },
  ];
  await page.evaluate(() => window.radar([]));
  assert.equal(await page.locator(".openui-chart-empty-text").textContent(), "No data available");
  await page.evaluate(
    (rows) => window.radar(rows, { variant: "area", showDots: true, gridLevels: 3 }),
    rows,
  );
  await page.getByRole("img", { name: "Radar chart", exact: true }).waitFor();
  assert.equal(
    await page
      .locator(".openui-radar-chart-svg-wrapper > svg")
      .evaluate((n) => getComputedStyle(n).overflow),
    "visible",
  );
  assert.equal(await page.locator(".openui-radar-chart-polygon-area").count(), 2);
  assert.equal(await page.locator(".openui-radar-chart-dot").count(), 6);
  assert.equal(await page.locator("polygon.openui-radar-chart-grid-ring").count(), 3);
  assert.deepEqual(
    await page
      .locator(".openui-radar-chart-polygon-area")
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("fill-opacity"))),
    ["0.2", "0.2"],
  );
  await page.evaluate(
    (rows) => window.radar(rows, { gridShape: "circle", gridLevels: 2, fillOpacity: 0.6 }),
    rows,
  );
  assert.equal(await page.locator("circle.openui-radar-chart-grid-ring").count(), 2);
  assert.equal(await page.locator(".openui-radar-chart-dot").count(), 0);
  assert.deepEqual(
    await page
      .locator(".openui-radar-chart-polygon-area")
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("fill-opacity"))),
    ["0.6", "0.6"],
  );
  await page.evaluate(() => window.radar([]));
  assert.equal(await page.locator(".openui-chart-empty-text").textContent(), "No data available");
  await page.evaluate((rows) => window.radar(rows), rows);
  assert.equal(
    await page
      .locator(".openui-radar-chart-svg-wrapper > svg")
      .evaluate((n) => getComputedStyle(n).overflow),
    "visible",
  );
  assert.equal(await page.locator(".openui-radar-chart-polygon-area").count(), 2);
});

test("public Heatmap preserves missing cells, signed ramp, click identity and streaming row updates", async () => {
  const rows = [
    { name: "Jan", first: 10, second: "missing" },
    { name: "Feb", first: -20, second: 30 },
  ];
  await page.evaluate(() => {
    window.calls = [];
    window.heatmap([]);
  });
  assert.equal(await page.locator(".openui-chart-empty-text").textContent(), "No data available");
  await page.evaluate(
    (rows) => window.heatmap(rows, { rampMode: "diverging", showCellLabels: true }),
    rows,
  );
  await page.getByRole("img", { name: "Heatmap chart", exact: true }).waitFor();
  assert.equal(await page.locator(".openui-heatmap-chart-cell").count(), 4);
  assert.equal(await page.locator(".openui-heatmap-chart-cell--empty").count(), 1);
  assert.equal(await page.locator(".openui-heatmap-chart-color-scale-ramp--diverging").count(), 1);
  assert.equal(
    await page
      .locator(".openui-heatmap-chart-color-scale-ramp--diverging")
      .evaluate((n) => getComputedStyle(n, "::after").width),
    "2px",
  );
  await page.locator(".openui-heatmap-chart-cell").nth(1).dispatchEvent("click");
  assert.deepEqual(await page.evaluate(() => window.calls), [
    { row: rows[0], columnIndex: 0, rowKey: "second" },
  ]);
  await page.evaluate(
    (rows) =>
      window.heatmap([...rows, { name: "Mar", first: 40, second: 50 }], { showColorScale: false }),
    rows,
  );
  assert.equal(await page.locator(".openui-heatmap-chart-cell").count(), 6);
  assert.equal(await page.locator(".openui-heatmap-chart-color-scale").count(), 0);
  await page.evaluate(() => window.heatmap([]));
  assert.equal(await page.locator(".openui-chart-empty-text").textContent(), "No data available");
  await page.evaluate((rows) => window.heatmap(rows), rows);
  assert.equal(await page.locator(".openui-heatmap-chart-cell").count(), 4);
});

test("public Funnel preserves layers, retention values, orientation and click identity during stream updates", async () => {
  const rows = [
    { name: "Visits", value: 100 },
    { name: "Signup", value: 50 },
    { name: "Paid", value: 10 },
  ];
  await page.evaluate(() => {
    window.calls = [];
    window.funnel([]);
  });
  assert.equal(await page.locator(".openui-chart-empty-text").textContent(), "No data available");
  await page.evaluate((rows) => window.funnel(rows, { layers: 2 }), rows);
  await page.getByRole("img", { name: "Funnel chart", exact: true }).waitFor();
  assert.equal(await page.locator(".openui-funnel-chart-ring").count(), 6);
  assert.equal(
    await page
      .locator(".openui-funnel-chart-ring")
      .first()
      .evaluate((n) => getComputedStyle(n).transitionProperty),
    "d, fill-opacity",
  );
  assert.deepEqual(await page.locator(".openui-funnel-chart-pct").allTextContents(), [
    "100%",
    "50%",
    "10%",
  ]);
  await page.locator('rect[fill="transparent"]').nth(1).dispatchEvent("click");
  assert.deepEqual(await page.evaluate(() => window.calls), [{ row: rows[1], index: 1 }]);
  await page.evaluate(
    (rows) =>
      window.funnel(rows, {
        orientation: "vertical",
        edges: "straight",
        layers: 1,
        showLabels: false,
        showValues: false,
      }),
    rows,
  );
  assert.equal(await page.locator(".openui-funnel-chart-ring").count(), 3);
  assert.equal(await page.locator(".openui-funnel-chart-label").count(), 0);
  assert.equal(await page.locator(".openui-funnel-chart-value").count(), 0);
  await page.evaluate(() => window.funnel([]));
  assert.equal(await page.locator(".openui-chart-empty-text").textContent(), "No data available");
  await page.evaluate((rows) => window.funnel(rows), rows);
  assert.equal(await page.locator(".openui-funnel-chart-stage").count(), 3);
});

test("public Calendar heatmap sums duplicate days, preserves level-hover dimming and switches legend variants", async () => {
  const rows = [
    { date: "2026-01-05", value: 2 },
    { date: "2026-01-05", value: 3 },
    { date: "2026-01-07", value: 1 },
  ];
  await page.evaluate(() => {
    window.calls = [];
    window.calendar([]);
  });
  assert.equal(await page.locator(".openui-chart-empty-text").textContent(), "No data available");
  await page.evaluate((rows) => window.calendar(rows), rows);
  await page.getByRole("img", { name: "Calendar heatmap chart", exact: true }).waitFor();
  assert.equal(await page.locator(".openui-calendar-heatmap-cell").count(), 7);
  assert.equal(await page.locator(".openui-calendar-heatmap-cell--level-4").count(), 1);
  await page.locator(".openui-calendar-heatmap-cell--level-4").dispatchEvent("click");
  assert.deepEqual(await page.evaluate(() => window.calls), [{ date: [2026, 1, 5], value: 5 }]);
  await page.locator(".openui-calendar-heatmap-legend-swatch-slot").first().hover();
  await page.waitForFunction(
    () =>
      getComputedStyle(document.querySelector(".openui-calendar-heatmap-cell--level-4"))
        .fillOpacity === "0.3",
  );
  await page.mouse.move(900, 700);
  await page.evaluate(
    (rows) =>
      window.calendar(rows, {
        legendVariant: "gradient",
        levelStyles: [null, null, null, null, { pattern: "dots", color: "#123456" }],
      }),
    rows,
  );
  assert.equal(await page.locator(".openui-calendar-heatmap-legend-gradient").count(), 1);
  assert((await page.locator("pattern").count()) > 0);
  assert.equal(
    await page.locator("pattern circle").evaluate((n) => getComputedStyle(n).fill),
    "oklch(0.994 0 89.876)",
  );
  await page.evaluate(() => window.calendar([]));
  assert.equal(await page.locator(".openui-chart-empty-text").textContent(), "No data available");
  await page.evaluate((rows) => window.calendar(rows), rows);
  assert.equal(await page.locator(".openui-calendar-heatmap-cell").count(), 7);
});

test("public SegmentedBar preserves shares, hover feedback, empty recovery and SingleStackedBar alias", async () => {
  const rows = [
    { name: "Alpha", value: 50 },
    { name: "Beta", value: 30 },
    { name: "Gamma", value: 20 },
  ];
  assert.equal(await page.evaluate(() => window.sameSegmentedAlias), true);
  await page.evaluate(() => window.segmented([]));
  assert.equal(await page.locator(".openui-chart-empty-text").textContent(), "No data available");
  await page.evaluate((rows) => window.segmented(rows), rows);
  await page.getByRole("img", { name: "Segmented bar", exact: true }).waitFor();
  assert.deepEqual(
    await page
      .locator(".openui-segmented-bar-segment")
      .evaluateAll((nodes) => nodes.map((n) => n.style.width)),
    ["50%", "30%", "20%"],
  );
  assert.equal(
    await page.locator(".openui-segmented-bar").evaluate((n) => getComputedStyle(n).height),
    "20px",
  );
  await page.locator(".openui-segmented-bar-segment").nth(1).hover();
  await page.waitForFunction(
    () =>
      getComputedStyle(document.querySelector(".openui-segmented-bar-segment")).opacity === "0.5",
  );
  assert((await page.locator(".openui-chart-tooltip").textContent()).includes("Beta"));
  await page.mouse.move(900, 700);
  await page.evaluate(
    (rows) => window.segmented(rows, { legend: true, legendVariant: "stacked" }, true),
    rows,
  );
  assert.equal(await page.locator(".openui-stacked-legend__item").count(), 3);
  await page.evaluate(() => window.segmented([]));
  assert.equal(await page.locator(".openui-chart-empty-text").textContent(), "No data available");
  await page.evaluate((rows) => window.segmented(rows, {}, true), rows);
  assert.equal(await page.locator(".openui-segmented-bar-segment").count(), 3);
});

test("public detached legend toggles the publishing chart, prevents hiding every slice and removes entries on unmount", async () => {
  const rows = [
    { name: "Alpha", value: 30 },
    { name: "Beta", value: 70 },
  ];
  await page.evaluate((rows) => window.remotePie(rows), rows);
  const legendRows = page.locator(".openui-stacked-legend__item");
  await page.waitForFunction(
    () => document.querySelectorAll(".openui-stacked-legend__item").length === 2,
  );
  assert.equal(await page.locator('path[fill="transparent"]').count(), 2);
  assert.equal(
    await page.locator(".openui-chart-legend-container").count(),
    0,
    "remote legend suppresses inline legend",
  );
  await legendRows.first().click();
  await page.waitForFunction(
    () => document.querySelectorAll('path[fill="transparent"]').length === 1,
  );
  assert.equal(await page.locator("#legend-entry").textContent(), '["Beta"]');
  await legendRows.nth(1).click();
  assert.equal(
    await page.locator('path[fill="transparent"]').count(),
    1,
    "last visible slice is preserved",
  );
  await legendRows.first().click();
  await page.waitForFunction(
    () => document.querySelectorAll('path[fill="transparent"]').length === 2,
  );
  await page.evaluate((rows) => window.remotePie(rows, false), rows);
  await page.waitForFunction(() => document.querySelector("#legend-entry").textContent === "none");
  assert.equal(await legendRows.count(), 0, "unpublished detached legend clears its rows");
});

test("public Line measurement matches rendered default tracking and preserves zero and CSS-token precedence", async () => {
  const width = () => page.locator(".openui-line-chart-y-axis-container svg").getAttribute("width");
  await page.evaluate(() => window.measureLine());
  await page.waitForFunction(() => document.querySelector(".openui-line-chart-y-tick") !== null);
  assert.equal(await width(), "27", "legacy no-provider Y-axis budget");
  await page.evaluate(() => window.measureLine("0"));
  assert.equal(await width(), "28", "explicit CSS zero tracking is retained");
  await page.evaluate(() => window.measureLine(null, "0"));
  assert.equal(await width(), "28", "explicit theme zero tracking is retained");
  await page.evaluate(() => window.measureLine("1px", "0"));
  assert.equal(await width(), "31", "render-scope CSS tracking wins over theme zero");
});
