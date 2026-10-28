// Shared consumer cases. Baseline and current bundles use their respective public packages.
import {
  AreaChart,
  BarChart,
  HorizontalBarChart,
  LineChart,
  MiniAreaChart,
  MiniBarChart,
  MiniLineChart,
  PieChart,
  StackedLegend,
} from "openui-under-test";
import type { ReactNode } from "react";

declare const __PARITY_BASELINE__: boolean;
const baseline = __PARITY_BASELINE__;
const items = Array.from({ length: 9 }, (_, i) => ({
  key: `series${i}`,
  label: `Series ${i}`,
  value: i + 1,
  color: "teal",
}));
const data = Array.from({ length: 25 }, (_, i) => ({ month: `Month ${i}`, sales: i + 1 }));
const series: Array<Record<string, string | number>> = [
  { month: "Jan", ...Object.fromEntries(items.map((item) => [item.key, item.value])) },
  { month: "Feb", ...Object.fromEntries(items.map((item) => [item.key, item.value + 2])) },
];
const Icon = () => (
  <svg viewBox="0 0 10 10">
    <circle cx="5" cy="5" r="4" />
  </svg>
);
const legend = (part: string) =>
  `.openui-${baseline ? "chart-legend" : "default-legend"}${part ? `-${part}` : baseline ? "" : "-list"}`;
const stacked = (part: string) =>
  `.openui-stacked-legend${baseline && part.startsWith("item") ? "__" : "-"}${part}`;
const parts = (values: Record<string, string>) => JSON.stringify(values);
const legendParts = parts({
  root: baseline ? ".openui-chart-default-legend-root" : ".openui-default-legend",
  list: legend(""),
  axis: legend("axis-label"),
  axisText: legend("axis-label-text"),
  item: legend("item"),
  indicator: legend("item-indicator"),
  label: legend("item-label"),
  percentage: legend("item-percentage"),
  icon: `${legend("item")} svg`,
  toggle: legend("toggle-button"),
  toggleIcon: legend("toggle-button-icon"),
});
const stackedParts = parts({
  root: baseline ? ".openui-stacked-legend-container" : ".openui-stacked-legend",
  list: baseline ? ".openui-stacked-legend" : ".openui-stacked-legend-list",
  item: stacked("item"),
  label: stacked("item-label"),
  colorContainer: stacked("item-color-container"),
  color: stacked("item-color"),
  text: stacked("item-label-text"),
  value: stacked("item-value"),
  header: ".openui-stacked-legend-header",
  title: ".openui-stacked-legend-header-title",
  controls: ".openui-stacked-legend-header-buttons",
  scrollButton: ".openui-stacked-legend-scroll-button",
  showMore: ".openui-stacked-legend-show-more-button",
  separator: ".openui-stacked-legend-separator",
});
const hoverTarget = (id: string) => {
  if (
    id.startsWith("default-legend/") &&
    ["collapsed", "expanded"].some((state) => id.endsWith(state))
  )
    return legend("toggle-button");
  if (id === "stacked/hover-row" || id === "stacked/percentage-active-hidden")
    return stacked("item");
  if (id === "stacked/show-more" || id === "stacked/show-all")
    return ".openui-stacked-legend-show-more-button";
  if (id === "scroll/horizontal")
    return baseline
      ? ".openui-chart-horizontal-scroll-button--right"
      : ".openui-scroll-buttons-horizontal-right";
  if (id === "scroll/vertical")
    return baseline
      ? ".openui-chart-vertical-scroll-button--down"
      : ".openui-scroll-buttons-vertical-down";
  return undefined;
};
const frame = (id: string, children: ReactNode, named: string, width = 480) => (
  <section
    key={id}
    data-parity-case={id}
    data-parity-parts={named}
    data-parity-hover-target={hoverTarget(id)}
    style={{ width, marginBottom: 24 }}
  >
    {children}
  </section>
);

