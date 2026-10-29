// Consumer cases shared by the current and #72 bundles; only public exports are imported.
import {
  AreaChart,
  AreaChartCondensed,
  BarChart,
  BarChartCondensed,
  HorizontalBarChart,
  LineChart,
  LineChartCondensed,
  ScatterChart,
} from "openui-under-test";
import type { ReactNode } from "react";

declare const __PARITY_BASELINE__: boolean;
export const chartFamilies = [
  "area-chart",
  "bar-chart",
  "horizontal-bar-chart",
  "line-chart",
  "scatter-chart",
] as const;
export type ChartFamily = (typeof chartFamilies)[number];
const data = [
  { month: "January long category", sales: -12, costs: 8 },
  { month: "February long category", sales: 20, costs: -5 },
  { month: "March long category", sales: 7, costs: 13 },
];
const many = Array.from({ length: 24 }, (_, i) => ({
  month: `Month ${i}`,
  sales: i % 3 ? i + 1 : -i - 1,
  costs: 10,
}));
const common = { data, categoryKey: "month", width: 420, height: 280 } as const;
const properties = JSON.stringify([
  "fill",
  "stroke",
  "stroke-width",
  "stroke-dasharray",
  "stroke-dashoffset",
  "fill-opacity",
  "stroke-opacity",
  "transform",
  "transform-origin",
  "overflow-x",
  "overflow-y",
  "flex-direction",
  "min-width",
  "min-height",
  "animation-duration",
  "animation-delay",
  "animation-fill-mode",
]);
const partSelectors = (family: ChartFamily, id: string) => {
  const prefix = `.openui-${family}`;
  const frame =
    __PARITY_BASELINE__ && family === "horizontal-bar-chart" && id === "empty"
      ? ".openui-bar-chart-root"
      : `${prefix}${__PARITY_BASELINE__ ? "-root" : ""}`;
  const parts: Record<string, string> = {
    frame,
    svg: `${frame} svg`,
    group: `${frame} svg > g`,
    hitTarget: `${frame} rect[fill="transparent"]`,
    tickLine: `${prefix}-x-tick tspan`,
    defs: `${frame} svg defs`,
    clip: `${frame} defs clipPath`,
    clipRect: `${frame} defs clipPath rect`,
    gradient: `${frame} linearGradient`,
    stop: `${frame} stop`,
    areas: `${prefix}-areas`,
    lines: `${prefix}-lines`,
    bars: `${prefix}-bars`,
    row: `${prefix}-row`,
    categoryLabelContainer: `${frame} foreignObject`,
    activeDotGroup: `${frame} g:has(> ${prefix}-active-dot-outer)`,
    highlightGroup: `${prefix}-crosshair > g[aria-hidden="true"]`,
    crosshairFollower: `${frame} g:has(> ${prefix}-crosshair-line)`,
    inner: `${prefix}-container-inner`,
    main: `${prefix}-main-container`,
    yAxisContainer: `${prefix}-y-axis-container`,
    xAxisContainer: `${prefix}-x-axis-container`,
    innerWrapper: `${prefix}-container-inner-wrapper`,
    grid: `${prefix}-grid`,
    verticalGrid: `${prefix}-grid-vertical`,
    gridLine: `${prefix}-grid line`,
    zeroGridLine: `${prefix}-grid line${__PARITY_BASELINE__ ? ".openui-grid-zero-line" : "[data-zero]"}`,
    verticalGridLine: `${prefix}-grid-vertical line`,
    xAxis: `${prefix}-x-axis`,
    yAxis: `${prefix}-y-axis`,
    xTick: `${prefix}-x-tick`,
    angledTick: `${prefix}-x-tick-angled`,
    yTick: `${prefix}-y-tick`,
    bar: `${prefix}-bar`,
    negativeBar: `${prefix}-bar${__PARITY_BASELINE__ ? ".openui-" + family + "-bar--negative" : "[data-negative]"}`,
    internalLine: `${prefix}-internal-line`,
    categoryLabel: `${prefix}-category-label`,
    highlight: family === "bar-chart" ? `${prefix}-hover-highlight` : `${prefix}-crosshair`,
    crosshairLine: `${prefix}-crosshair-line`,
    outerDot: `${prefix}-active-dot-outer`,
    innerDot: `${prefix}-active-dot-inner`,
    areaPath: `${prefix}-area-path`,
    areaLine: `${prefix}-area-line`,
    line: `${prefix}-line`,
    dot: `${prefix}-dot`,
  };
  return JSON.stringify(parts);
};
function Case({ family, id, children }: { family: ChartFamily; id: string; children: ReactNode }) {
  return (
    <div
      data-parity-case={`${family}/${id}`}
      data-parity-parts={partSelectors(family, id)}
      data-parity-properties={properties}
      data-parity-hover-target={id === "empty" ? undefined : '[role="img"]'}
      style={{ width: 420, margin: 20 }}
    >
      {children}
    </div>
  );
}
export function CartesianCases({ family }: { family: ChartFamily }) {
  const cases: Array<[string, ReactNode]> = [];
  if (family === "area-chart") {
    cases.push(["empty", <AreaChart {...common} data={[]} />]);
    for (const variant of ["linear", "natural", "step"] as const)
      for (const stacked of [false, true])
        for (const isAnimationActive of [false, true]) {
          const id = `${variant}/${stacked ? "stacked" : "unstacked"}/${isAnimationActive ? "animated" : "idle"}`;
          cases.push([
            id,
            <AreaChart
              {...common}
              variant={variant}
              stacked={stacked}
              isAnimationActive={isAnimationActive}
              crosshair
              highlight
            />,
          ]);
        }
    cases.push([
      "condensed",
      <AreaChartCondensed
        {...common}
        width={180}
        xAxisLabel="Month"
        yAxisLabel="Sales"
        tickVariant="angled"
        crosshair
        highlight
      />,
    ]);
    cases.push(["scroll", <AreaChart {...common} data={many} />]);
    cases.push([
      "no-axes-grid-legend",
      <AreaChart {...common} showYAxis={false} grid={false} legend={false} activeDots={false} />,
    ]);
  }
  if (family === "line-chart") {
    cases.push(["empty", <LineChart {...common} data={[]} />]);
    for (const variant of ["linear", "natural", "step"] as const)
      for (const showDots of [false, true])
        for (const isAnimationActive of [false, true]) {
          const id = `${variant}/${showDots ? "dots" : "no-dots"}/${isAnimationActive ? "animated" : "idle"}`;
          cases.push([
            id,
            <LineChart
              {...common}
              variant={variant}
              showDots={showDots}
              isAnimationActive={isAnimationActive}
              crosshair
              highlight
            />,
          ]);
        }
    cases.push([
      "condensed",
      <LineChartCondensed
        {...common}
        width={180}
        showDots
        tickVariant="angled"
        xAxisLabel="Month"
        yAxisLabel="Sales"
        crosshair
        highlight
      />,
    ]);
    cases.push(["scroll", <LineChart {...common} data={many} />]);
    cases.push([
      "no-axes-grid-legend",
      <LineChart {...common} showYAxis={false} grid={false} legend={false} activeDots={false} />,
    ]);
  }
  if (family === "bar-chart" || family === "horizontal-bar-chart") {
    const Chart = family === "bar-chart" ? BarChart : HorizontalBarChart;
    cases.push(["empty", <Chart {...common} data={[]} />]);
    for (const variant of ["grouped", "stacked"] as const)
      for (const internalLine of [false, true])
        for (const isAnimationActive of [false, true]) {
          const id = `${variant}/${internalLine ? "internal-line" : "no-internal-line"}/${isAnimationActive ? "animated" : "idle"}`;
          cases.push([
            id,
            <Chart
              {...common}
              variant={variant}
              internalLine={internalLine}
              isAnimationActive={isAnimationActive}
            />,
          ]);
        }
    if (family === "bar-chart")
      cases.push([
        "condensed",
        <BarChartCondensed
          {...common}
          width={180}
          tickVariant="angled"
          xAxisLabel="Month"
          yAxisLabel="Sales"
        />,
      ]);
    cases.push(["scroll", <Chart {...common} data={many} />]);
    cases.push(["no-grid-legend", <Chart {...common} grid={false} legend={false} />]);
  }
  if (family === "scatter-chart") {
    cases.push(["empty", <ScatterChart data={[]} width={420} height={280} />]);
    for (const isAnimationActive of [false, true])
      for (const dotRadius of [4, 7])
        cases.push([
          `radius-${dotRadius}/${isAnimationActive ? "animated" : "idle"}`,
          <ScatterChart
            data={[
              {
                name: "Sales",
                data: [
                  { x: -2, y: -3 },
                  { x: 4, y: 5 },
                ],
              },
              { name: "Costs", data: [{ x: 1, y: 2 }] },
            ]}
            width={420}
            height={280}
            dotRadius={dotRadius}
            isAnimationActive={isAnimationActive}
          />,
        ]);
    cases.push([
      "no-axes-grid-legend",
      <ScatterChart
        data={[{ name: "Sales", data: [{ x: 1, y: 2 }] }]}
        width={420}
        height={280}
        showYAxis={false}
        grid={false}
        verticalGrid={false}
        legend={false}
      />,
    ]);
  }
  return (
    <>
      {cases.map(([id, element]) => (
        <Case key={id} family={family} id={id}>
          {element}
        </Case>
      ))}
    </>
  );
}
