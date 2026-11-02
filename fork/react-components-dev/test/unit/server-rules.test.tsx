// Node seam: a server render carries the rules of the classes it rendered, and only those, in
// React's hoisted component-rule tags (#178). Each contract entry's fixtures render on their own,
// so one component's rules cannot stand in for another's.
import { library } from "#paths";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { migratedComponents, otherChartContracts } from "./contract/components";

// Every contract entry serves exactly its rendered classes. These render no component markup on
// the server, so they have nothing to serve; the browser sheet styles them once they open.
const noServerMarkup = new Set([
  // Modal renders its dialog in a portal, which servers do not render.
  "Modal",
]);
const contracts = [...migratedComponents, ...otherChartContracts];

const GENERATED = /^go\d+$/;

// SVG-part modules. React renders <style> in place inside <svg>, so a chart's HTML root serves the
// whole style modules its SVG subtree uses; only their classes may be served without rendering.
// HTML elements stay exact.
const svgPartModules: Array<[path: string, exported: string]> = [
  ["shared/chartBase.styles", "chartBaseStyles"],
  ["shared/animations/drawLine.styles", "drawLineStyles"],
  ["shared/animations/fadeAppear.styles", "fadeAppearStyles"],
  ["shared/mini/miniChart.styles", "miniChartStyles"],
  ["LineChart/lineChart.styles", "lineChartStyles"],
  ["AreaChart/areaChart.styles", "areaChartStyles"],
  ["BarChart/barChart.styles", "barChartStyles"],
  ["BarChart/horizontalBarChart.styles", "horizontalBarChartStyles"],
  ["ScatterChart/scatterChart.styles", "scatterChartStyles"],
  ["PieChart/pieChart.styles", "pieChartStyles"],
  ["RadarChart/radarChart.styles", "radarChartStyles"],
  ["RadialChart/radialChart.styles", "radialChartStyles"],
  ["FunnelChart/funnelChart.styles", "funnelChartStyles"],
  ["HeatmapChart/heatmapChart.styles", "heatmapChartStyles"],
  ["CalendarHeatmap/calendarHeatmap.styles", "calendarHeatmapStyles"],
  ["MiniLineChart/miniLineChart.styles", "miniLineChartStyles"],
  ["MiniAreaChart/miniAreaChart.styles", "miniAreaChartStyles"],
  ["MiniBarChart/miniBarChart.styles", "miniBarChartStyles"],
];
type StyleModule = string | { [key: string]: StyleModule };
const svgPartClasses = new Set<string>();
const collectClasses = (module: StyleModule) => {
  if (typeof module === "string") module.split(" ").forEach((name) => svgPartClasses.add(name));
  else Object.values(module).forEach(collectClasses);
};
for (const [path, exported] of svgPartModules) {
  const module = (await import(library(`dist/components/Charts/${path}.mjs`))) as Record<
    string,
    StyleModule
  >;
  collectClasses(module[exported]!);
}

/** The hoisted component-rule tags in `html`: the classes each one serves, and its text. */
function servedTags(html: string) {
  return [...html.matchAll(/<style([^>]*)>([\s\S]*?)<\/style>/g)]
    .filter(([, attrs]) => /data-precedence="openui"/.test(attrs!))
    .map(([, attrs, text]) => ({
      classes: (/data-href="([^"]*)"/.exec(attrs!)?.[1] ?? "").split(" ").filter(Boolean),
      text: text!,
    }));
}

function renderedClasses(html: string) {
  const markup = html.replace(/<style[\s\S]*?<\/style>/g, "");
  const used = new Set<string>();
  for (const [, value] of markup.matchAll(/\sclass="([^"]*)"/g))
    for (const name of value!.split(/\s+/)) if (GENERATED.test(name)) used.add(name);
  return used;
}

describe("server-rendered component rules", () => {
  it("lists only real contract entries as rendering no server markup", () => {
    const folders = new Set(contracts.map((component) => component.folder));
    expect([...noServerMarkup].filter((folder) => !folders.has(folder))).toEqual([]);
  });

  for (const folder of noServerMarkup) {
    it(`${folder}: renders no generated classes on the server`, () => {
      const component = contracts.find((entry) => entry.folder === folder)!;
      const html = renderToString(<>{component.elements()}</>);
      expect([...renderedClasses(html)], "wire it and remove it from noServerMarkup").toEqual([]);
    });
  }

  for (const component of contracts) {
    if (noServerMarkup.has(component.folder)) continue;
    it(`${component.folder}: serves exactly the rendered classes, once each`, () => {
      const html = renderToString(<>{component.elements()}</>);
      const tags = servedTags(html);
      const served = tags.flatMap((tag) => tag.classes);
      const text = tags.map((tag) => tag.text).join("");
      const keyframes = new Set([...text.matchAll(/@keyframes (go\d+)/g)].map((match) => match[1]));
      const used = renderedClasses(html);

      expect(used.size, "the fixtures render generated classes").toBeGreaterThan(0);
      expect(
        [...used].filter((name) => !served.includes(name)),
        "rendered without a rule",
      ).toEqual([]);
      expect(
        served.filter(
          (name) => !used.has(name) && !keyframes.has(name) && !svgPartClasses.has(name),
        ),
        "served but not rendered",
      ).toEqual([]);
      expect(
        served.filter((name, index) => served.indexOf(name) !== index),
        "served twice",
      ).toEqual([]);
      // An SVG-part animation class holds only a named @keyframes, not a rule for itself.
      for (const name of served)
        if (!svgPartClasses.has(name)) expect(text, `${name} has its rule`).toContain(`.${name}`);
      for (const [, name] of text.matchAll(/animation[^;}]*\b(openui-chart-[\w-]+)/g))
        expect(text, `keyframes ${name} are served`).toContain(`@keyframes ${name}`);
      // React renders <style> in place inside SVG, where browsers would not get it from hydration.
      const inSvg = [...html.matchAll(/<svg[\s\S]*?<\/svg>/g)].filter(([svg]) =>
        /<style/.test(svg!),
      );
      expect(inSvg.length, "no <style> inside <svg>").toBe(0);
    });
  }
});
