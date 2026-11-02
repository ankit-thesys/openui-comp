"use client";

import clsx from "clsx";
import type { CSSProperties } from "react";
import { Fragment } from "react";
import { styleRules } from "../../styles/css";
import { names as pulseNames, skeletonPulseStyles } from "../SkeletonPulse/skeletonPulse.styles";
import { names, pieChartSkeletonStyles } from "./pieChartSkeleton.styles";
import { SkeletonBar } from "./SkeletonBar";
export function PieChartSkeleton({
  size = 200,
  legendItems = 4,
  variant = "pie",
  appearance = "circular",
}: {
  size?: number;
  legendItems?: number;
  variant?: "pie" | "donut";
  appearance?: "circular" | "semiCircular";
}) {
  const styles = pieChartSkeletonStyles;
  const pulse = skeletonPulseStyles;
  const isSemi = appearance === "semiCircular";
  const chartClass = clsx(styles.shape, names.shape, pulse.root, pulseNames.root);

  const chartHeight = isSemi ? size / 2 : size;

  const rootClass = clsx(
    styles.root,
    styles.variant[variant],
    styles.appearance[appearance],
    names.root,
    names.variant[variant],
    names.appearance[appearance],
  );
  const containerClass = clsx(styles.container, names.container);
  const legendClass = clsx(styles.legend, names.legend);
  return (
    <>
      <div className={rootClass}>
        <div className={containerClass}>
          <div
            className={chartClass}
            style={
              {
                "--_openui-pie-chart-skeleton-shape-width": `${size}px`,
                "--_openui-pie-chart-skeleton-shape-height": `${chartHeight}px`,
              } as CSSProperties
            }
          />
          {styleRules(chartClass)}
        </div>
        {styleRules(containerClass)}
        <div className={legendClass}>
          {Array.from({ length: legendItems }, (_, i) => {
            const legendItemClass = clsx(styles.legendItem, names.legendItem);
            const legendDotClass = clsx(
              styles.legendDot,
              names.legendDot,
              pulse.root,
              pulseNames.root,
            );
            return (
              <Fragment key={i}>
                <div className={legendItemClass}>
                  <div className={legendDotClass} />
                  {styleRules(legendDotClass)}
                  <SkeletonBar height="12px" width={`${50 + ((i * 15) % 40)}%`} />
                </div>
                {styleRules(legendItemClass)}
              </Fragment>
            );
          })}
        </div>
        {styleRules(legendClass)}
      </div>
      {styleRules(rootClass)}
    </>
  );
}
