import type {
  BaseChartProps,
  ChartData,
  ExportChartData,
  LegendItem,
  XAxisTickVariant,
} from "@openuidev/react-ui-core";
const data: ChartData = [{ month: "Jan", total: 12 }];
const tick: XAxisTickVariant = "angled";
const props: BaseChartProps<typeof data> = {
  data,
  categoryKey: "month",
  tickVariant: tick,
  height: 240,
  width: "100%",
  customPalette: ["#123456"],
  density: "compact",
  legend: true,
  isAnimationActive: false,
};
const legend: LegendItem = { key: "total", label: "Total", color: "#123456", percentage: 100 };
const exported: ExportChartData = {
  type: "bar",
  data: [{ name: "Total", labels: ["Jan"], values: [12] }],
  options: { chartColors: ["#123456"], showLegend: true, barDir: "col" },
};
// @ts-expect-error Existing tick variants only.
const unsupported: XAxisTickVariant = "radial";
// @ts-expect-error Preserve current export type vocabulary.
const unsupportedExport: ExportChartData = { type: "funnel", data: [] };
// @ts-expect-error HoverOverlayProps remains internal to chart type composition.
type InternalHoverOverlay = import("@openuidev/react-ui-core").HoverOverlayProps;
const internal: InternalHoverOverlay | undefined = undefined;
void [props, legend, exported, unsupported, unsupportedExport, internal];
