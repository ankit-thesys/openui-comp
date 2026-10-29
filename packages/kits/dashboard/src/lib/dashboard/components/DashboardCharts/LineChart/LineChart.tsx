"use client";

import { LineChart } from "@openuidev/react-components";
import { defineComponent, type ComponentRenderProps } from "@openuidev/react-lang";
import { DASHBOARD_CHART_PALETTE } from "../../shared/chartPalette";
import {
  buildChartData,
  DASHBOARD_CHART_HEIGHT,
  getCondensedCartesianChartHeight,
} from "../chartHelpers";
import { lineChartPropsSchema, type LineChartProps } from "./schema";

function LineChartRenderer({ props }: ComponentRenderProps<LineChartProps>) {
  const data = buildChartData(props.labels, props.series);
  if (!data.length) return null;

  return (
    <LineChart
      data={data}
      categoryKey="category"
      customPalette={DASHBOARD_CHART_PALETTE}
      variant={props.variant}
      xAxisLabel={props.xLabel}
      yAxisLabel={props.yLabel}
      isAnimationActive={false}
      condensed
      height={getCondensedCartesianChartHeight(DASHBOARD_CHART_HEIGHT)}
    />
  );
}

export const LineChartComponent = defineComponent({
  name: "LineChart",
  props: lineChartPropsSchema,
  description: "Lines over categories; use for trends and continuous data over time.",
  component: LineChartRenderer,
});
