"use client";

import { CHART_CLASS_PREFIX, RadarChart } from "@openuidev/react-components";
import { defineComponent, type ComponentRenderProps } from "@openuidev/react-lang";
import type { CSSProperties } from "react";
import { DASHBOARD_CHART_PALETTE } from "../../shared/chartPalette";
import { buildChartData, DASHBOARD_CHART_HEIGHT } from "../chartHelpers";
import { radarChartPropsSchema, type RadarChartProps } from "./schema";

type DashboardChartHeightStyle = CSSProperties & {
  [key in `--${typeof CHART_CLASS_PREFIX}-dashboard-chart-height`]?: string;
};

function RadarChartRenderer({ props }: ComponentRenderProps<RadarChartProps>) {
  const data = buildChartData(props.labels, props.series);
  if (!data.length) return null;
  const style: DashboardChartHeightStyle = {
    [`--${CHART_CLASS_PREFIX}-dashboard-chart-height`]: `${DASHBOARD_CHART_HEIGHT}px`,
  };

  return (
    <div className={`${CHART_CLASS_PREFIX}-dashboard-radar-chart`} style={style}>
      <RadarChart
        data={data}
        categoryKey="category"
        customPalette={DASHBOARD_CHART_PALETTE}
        isAnimationActive={false}
      />
    </div>
  );
}

export const RadarChartComponent = defineComponent({
  name: "RadarChart",
  props: radarChartPropsSchema,
  description:
    "Spider/web chart; use for comparing multiple variables across one or more entities.",
  component: RadarChartRenderer,
});
