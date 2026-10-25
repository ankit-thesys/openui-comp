import * as Core from "@openuidev/react-ui-core";
const rows = [
  { name: "Jan", value: 20 },
  { name: "Feb", value: 30 },
];
const base = { data: rows, categoryKey: "name" as const, width: "100%", height: 300 };
const categorical = { ...base, dataKey: "value" as const };
const area: Core.AreaChartProps<typeof rows> = {
  ...base,
  variant: "natural",
  stacked: true,
  tickVariant: "angled",
};
const areaCondensed: Core.AreaChartCondensedProps<typeof rows> = area;
const line: Core.LineChartProps<typeof rows> = { ...base, variant: "natural" };
const lineCondensed: Core.LineChartCondensedProps<typeof rows> = line;
const bar: Core.BarChartProps<typeof rows> = {
  ...base,
  variant: "grouped",
  orientation: "horizontal",
  onClick: (row, index) => {
    const value: number = row.value;
    void [value, index];
  },
};
const barCondensed: Core.BarChartCondensedProps<typeof rows> = bar;
const horizontal: Core.HorizontalBarChartProps<typeof rows> = { ...base, variant: "stacked" };
const pie: Core.PieChartProps<typeof rows> = {
  ...categorical,
  variant: "donut",
  appearance: "semiCircular",
  legendVariant: "stacked",
};
const radial: Core.RadialChartProps<typeof rows> = {
  ...categorical,
  variant: "semiCircular",
  grid: true,
};
const radar: Core.RadarChartProps<typeof rows> = {
  ...base,
  gridShape: "polygon",
  showDots: true,
  variant: "area",
};
const heatmap: Core.HeatmapChartProps<typeof rows> = {
  ...base,
  rampMode: "diverging",
  showCellLabels: true,
  onClick: (row, columnIndex, rowKey) => {
    const value: number = row.value;
    void [value, columnIndex, rowKey];
  },
};
const funnel: Core.FunnelChartProps<typeof rows> = {
  ...categorical,
  orientation: "vertical",
  edges: "straight",
  layers: 2,
};
const segmented: Core.SegmentedBarProps<typeof rows> = {
  ...categorical,
  legendVariant: "stacked",
  style: { width: 400 },
};
const single: Core.SingleStackedBarProps<typeof rows> = segmented;
const calendar: Core.CalendarHeatmapProps = {
  data: [{ date: "2026-01-05", value: 10 }],
  range: ["2026-01-01", "2026-01-31"],
  levelStyles: [null, { pattern: "dots" }],
  onClick: (date, value) => {
    const actualDate: Date = date;
    const number: number = value;
    void [actualDate, number];
  },
};
const scatter: Core.ScatterChartProps = {
  data: [{ name: "Series", data: [{ x: 1, y: 2, metadata: "row" }] }],
  onClick: (point, name, datasetIndex, pointIndex) => {
    const x: number = point.x;
    void [x, name, datasetIndex, pointIndex];
  },
};
const miniArea: Core.MiniAreaChartProps = {
  data: [1, 2, 3],
  variant: "step",
  size: 120,
  useGradient: true,
};
const miniBar: Core.MiniBarChartProps = {
  data: [{ value: 1, label: "One" }],
  size: "100%",
  radius: 2,
};
const miniLine: Core.MiniLineChartProps = {
  data: [1, 2],
  variant: "natural",
  lineColor: "#123456",
};
// @ts-expect-error Preserve the existing Pie variant vocabulary.
const badPie: Core.PieChartProps<typeof rows> = { ...categorical, variant: "stacked" };
// @ts-expect-error No new sx styling API.
const badStyle: Core.PieChartProps<typeof rows> = { ...categorical, sx: {} };
// @ts-expect-error Calendar requires its date/value shape.
const badCalendar: Core.CalendarHeatmapProps = { data: rows };
void [
  area,
  areaCondensed,
  line,
  lineCondensed,
  bar,
  barCondensed,
  horizontal,
  pie,
  radial,
  radar,
  heatmap,
  funnel,
  segmented,
  single,
  calendar,
  scatter,
  miniArea,
  miniBar,
  miniLine,
  badPie,
  badStyle,
  badCalendar,
];