export function ChartFoundationCases() {
  return (
    <>
      {frame(
        "base/empty-line",
        <LineChart data={[]} categoryKey="month" />,
        parts({ root: ".openui-chart-empty", text: ".openui-chart-empty-text" }),
      )}
      {frame(
        "base/empty-bar",
        <BarChart data={[]} categoryKey="month" />,
        parts({ root: ".openui-chart-empty", text: ".openui-chart-empty-text" }),
      )}
      {frame(
        "base/empty-pie",
        <PieChart data={[]} categoryKey="name" dataKey="value" legend={false} />,
        parts({ root: ".openui-chart-empty", text: ".openui-chart-empty-text" }),
      )}
      {frame(
        "base/axes",
        <LineChart
          data={data.slice(0, 2)}
          categoryKey="month"
          width={480}
          height={260}
          condensed
          xAxisLabel="Month"
          yAxisLabel="Sales"
        />,
        parts({
          x: baseline ? ".openui-cartesian-x-axis-label" : ".openui-chart-x-axis-label",
          y: baseline ? ".openui-cartesian-y-axis-label" : ".openui-chart-y-axis-label",
        }),
      )}
      {frame(
        "default-legend/full",
        <LineChart
          data={series}
          categoryKey="month"
          width={900}
          height={260}
          xAxisLabel="Month"
          yAxisLabel="Sales"
          icons={{ series0: Icon }}
        />,
        legendParts,
        900,
      )}
      {frame(
        "default-legend/collapsed",
        <LineChart
          data={series}
          categoryKey="month"
          width={240}
          height={260}
          icons={{ series0: Icon }}
        />,
        legendParts,
        240,
      )}
      {frame(
        "default-legend/expanded",
        <LineChart
          data={series}
          categoryKey="month"
          width={240}
          height={260}
          icons={{ series0: Icon }}
        />,
        legendParts,
        240,
      )}
      {frame(
        "default-legend/percentage",
        <PieChart
          data={items.slice(0, 3).map((item) => ({ name: item.label, value: item.value }))}
          categoryKey="name"
          dataKey="value"
          width={480}
          height={260}
          legendVariant="default"
          format="percentage"
        />,
        legendParts,
      )}
      {frame(
        "stacked/percentage-active-hidden",
        <StackedLegend
          items={items}
          activeKey="series0"
          hiddenKeys={new Set(["series1"])}
          separator
          onItemToggle={() => {}}
        />,
        stackedParts,
      )}
      {frame("stacked/hover-row", <StackedLegend items={items.slice(0, 3)} />, stackedParts)}
      {frame(
        "stacked/show-more",
        <StackedLegend items={items} layout="showMore" format="number" />,
        stackedParts,
      )}
      {frame(
        "stacked/show-all",
        <StackedLegend items={items} layout="showMore" format="number" />,
        stackedParts,
      )}
      {frame(
        "stacked/scrollable",
        <StackedLegend items={items} layout="scrollable" style={{ height: 160 }} />,
        stackedParts,
      )}
      {frame(
        "stacked/scrollable-no-title",
        <StackedLegend
          items={items}
          layout="scrollable"
          showTitle={false}
          style={{ height: 160 }}
        />,
        stackedParts,
      )}
      {([300, 500] as const).map((width) =>
        frame(
          `stacked/layout-${width}`,
          <PieChart
            data={items.map((item) => ({ name: item.label, value: item.value }))}
            categoryKey="name"
            dataKey="value"
            width={width}
            height={296}
          />,
          parts({
            layoutRoot: ".openui-chart-with-stacked-legend",
            chart: baseline
              ? ".openui-chart-with-stacked-legend__chart"
              : ".openui-chart-with-stacked-legend-chart",
            legend: baseline
              ? ".openui-chart-with-stacked-legend__legend"
              : ".openui-chart-with-stacked-legend-legend",
            ...JSON.parse(stackedParts),
          }),
          width,
        ),
      )}
      {frame(
        "scroll/horizontal",
        <LineChart data={data} categoryKey="month" width={300} height={260} />,
        parts({
          root: baseline
            ? ".openui-chart-horizontal-scroll-buttons-container"
            : ".openui-scroll-buttons-horizontal",
          left: baseline
            ? ".openui-chart-horizontal-scroll-button--left"
            : ".openui-scroll-buttons-horizontal-left",
          right: baseline
            ? ".openui-chart-horizontal-scroll-button--right"
            : ".openui-scroll-buttons-horizontal-right",
        }),
        300,
      )}
      {frame(
        "scroll/vertical",
        <HorizontalBarChart data={data} categoryKey="month" width={300} height={260} />,
        parts({
          root: baseline
            ? ".openui-chart-vertical-scroll-buttons-container"
            : ".openui-scroll-buttons-vertical",
          up: baseline
            ? ".openui-chart-vertical-scroll-button--up"
            : ".openui-scroll-buttons-vertical-up",
          down: baseline
            ? ".openui-chart-vertical-scroll-button--down"
            : ".openui-scroll-buttons-vertical-down",
        }),
        300,
      )}
      <div data-testid="draw-line">
        <LineChart
          data={data.slice(0, 4)}
          categoryKey="month"
          width={480}
          height={260}
          isAnimationActive
        />
      </div>
      <div data-testid="draw-area">
        <AreaChart
          data={data.slice(0, 4)}
          categoryKey="month"
          width={480}
          height={260}
          isAnimationActive
        />
      </div>
    </>
  );
}

