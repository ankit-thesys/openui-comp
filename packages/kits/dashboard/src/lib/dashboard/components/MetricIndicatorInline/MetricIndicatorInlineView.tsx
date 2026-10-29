"use client";

import clsx from "clsx";
import { C1_CLASS_PREFIX } from "../../../shared/classPrefix";
import type { MetricIndicatorInlineProps } from "./schema";

export function MetricIndicatorInlineView(props: MetricIndicatorInlineProps) {
  const isPositive = props.trend?.direction === "up";

  return (
    <div
      className={clsx(
        `${C1_CLASS_PREFIX}-dashboard-metric-indicator`,
        `${C1_CLASS_PREFIX}-dashboard-metric-indicator--variant-inline`,
        props.subtext && `${C1_CLASS_PREFIX}-dashboard-metric-indicator--has-subtext`,
      )}
    >
      <div className={`${C1_CLASS_PREFIX}-dashboard-metric-indicator__row`}>
        <div className={`${C1_CLASS_PREFIX}-dashboard-metric-indicator__main-value`}>
          {props.value}
        </div>
        {props.trend && Number.isFinite(props.trend.value) && (
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
        )}
        {props.subtext && (
          <div className={`${C1_CLASS_PREFIX}-dashboard-metric-indicator__subtext`}>
            {props.subtext}
          </div>
        )}
      </div>
    </div>
  );
}
