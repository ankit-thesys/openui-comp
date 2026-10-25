# Chart shared-type bootstrap only

The three Charts/types files are byte-identical copies of the read-only legacy files. The root exports exactly the existing public BaseChartProps, ChartData, ExportChartData, LegendItem and XAxisTickVariant types; HoverOverlayProps remains internal to composition.

Public-root strict consumer TDD first fails TS2305 on all five absent types. After the minimal type copy/root export, build, producer strict types and focused consumer test1/1 pass. The negative internal-boundary check uses a type query so import organization cannot delete it. The initial formatter-induced unused-directive failure is retained separately, along with genuine red and final green logs. Independent GPT6.1-Sol Spec and Standards reviews report zero remaining findings.

This bootstrap enables Worker2 to commit BarChart/types.ts, BarChart/parts/horizontalBarGeometry.ts and ScatterChart/types.ts. It is not a completed chart foundation or chart slice: no runtime chart implementation/style/dependency, normal installed final artifact or browser acceptance is claimed. Worker1 owns the first future chart Chrome window; Worker2 remains source-only until explicit release. No legacy/previews/friend paths changed.
