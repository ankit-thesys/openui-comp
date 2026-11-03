# Chart family inventory

**Baseline SHA:** `9d73d17d2bbac565672a85e78f6eb7740cb0d9ca`
**Package:** `@openuidev/react-ui` v0.18.1 (`packages/react-ui`)

Derived from source, not from documentation. Every path below is relative to
`packages/react-ui/`. The public entry point for all of it is
`src/components/Charts/index.ts`, which the package barrel re-exports wholesale
at `src/index.ts:73` (`export * from "./components/Charts"`), so everything
here is reachable as `@openuidev/react-ui`.

This file is kept honest by `tests/inventory.baseline.test.ts`, which parses the
barrel and fails if a chart component exists that the fixture registry does not
cover, or vice versa. The counts below are asserted there, not hand-maintained.

## Totals

- **19 exported chart components** across **14 source directories**.
- **8 exported non-component values** (one provider, one hook, one legend
  renderer, one constant, four ScatterChart helpers).
- 5 of the 19 components are thin wrappers that preset a prop on a sibling.

## Families

| # | Component | Source | Wrapper of | Key types |
|---|---|---|---|---|
| 1 | `AreaChart` | `src/components/Charts/AreaChart/AreaChart.tsx` | — | `AreaChartData`, `AreaChartProps`, `AreaChartVariant` |
| 2 | `AreaChartCondensed` | `src/components/Charts/AreaChart/AreaChartCondensed.tsx:7` | `AreaChart` + `condensed` | `AreaChartCondensedProps` = `Omit<AreaChartProps, "condensed">` |
| 3 | `LineChart` | `src/components/Charts/LineChart/LineChart.tsx` | — | `LineChartData`, `LineChartProps`, `LineChartVariant` |
| 4 | `LineChartCondensed` | `src/components/Charts/LineChart/LineChartCondensed.tsx` | `LineChart` + `condensed` | `LineChartCondensedProps` |
| 5 | `BarChart` | `src/components/Charts/BarChart/BarChart.tsx` | — | `BarChartData`, `BarChartProps`, `BarChartVariant`, `BarChartOrientation` |
| 6 | `BarChartCondensed` | `src/components/Charts/BarChart/BarChartCondensed.tsx` | `BarChart` + `condensed` | `BarChartCondensedProps` |
| 7 | `HorizontalBarChart` | `src/components/Charts/BarChart/HorizontalBarChart.tsx:12` | `BarChart` + `orientation="horizontal"` | `HorizontalBarChartData`, `HorizontalBarChartProps` = `Omit<BarChartProps, "orientation">`, `HorizontalBarChartVariant` |
| 8 | `PieChart` | `src/components/Charts/PieChart/PieChart.tsx` | — | `PieChartData`, `PieChartProps` |
| 9 | `RadialChart` | `src/components/Charts/RadialChart/RadialChart.tsx` | — | `RadialChartData`, `RadialChartProps` |
| 10 | `RadarChart` | `src/components/Charts/RadarChart/RadarChart.tsx` | — | `RadarChartData`, `RadarChartProps` |
| 11 | `ScatterChart` | `src/components/Charts/ScatterChart/ScatterChart.tsx` | — | `ScatterChartData`, `ScatterChartProps`, `ScatterDataset`, `ScatterPoint` |
| 12 | `HeatmapChart` | `src/components/Charts/HeatmapChart/HeatmapChart.tsx` | — | `HeatmapChartData`, `HeatmapChartProps` |
| 13 | `FunnelChart` | `src/components/Charts/FunnelChart/FunnelChart.tsx` | — | `FunnelChartData`, `FunnelChartProps`, `FunnelEdges`, `FunnelOrientation` |
| 14 | `SegmentedBar` | `src/components/Charts/SegmentedBar/SegmentedBar.tsx` | — | `SegmentedBarData`, `SegmentedBarProps` |
| 15 | `SingleStackedBar` | `src/components/Charts/SegmentedBar/SingleStackedBar.tsx` | sibling of `SegmentedBar` | `SingleStackedBarData`, `SingleStackedBarProps` |
| 16 | `CalendarHeatmap` | `src/components/Charts/CalendarHeatmap/CalendarHeatmap.tsx` | — | `CalendarHeatmapDatum`, `CalendarHeatmapProps` |
| 17 | `MiniAreaChart` | `src/components/Charts/MiniAreaChart/MiniAreaChart.tsx` | — | `MiniAreaChartData`, `MiniAreaChartProps` |
| 18 | `MiniBarChart` | `src/components/Charts/MiniBarChart/MiniBarChart.tsx` | — | `MiniBarChartData`, `MiniBarChartProps` |
| 19 | `MiniLineChart` | `src/components/Charts/MiniLineChart/MiniLineChart.tsx` | — | `MiniLineChartData`, `MiniLineChartProps` |

