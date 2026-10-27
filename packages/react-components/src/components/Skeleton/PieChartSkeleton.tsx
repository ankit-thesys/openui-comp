import clsx from "clsx";
import { css } from "goober";
import { pieStyles } from "./pieChartSkeleton.styles";
import { SkeletonBar } from "./SkeletonBar";
const componentClass = "openui-skeleton-pie-chart-skeleton-root";
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
  const isSemi = appearance === "semiCircular";
  const isDonut = variant === "donut";

  const chartClass = clsx(
    "openui-skeleton-pie-chart-shape",
    isSemi && isDonut
      ? "openui-skeleton-pie-chart-semi-donut"
      : isSemi
        ? "openui-skeleton-pie-chart-semi"
        : isDonut
          ? "openui-skeleton-pie-chart-donut"
          : undefined,
  );

  const chartHeight = isSemi ? size / 2 : size;

  return (
    <div className={clsx(componentClass, "openui-skeleton-pie-chart-wrapper")}>
      <div className="openui-skeleton-pie-chart-container">
        <div className={chartClass} style={{ width: size, height: chartHeight }} />
      </div>
      <div className="openui-skeleton-pie-chart-legend">
        {Array.from({ length: legendItems }, (_, i) => (
          <div key={i} className="openui-skeleton-pie-chart-legend-item">
            <div className="openui-skeleton-pie-chart-legend-dot" />
            <SkeletonBar height="12px" width={`${50 + ((i * 15) % 40)}%`} />
          </div>
        ))}
      </div>
    </div>
  );
}

const stylesheetScope = css`
  :where(&:root) {
    .openui-skeleton-pie-chart-skeleton-root {
      ${pieStyles}
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}
