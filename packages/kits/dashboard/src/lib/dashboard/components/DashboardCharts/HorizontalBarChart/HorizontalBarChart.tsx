"use client";

import { BarChart } from "@openuidev/react-components";
import { defineComponent, type ComponentRenderProps } from "@openuidev/react-lang";
import { DASHBOARD_CHART_PALETTE } from "../../shared/chartPalette";
import { buildChartData, DASHBOARD_CHART_HEIGHT } from "../chartHelpers";
import { horizontalBarChartPropsSchema, type HorizontalBarChartProps } from "./schema";

function HorizontalBarChartRenderer({ props }: ComponentRenderProps<HorizontalBarChartProps>) {
  const data = buildChartData(props.labels, props.series);
  if (!data.length) return null;

  return (
    <BarChart
      data={data}
      categoryKey="category"
      orientation="horizontal"
      customPalette={DASHBOARD_CHART_PALETTE}
      variant={props.variant}
      xAxisLabel={props.xLabel}
      yAxisLabel={props.yLabel}
      isAnimationActive={false}
      height={DASHBOARD_CHART_HEIGHT}
    />
  );
}

export const HorizontalBarChartComponent = defineComponent({
  name: "HorizontalBarChart",
  props: horizontalBarChartPropsSchema,
  description:
    "Horizontal bars; use only when category labels are too long for a vertical BarChart or the user explicitly asks for horizontal bars.",
  component: HorizontalBarChartRenderer,
});
