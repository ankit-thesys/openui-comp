/**
 * The single registry of chart families under test.
 *
 * Both evidence paths read this one list: the SSR/geometry fixtures
 * (tests/*.baseline.test.tsx) and the browser screenshot fixture
 * (fixtures/browser/main.tsx). One registry means the screenshots and the
 * assertions are provably about the same props on the same data.
 *
 * `component` is the exported symbol taken straight from
 * packages/react-ui/src/components/Charts/index.ts — these fixtures import the
 * public entry point only, as an external consumer would, and never reach into
 * a family's internal parts.
 */
import {
  AreaChart,
  AreaChartCondensed,
  BarChart,
  BarChartCondensed,
  CalendarHeatmap,
  FunnelChart,
  HeatmapChart,
  HorizontalBarChart,
  LineChart,
  LineChartCondensed,
  MiniAreaChart,
  MiniBarChart,
  MiniLineChart,
  PieChart,
  RadarChart,
  RadialChart,
  ScatterChart,
  SegmentedBar,
  SingleStackedBar,
} from "../../../packages/react-ui/src/components/Charts";
import {
  CALENDAR_RANGE,
  CALENDAR_ROWS,
  MINI_SERIES,
  MULTI_SERIES_ROWS,
  SCATTER_DATASETS,
  SHARE_ROWS,
  SIZES,
} from "./datasets";

/** The frozen fixture datasets are readonly; the component props are not. */
const rows = MULTI_SERIES_ROWS as unknown as Array<Record<string, string | number>>;
const share = SHARE_ROWS as unknown as Array<Record<string, string | number>>;
const scatter = SCATTER_DATASETS as unknown as Array<{
  name: string;
  data: Array<{ x: number; y: number }>;
}>;
const calendar = CALENDAR_ROWS as unknown as Array<{ date: string; value: number }>;
const mini = MINI_SERIES as unknown as number[];

/** How a family sizes itself, which decides what "responsive" means for it. */
export type SizingMode =
  | "widthHeight" // numeric `width` + `height` props
  | "size" // the mini charts' single square `size` prop
  | "containerOnly"; // no size props at all — follows its container

export interface FamilyCase {
  /** Exported component name, as written in Charts/index.ts. */
  name: string;
  /** The element rendered for default-render evidence. */
  render: () => React.ReactElement;
  /** Same family, with `data={[]}` — drives the empty-data column. */
  renderEmpty?: () => React.ReactElement;
  sizing: SizingMode;
  /** Source file the family's implementation lives in, for the inventory. */
  source: string;
  /**
   * The class list on the family's OUTERMOST rendered node, verified against
   * real output rather than assumed. Note PieChart/RadialChart: their
   * `legendVariant` defaults to `"stacked"`, so the outermost node is the
   * shared stacked-legend wrapper, not the family's own container.
   */
  rootClass: string;
  /**
   * The family's own container class, which appears somewhere in the tree even
   * when a wrapper owns the root. Assertions use this; `rootClass` is recorded
   * evidence of the wrapper structure.
   */
  chartClass: string;
}