## Non-component exports

| Export | Source | What it is |
|---|---|---|
| `LegendStoreProvider` | `src/components/Charts/shared/core/legend` (barrel line 73) | Context provider for the shared legend store |
| `useLegendEntry` | same | Hook publishing one legend entry |
| `StackedLegend` | `src/components/Charts/shared/core/StackedLegend` (line 75) | Standalone legend renderer; type `StackedLegendProps` |
| `CHART_CLASS_PREFIX` | `src/components/Charts/utils/constants` (line 86) | Class-name prefix constant (`"openui"`) |
| `calculateScatterDomain` | `src/components/Charts/ScatterChart` (lines 32–38) | Scatter helper |
| `formatScatterTooltipValue` | same | Scatter helper |
| `getScatterDatasets` | same | Scatter helper |
| `transformScatterData` | same | Scatter helper |

Also exported as types only: `LegendEntry`, `StackedLegendItem` (line 74), and
the shared chart types `BaseChartProps`, `ChartData`, `ExportChartData`,
`LegendItem`, `XAxisTickVariant` (lines 78–84, defined in
`src/components/Charts/types/common.ts` and `types/exportChartData.ts`).

## Shared prop contract

Nine of the families take `BaseChartProps<T>`
(`src/components/Charts/types/common.ts:13-69`): `data`, `categoryKey`,
`customPalette`, `tickVariant`, `grid`, `legend`, `icons`, `isAnimationActive`,
`showYAxis`, `xAxisLabel`, `yAxisLabel`, `className`, `height`, `width`,
`fitLegendInHeight`, `condensed`, `density`, `yTickCount`. Area and Line
additionally take `HoverOverlayProps` (`common.ts:79-90`: `crosshair`,
`highlight`, `activeDots`).

The other families deliberately do **not** share it, and this matters for a
migration because the differences are not cosmetic:

- `PieChart`, `RadialChart`, `FunnelChart`, `SegmentedBar`, `SingleStackedBar`
  additionally require **`dataKey`** naming the numeric field. Omitting it does
  not error — every value resolves to 0 and the chart renders degenerate
  zero-area shapes (`d="M0,-135L0,0Z"`). `tests/default-render.baseline.test.tsx`
  asserts no such path is emitted, so a mis-wired `dataKey` fails loudly.
- `ScatterChart` takes **datasets of points** (`ScatterDataset[]`), not rows,
  and has no `categoryKey`.
- `CalendarHeatmap` takes `{ date, value }` data and its own large option set
  (ranges, thresholds, level colours/patterns, column separators, legend
  variant); it has no `categoryKey` either.
- The three Mini charts take a **bare number array** (or `{value,label}[]`) and
  size through a single square **`size`** prop — no `width`/`height`.
- `SegmentedBar`/`SingleStackedBar` take **no size props at all** and follow
  their container.

## Rendering technology (observed, not assumed)

- **SVG `<path>`**: Area, Line, Bar (incl. condensed/horizontal), Pie, Radial,
  Funnel, the three Mini charts.
- **SVG `<polygon>`**: Radar — both its grid rings and its series. A probe that
  counts only `<path>` will wrongly report Radar as drawing nothing.
- **SVG `<rect>`**: HeatmapChart (18 cells here), CalendarHeatmap (90 cells).
- **CSS `<div>`**: SegmentedBar and SingleStackedBar draw no SVG at all —
  segments are divs with exact percentage widths (`width:40%` …).
