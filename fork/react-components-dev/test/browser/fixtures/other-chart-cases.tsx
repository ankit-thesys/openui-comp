import * as UI from "openui-under-test";
import { chartSlug, otherChartCases, type OtherChart } from "../../fixtures/other-charts";

declare const __PARITY_BASELINE__: boolean;
const baseline = typeof __PARITY_BASELINE__ !== "undefined" && __PARITY_BASELINE__;
const common = { svg: "svg", group: "g", textLine: "tspan" };
const suffixes: Record<OtherChart, string[]> = {
  PieChart: ["svg-wrapper", "track"],
  RadarChart: [
    "svg-wrapper",
    "grid",
    "grid-ring",
    "grid-spoke",
    "series",
    "polygon-area",
    "polygon-stroke",
    "dot",
    "active-dots",
    "active-dot-outer",
    "active-dot-inner",
    "axis-labels",
    "axis-label",
  ],
  RadialChart: ["svg-wrapper", "grid", "grid-circle"],
  FunnelChart: ["ring", "stage", "readouts", "value", "pct", "pct-pill", "labels", "label"],
  HeatmapChart: [
    "cell",
    "cell-label",
    "x-axis",
    "x-tick",
    "y-axis",
    "y-tick",
    "color-scale",
    "color-scale-label",
    "color-scale-ramp",
    "color-scale-bucket",
  ],
  CalendarHeatmap: [
    "plot",
    "month-label",
    "weekday-label",
    "cell",
    "separator",
    "quarter-label",
    "legend",
    "legend-label",
    "legend-swatches",
    "legend-swatch-slot",
    "legend-swatch",
    "legend-gradient",
    "legend-gradient-hit",
  ],
  SegmentedBar: ["segment", "segment-line", "stacked-legend"],
};
function parts(chart: OtherChart) {
  const prefix = `openui-${chartSlug(chart)}`;
  const selectors: Record<string, string> = {
    ...common,
    root: baseline ? `.${prefix}-root` : `.${prefix}`,
    ...Object.fromEntries(suffixes[chart].map((part) => [part, `.${prefix}-${part}`])),
  };
  if (chart === "PieChart") {
    selectors["slice"] = baseline ? "svg > g > g > g > g > path:last-child" : `.${prefix}-slice`;
    selectors["sliceSecond"] = "svg > g > g > g:nth-child(2) > g > path:last-child";
    selectors["trackSecond"] = "svg > g > g > g:nth-child(2) > g > .openui-pie-chart-track";
    selectors["hitbox"] = baseline ? "svg > g > g > g > path" : `.${prefix}-hitbox`;
  }
  if (chart === "RadarChart") {
    selectors["areaSecond"] =
      ".openui-radar-chart-series > g:nth-child(2) > .openui-radar-chart-polygon-area";
    selectors["strokeSecond"] =
      ".openui-radar-chart-series > g:nth-child(2) > .openui-radar-chart-polygon-stroke";
  }
  if (chart === "FunnelChart")
    selectors["stageSecond"] = "svg > g > g:nth-child(2) > .openui-funnel-chart-stage";
  if (chart === "RadialChart")
    selectors["barSecond"] = "svg > g > g:last-child > path:nth-child(2)";
  if (chart === "HeatmapChart") {
    selectors["cellSecondColumn"] = "svg g > g:nth-child(2) > .openui-heatmap-chart-cell";
    selectors["labelSecondColumn"] = "svg g > g:nth-child(2) > .openui-heatmap-chart-cell-label";
  }
  if (chart === "RadialChart")
    selectors["bar"] = baseline ? "svg > g > g:last-child > path" : `.${prefix}-bar`;
  if (chart === "HeatmapChart")
    selectors["emptyCell"] = baseline ? `.${prefix}-cell--empty` : `.${prefix}-cell[data-empty]`;
  if (chart === "CalendarHeatmap") {
    selectors["cellSecond"] = ".openui-calendar-heatmap-cell:nth-of-type(2)";
    selectors["ghost"] = baseline ? `.${prefix}-cell--ghost` : `.${prefix}-cell[data-ghost]`;
    for (let level = 0; level < 5; level++)
      selectors[`level${level}`] = baseline
        ? `.${prefix}-cell--level-${level}`
        : `.${prefix}-cell[data-level="${level}"]`;
    selectors["pattern"] = "pattern";
    selectors["patternTile"] = "pattern > rect";
    selectors["patternDot"] = "pattern > circle";
    selectors["patternLine"] = "pattern > path";
  }
  if (chart === "SegmentedBar") selectors["track"] = baseline ? `.${prefix}` : `.${prefix}-track`;
  return selectors;
}

export function OtherChartCases({ chart }: { chart: OtherChart }) {
  return (
    <>
      {otherChartCases(UI, chart).map(({ id, element }) => (
        <section
          key={id}
          data-parity-case={id}
          data-parity-parts={JSON.stringify(parts(chart))}
          style={{ width: 480, marginBottom: 24 }}
        >
          {element}
        </section>
      ))}
    </>
  );
}