export const FAMILIES: FamilyCase[] = [
  {
    name: "AreaChart",
    source: "src/components/Charts/AreaChart/AreaChart.tsx",
    rootClass: "openui-area-chart-container",
    chartClass: "openui-area-chart-container",
    sizing: "widthHeight",
    render: () => <AreaChart data={rows} categoryKey="month" {...SIZES.standard} />,
    renderEmpty: () => <AreaChart data={[]} categoryKey="month" {...SIZES.standard} />,
  },
  {
    name: "AreaChartCondensed",
    source: "src/components/Charts/AreaChart/AreaChartCondensed.tsx",
    rootClass: "openui-area-chart-container",
    chartClass: "openui-area-chart-container",
    sizing: "widthHeight",
    render: () => <AreaChartCondensed data={rows} categoryKey="month" {...SIZES.standard} />,
    renderEmpty: () => <AreaChartCondensed data={[]} categoryKey="month" {...SIZES.standard} />,
  },
  {
    name: "LineChart",
    source: "src/components/Charts/LineChart/LineChart.tsx",
    rootClass: "openui-line-chart-container",
    chartClass: "openui-line-chart-container",
    sizing: "widthHeight",
    render: () => <LineChart data={rows} categoryKey="month" {...SIZES.standard} />,
    renderEmpty: () => <LineChart data={[]} categoryKey="month" {...SIZES.standard} />,
  },
  {
    name: "LineChartCondensed",
    source: "src/components/Charts/LineChart/LineChartCondensed.tsx",
    rootClass: "openui-line-chart-container",
    chartClass: "openui-line-chart-container",
    sizing: "widthHeight",
    render: () => <LineChartCondensed data={rows} categoryKey="month" {...SIZES.standard} />,
    renderEmpty: () => <LineChartCondensed data={[]} categoryKey="month" {...SIZES.standard} />,
  },
  {
    name: "BarChart",
    source: "src/components/Charts/BarChart/BarChart.tsx",
    rootClass: "openui-bar-chart-container",
    chartClass: "openui-bar-chart-container",
    sizing: "widthHeight",
    render: () => <BarChart data={rows} categoryKey="month" {...SIZES.standard} />,
    renderEmpty: () => <BarChart data={[]} categoryKey="month" {...SIZES.standard} />,
  },
  {
    name: "BarChartCondensed",
    source: "src/components/Charts/BarChart/BarChartCondensed.tsx",
    rootClass: "openui-bar-chart-container",
    chartClass: "openui-bar-chart-container",
    sizing: "widthHeight",
    render: () => <BarChartCondensed data={rows} categoryKey="month" {...SIZES.standard} />,
    renderEmpty: () => <BarChartCondensed data={[]} categoryKey="month" {...SIZES.standard} />,
  },
  {
    name: "HorizontalBarChart",
    source: "src/components/Charts/BarChart/HorizontalBarChart.tsx",
    rootClass: "openui-horizontal-bar-chart-container",
    chartClass: "openui-horizontal-bar-chart-container",
    sizing: "widthHeight",
    render: () => <HorizontalBarChart data={rows} categoryKey="month" {...SIZES.standard} />,
    renderEmpty: () => <HorizontalBarChart data={[]} categoryKey="month" {...SIZES.standard} />,
  },
  {
    name: "PieChart",
    source: "src/components/Charts/PieChart/PieChart.tsx",
    rootClass: "openui-chart-with-stacked-legend openui-chart-with-stacked-legend--row",
    chartClass: "openui-pie-chart-container",
    sizing: "widthHeight",
    render: () => (
      <PieChart data={share} categoryKey="browser" dataKey="visitors" {...SIZES.square} />
    ),
    renderEmpty: () => (
      <PieChart data={[]} categoryKey="browser" dataKey="visitors" {...SIZES.square} />
    ),
  },
  {
    name: "RadialChart",
    source: "src/components/Charts/RadialChart/RadialChart.tsx",
    rootClass: "openui-chart-with-stacked-legend openui-chart-with-stacked-legend--row",
    chartClass: "openui-radial-chart-container",
    sizing: "widthHeight",
    render: () => (
      <RadialChart data={share} categoryKey="browser" dataKey="visitors" {...SIZES.square} />
    ),
    renderEmpty: () => (
      <RadialChart data={[]} categoryKey="browser" dataKey="visitors" {...SIZES.square} />
    ),
  },
  {
    name: "RadarChart",
    source: "src/components/Charts/RadarChart/RadarChart.tsx",
    rootClass: "openui-radar-chart-container",
    chartClass: "openui-radar-chart-container",
    sizing: "widthHeight",
    render: () => <RadarChart data={rows} categoryKey="month" {...SIZES.square} />,
    renderEmpty: () => <RadarChart data={[]} categoryKey="month" {...SIZES.square} />,
  },
  {
    name: "FunnelChart",
    source: "src/components/Charts/FunnelChart/FunnelChart.tsx",
    rootClass: "openui-funnel-chart-container",
    chartClass: "openui-funnel-chart-container",
    sizing: "widthHeight",
    render: () => (
      <FunnelChart data={share} categoryKey="browser" dataKey="visitors" {...SIZES.standard} />
    ),
    renderEmpty: () => (
      <FunnelChart data={[]} categoryKey="browser" dataKey="visitors" {...SIZES.standard} />
    ),
  },
  {
    name: "HeatmapChart",
    source: "src/components/Charts/HeatmapChart/HeatmapChart.tsx",
    rootClass: "openui-heatmap-chart-container",
    chartClass: "openui-heatmap-chart-container",
    sizing: "widthHeight",
    render: () => <HeatmapChart data={rows} categoryKey="month" {...SIZES.standard} />,
    renderEmpty: () => <HeatmapChart data={[]} categoryKey="month" {...SIZES.standard} />,
  },
  {
    name: "ScatterChart",
    source: "src/components/Charts/ScatterChart/ScatterChart.tsx",
    rootClass: "openui-scatter-chart-container",
    chartClass: "openui-scatter-chart-container",
    sizing: "widthHeight",
    render: () => <ScatterChart data={scatter} {...SIZES.standard} />,
    renderEmpty: () => <ScatterChart data={[]} {...SIZES.standard} />,
  },
  {
    name: "SegmentedBar",
    source: "src/components/Charts/SegmentedBar/SegmentedBar.tsx",
    rootClass: "openui-segmented-bar-container openui-segmented-bar-container--gap",
    chartClass: "openui-segmented-bar-container",
    sizing: "containerOnly",
    render: () => <SegmentedBar data={share} categoryKey="browser" dataKey="visitors" />,
    renderEmpty: () => <SegmentedBar data={[]} categoryKey="browser" dataKey="visitors" />,
  },
  {
    name: "SingleStackedBar",
    source: "src/components/Charts/SegmentedBar/SingleStackedBar.tsx",
    rootClass: "openui-segmented-bar-container openui-segmented-bar-container--gap",
    chartClass: "openui-segmented-bar-container",
    sizing: "containerOnly",
    render: () => <SingleStackedBar data={share} categoryKey="browser" dataKey="visitors" />,
    renderEmpty: () => <SingleStackedBar data={[]} categoryKey="browser" dataKey="visitors" />,
  },
  {
    name: "CalendarHeatmap",
    source: "src/components/Charts/CalendarHeatmap/CalendarHeatmap.tsx",
    rootClass: "openui-calendar-heatmap-container",
    chartClass: "openui-calendar-heatmap-container",
    sizing: "widthHeight",
    // `range` is pinned: the "6m"/"12m" presets are relative to TODAY.
    render: () => <CalendarHeatmap data={calendar} range={CALENDAR_RANGE} {...SIZES.standard} />,
    renderEmpty: () => <CalendarHeatmap data={[]} range={CALENDAR_RANGE} {...SIZES.standard} />,
  },
  {
    name: "MiniAreaChart",
    source: "src/components/Charts/MiniAreaChart/MiniAreaChart.tsx",
    rootClass: "openui-mini-chart openui-mini-area-chart-container",
    chartClass: "openui-mini-area-chart-container",
    sizing: "size",
    render: () => <MiniAreaChart data={mini} size={160} />,
    renderEmpty: () => <MiniAreaChart data={[]} size={160} />,
  },
  {
    name: "MiniBarChart",
    source: "src/components/Charts/MiniBarChart/MiniBarChart.tsx",
    rootClass: "openui-mini-chart openui-mini-bar-chart-container",
    chartClass: "openui-mini-bar-chart-container",
    sizing: "size",
    render: () => <MiniBarChart data={mini} size={160} />,
    renderEmpty: () => <MiniBarChart data={[]} size={160} />,
  },
  {
    name: "MiniLineChart",
    source: "src/components/Charts/MiniLineChart/MiniLineChart.tsx",
    rootClass: "openui-mini-chart openui-mini-line-chart-container",
    chartClass: "openui-mini-line-chart-container",
    sizing: "size",
    render: () => <MiniLineChart data={mini} size={160} />,
    renderEmpty: () => <MiniLineChart data={[]} size={160} />,
  },
];

export const FAMILY_NAMES = FAMILIES.map((f) => f.name);
