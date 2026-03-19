import type { ScaleLinear } from "d3-scale";
import React from "react";

import type { VisibleDataset } from "../../hooks/cartesian/useScatterChartOrchestrator";
import type { HoveredScatterPoint } from "../types";

interface ScatterDotsProps {
  datasets: VisibleDataset[];
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  colorMap: Record<string, string>;
  dotRadius: number;
  hoveredPoint: HoveredScatterPoint | null;
  isAnimationActive: boolean;
  isPrinting: boolean;
}

export const ScatterDots: React.FC<ScatterDotsProps> = ({
  datasets,
  xScale,
  yScale,
  colorMap,
  dotRadius,
  hoveredPoint,
  isAnimationActive,
  isPrinting,
}) => {
  const shouldAnimate = isAnimationActive && !isPrinting;

  return (
    <g className="openui-d3-scatter-chart-dots">
      {datasets.map(({ dataset: ds, originalIndex }) => {
        const color = colorMap[ds.name] ?? "#000";
        const isHoveredDataset = hoveredPoint?.datasetName === ds.name;
        const hasHover = hoveredPoint !== null;

        return (
          <g key={ds.name}>
            {ds.data.map((pt, ptIdx) => {
              const isHoveredDot = isHoveredDataset && hoveredPoint?.pointIndex === ptIdx;

              const r = isHoveredDot ? dotRadius * 1.5 : dotRadius;
              const opacity = hasHover && !isHoveredDataset ? 0.3 : 1;

              const animationClass = shouldAnimate ? "openui-d3-scatter-chart-dot--animated" : "";
              const animationDelay = shouldAnimate ? `${originalIndex * 80}ms` : undefined;

              return (
                <circle
                  key={ptIdx}
                  cx={xScale(pt.x)}
                  cy={yScale(pt.y)}
                  r={r}
                  fill={color}
                  className={`openui-d3-scatter-chart-dot ${animationClass}`}
                  style={{ opacity, animationDelay }}
                />
              );
            })}
          </g>
        );
      })}
    </g>
  );
};