export function MiniChartCases() {
  const miniParts = (chart: string) =>
    parts({
      root: baseline ? `.openui-mini-${chart}-chart-container` : `.openui-mini-${chart}-chart`,
      svg: "svg",
      line: `.openui-mini-${chart}-chart-line`,
      area: `.openui-mini-${chart}-chart-area`,
      point: `.openui-mini-${chart}-chart-point`,
      barGroup: `.openui-mini-${chart}-chart-bar-group`,
      bar: `.openui-mini-${chart}-chart-bar`,
      innerLine: `.openui-mini-${chart}-chart-inner-line`,
      defs: "defs",
      gradient: "linearGradient",
      stopStart: "stop:first-child",
      stopEnd: "stop:last-child",
    });
  return (
    <>
      {(["linear", "natural", "step"] as const).flatMap((variant) =>
        [false, true].flatMap((animated) =>
          [false, true].flatMap((clickable) => [
            frame(
              `line/${variant}/${animated}/${clickable}`,
              <MiniLineChart
                data={[1, -2, 3]}
                variant={variant}
                size={120}
                isAnimationActive={animated}
                onLineClick={clickable ? () => {} : undefined}
              />,
              miniParts("line"),
              120,
            ),
            ...[false, true].map((gradient) =>
              frame(
                `area/${variant}/${animated}/${clickable}/${gradient}`,
                <MiniAreaChart
                  data={[1, -2, 3]}
                  variant={variant}
                  size={120}
                  useGradient={gradient}
                  isAnimationActive={animated}
                  onAreaClick={clickable ? () => {} : undefined}
                />,
                miniParts("area"),
                120,
              ),
            ),
          ]),
        ),
      )}
      {[false, true].flatMap((animated) =>
        [false, true].map((clickable) =>
          frame(
            `bar/${animated}/${clickable}`,
            <MiniBarChart
              data={[1, -2, 3]}
              size={120}
              isAnimationActive={animated}
              onBarsClick={clickable ? () => {} : undefined}
            />,
            miniParts("bar"),
            120,
          ),
        ),
      )}
      {[[], [1]].flatMap((data, i) => [
        frame(
          `line/${i ? "single" : "empty"}`,
          <MiniLineChart data={data} size={120} />,
          miniParts("line"),
          120,
        ),
        frame(
          `area/${i ? "single" : "empty"}`,
          <MiniAreaChart data={data} size={120} />,
          miniParts("area"),
          120,
        ),
        frame(
          `bar/${i ? "single" : "empty"}`,
          <MiniBarChart data={data} size={120} />,
          miniParts("bar"),
          120,
        ),
      ])}
      {frame("line/minimum", <MiniLineChart data={[1, 2]} size={50} />, miniParts("line"), 120)}
      {frame("area/percent-size", <MiniAreaChart data={[1, 2]} />, miniParts("area"), 140)}
    </>
  );
}
