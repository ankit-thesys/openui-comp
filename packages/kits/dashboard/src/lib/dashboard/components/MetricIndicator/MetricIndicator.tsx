"use client";

import { defineComponent, type ComponentRenderProps } from "@openuidev/react-lang";
import clsx from "clsx";
import { C1_CLASS_PREFIX } from "../../../shared/classPrefix";
import { metricIndicatorPropsSchema, type MetricIndicatorProps } from "./schema";

function MetricIndicatorRenderer({ props }: ComponentRenderProps<MetricIndicatorProps>) {
  const isPositive = props.trend?.direction === "up";

  return (
    <div
      className={clsx(
        `${C1_CLASS_PREFIX}-dashboard-metric-indicator`,
        props.subtext && `${C1_CLASS_PREFIX}-dashboard-metric-indicator--has-subtext`,
      )}
    >
      <div className={`${C1_CLASS_PREFIX}-dashboard-metric-indicator__row`}>
        <div className={`${C1_CLASS_PREFIX}-dashboard-metric-indicator__main-value`}>
          {props.value}
        </div>
        {props.trend && Number.isFinite(props.trend.value) ? (
          <div
            className={clsx(
              `${C1_CLASS_PREFIX}-dashboard-metric-indicator__trend`,
              isPositive
                ? `${C1_CLASS_PREFIX}-dashboard-metric-indicator__trend--success`
                : `${C1_CLASS_PREFIX}-dashboard-metric-indicator__trend--danger`,
            )}
          >
            {isPositive ? "+" : "-"}
            {props.trend.value}%
          </div>
        ) : null}
      </div>
      {props.subtext ? (
        <div className={`${C1_CLASS_PREFIX}-dashboard-metric-indicator__subtext`}>
          {props.subtext}
        </div>
      ) : null}
    </div>
  );
}

export const MetricIndicatorComponent = defineComponent({
  name: "MetricIndicator",
  props: metricIndicatorPropsSchema,
  description: "",
  component: MetricIndicatorRenderer,
});
