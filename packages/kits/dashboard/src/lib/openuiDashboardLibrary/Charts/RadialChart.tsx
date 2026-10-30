"use client";

import { CHART_CLASS_PREFIX, RadialChart } from "@openuidev/react-components";
import { defineComponent, type ComponentRenderProps } from "@openuidev/react-lang";
import clsx from "clsx";
import { type CSSProperties } from "react";
import { z } from "zod/v4";
import { radialChartClass } from "../../../components/DashboardCharts";
import { DASHBOARD_CHART_PALETTE } from "./chartPalette";
import { buildSliceData, DASHBOARD_CHART_HEIGHT } from "./helpers";
export const radialChartPropsSchema = z.object({
  labels: z.array(z.string()),
  values: z.array(z.number()),
});

export type RadialChartProps = z.infer<typeof radialChartPropsSchema>;

type DashboardChartHeightStyle = CSSProperties & {
  [key in `--${typeof CHART_CLASS_PREFIX}-dashboard-chart-height`]?: string;
};

function RadialChartRenderer({ props }: ComponentRenderProps<RadialChartProps>) {
  const data = buildSliceData(props.labels, props.values);
  if (!data.length) return null;
  const style: DashboardChartHeightStyle = {
    [`--${CHART_CLASS_PREFIX}-dashboard-chart-height`]: `${DASHBOARD_CHART_HEIGHT}px`,
  };

  return (
    <div style={style}>
      <RadialChart
        data={data}
        categoryKey="category"
        dataKey="value"
        customPalette={DASHBOARD_CHART_PALETTE}
        className={clsx(radialChartClass, `${CHART_CLASS_PREFIX}-dashboard-radial-chart`)}
        isAnimationActive={false}
        height="fit-content"
        maxChartSize={DASHBOARD_CHART_HEIGHT}
      />
    </div>
  );
}

export const RadialChartComponent = defineComponent({
  name: "RadialChart",
  props: radialChartPropsSchema,
  description: "Radial bars; use plucked arrays: RadialChart(data.categories, data.values).",
  component: RadialChartRenderer,
});
