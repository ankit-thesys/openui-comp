"use client";

import { CHART_CLASS_PREFIX, RadarChart } from "@openuidev/react-components";
import { defineComponent, type ComponentRenderProps } from "@openuidev/react-lang";
import { type CSSProperties } from "react";
import { z } from "zod/v4";
import { DASHBOARD_CHART_PALETTE } from "./chartPalette";
import { SeriesComponent } from "./dataComponents";
import { buildChartData, DASHBOARD_CHART_HEIGHT } from "./helpers";
export const radarChartPropsSchema = z.object({
  labels: z.array(z.string()),
  series: z.array(SeriesComponent.ref).default([]),
});

export type RadarChartProps = z.infer<typeof radarChartPropsSchema>;

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
