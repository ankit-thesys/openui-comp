// Defaults are public appearance values too; booleans emit only for true.
// Run after build: pnpm exec vitest run test/unit/contract/other-chart-modifiers.test.tsx.
import {
  CalendarHeatmap,
  FunnelChart,
  HeatmapChart,
  PieChart,
  RadarChart,
  RadialChart,
  SegmentedBar,
} from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { stableClassesIn } from "./collect";
const categorical = {
  data: [{ name: "A", value: 12 }],
  categoryKey: "name" as const,
  dataKey: "value" as const,
};
it("emits the default appearance modifiers", () => {
  const examples = [
    [
      <PieChart {...categorical} />,
      ["openui-pie-chart--variant-pie", "openui-pie-chart--appearance-circular"],
    ],
    [
      <RadarChart data={categorical.data} categoryKey="name" />,
      ["openui-radar-chart--variant-line", "openui-radar-chart--grid-shape-polygon"],
    ],
    [<RadialChart {...categorical} />, ["openui-radial-chart--variant-circular"]],
    [
      <FunnelChart {...categorical} />,
      ["openui-funnel-chart--orientation-horizontal", "openui-funnel-chart--edges-curved"],
    ],
    [
      <HeatmapChart data={categorical.data} categoryKey="name" />,
      ["openui-heatmap-chart--ramp-mode-sequential"],
    ],
    [
      <CalendarHeatmap data={[{ date: "2026-01-01", value: 1 }]} />,
      ["openui-calendar-heatmap--layout-fluid", "openui-calendar-heatmap--legend-variant-swatches"],
    ],
    [
      <SegmentedBar {...categorical} />,
      ["openui-segmented-bar--legend-variant-default", "openui-segmented-bar--legend"],
    ],
  ] as const;
  for (const [element, modifiers] of examples) {
    const classes = stableClassesIn(renderToString(element));
    for (const modifier of modifiers) expect(classes.has(modifier), modifier).toBe(true);
    expect([...classes].some((name) => name.endsWith("--is-animation-active"))).toBe(false);
  }
});
