// Consumer cases shared by Node contracts and browser fixtures. The namespace is always the
// public package; browser parity supplies either the current build or #72 through its alias.
import type * as Public from "@openuidev/react-components";
import { cloneElement, type ReactElement } from "react";

export interface OtherChartCase {
  id: string;
  element: ReactElement;
}
export type OtherChart =
  | "PieChart"
  | "RadarChart"
  | "RadialChart"
  | "FunnelChart"
  | "HeatmapChart"
  | "CalendarHeatmap"
  | "SegmentedBar";

export const otherCharts: OtherChart[] = [
  "PieChart",
  "RadarChart",
  "RadialChart",
  "FunnelChart",
  "HeatmapChart",
  "CalendarHeatmap",
  "SegmentedBar",
];
export const chartSlug = (chart: OtherChart) =>
  chart.replace(/[A-Z]/g, (c, i) => `${i ? "-" : ""}${c.toLowerCase()}`);
const categorical = [
  { name: "Alpha", value: 100 },
  { name: "Beta", value: 65 },
  { name: "Gamma", value: 30 },
];
const series = [
  { name: "Alpha", first: 12, second: 24 },
  { name: "Beta", first: 20, second: 10 },
  { name: "Gamma", first: 30, second: 18 },
];
const heatmap = [
  { name: "Jan", first: -12, second: 24 },
  { name: "Feb", first: 20, second: "missing" },
  { name: "Mar", first: 30, second: 18 },
];
const calendar = Array.from({ length: 10 }, (_, i) => ({
  date: `2026-01-${String(i + 1).padStart(2, "0")}`,
  value: i % 5,
}));
const size = { width: 480, height: 300 };
const click = () => {};

export function otherChartCases(UI: typeof Public, chart: OtherChart): OtherChartCase[] {
  const {
    PieChart,
    RadarChart,
    RadialChart,
    FunnelChart,
    HeatmapChart,
    CalendarHeatmap,
    SegmentedBar,
    SingleStackedBar,
  } = UI;
  const cases: OtherChartCase[] = [];
  const add = (id: string, element: ReactElement) =>
    cases.push({ id, element: cloneElement(element, { key: `${chart}/${id}` }) });
  switch (chart) {
    case "PieChart":
      for (const variant of ["pie", "donut"] as const)
        for (const appearance of ["circular", "semiCircular"] as const)
          for (const animated of [false, true])
            for (const legend of ["none", "default", "stacked"] as const)
              add(
                `${variant}/${appearance}/${animated}/${legend}`,
                <PieChart
                  {...size}
                  data={categorical}
                  categoryKey="name"
                  dataKey="value"
                  variant={variant}
                  appearance={appearance}
                  isAnimationActive={animated}
                  legend={legend !== "none"}
                  legendVariant={legend === "default" ? "default" : "stacked"}
                  onClick={click}
                />,
              );
      add(
        "empty",
        <PieChart {...size} data={[]} categoryKey="name" dataKey="value" legend={false} />,
      );
      break;
    case "RadarChart":
      for (const variant of ["line", "area"] as const)
        for (const gridShape of ["circle", "polygon"] as const)
          for (const showDots of [false, true])
            for (const animated of [false, true])
              add(
                `${variant}/${gridShape}/${showDots}/${animated}`,
                <RadarChart
                  {...size}
                  data={series}
                  categoryKey="name"
                  variant={variant}
                  gridShape={gridShape}
                  showDots={showDots}
                  legend={false}
                  isAnimationActive={animated}
                  onClick={click}
                />,
              );
      add(
        "long-labels",
        <RadarChart
          width={240}
          height={240}
          data={series.map((row) => ({
            ...row,
            name: `${row.name} with a very long label that must truncate beyond the plot budget`,
          }))}
          categoryKey="name"
          legend={false}
        />,
      );
      add("no-grid", <RadarChart {...size} data={series} categoryKey="name" grid={false} />);
      add("empty", <RadarChart {...size} data={[]} categoryKey="name" />);
      break;
    case "RadialChart":
      for (const variant of ["circular", "semiCircular"] as const)
        for (const grid of [false, true])
          for (const animated of [false, true])
            for (const legend of ["none", "default", "stacked"] as const)
              add(
                `${variant}/${grid}/${animated}/${legend}`,
                <RadialChart
                  {...size}
                  data={categorical}
                  categoryKey="name"
                  dataKey="value"
                  variant={variant}
                  grid={grid}
                  isAnimationActive={animated}
                  legend={legend !== "none"}
                  legendVariant={legend === "default" ? "default" : "stacked"}
                  onClick={click}
                />,
              );
      add(
        "empty",
        <RadialChart {...size} data={[]} categoryKey="name" dataKey="value" legend={false} />,
      );
      break;
    case "FunnelChart":
      for (const orientation of ["horizontal", "vertical"] as const)
        for (const edges of ["curved", "straight"] as const)
          for (const animated of [false, true])
            add(
              `${orientation}/${edges}/${animated}`,
              <FunnelChart
                {...size}
                data={categorical}
                categoryKey="name"
                dataKey="value"
                orientation={orientation}
                edges={edges}
                legend={false}
                isAnimationActive={animated}
                onClick={click}
              />,
            );
      add(
        "no-readouts",
        <FunnelChart
          {...size}
          data={categorical}
          categoryKey="name"
          dataKey="value"
          showLabels={false}
          showValues={false}
          showPercentage={false}
          layers={1}
        />,
      );
      add("empty", <FunnelChart {...size} data={[]} categoryKey="name" dataKey="value" />);
      break;
    case "HeatmapChart":
      for (const rampMode of ["sequential", "diverging"] as const)
        for (const labels of [false, true])
          for (const animated of [false, true])
            add(
              `${rampMode}/${labels}/${animated}`,
              <HeatmapChart
                {...size}
                data={heatmap}
                categoryKey="name"
                rampMode={rampMode}
                showCellLabels={labels}
                isAnimationActive={animated}
                legend={false}
                onClick={click}
              />,
            );
      add(
        "no-axes-scale",
        <HeatmapChart
          {...size}
          data={series}
          categoryKey="name"
          showYAxis={false}
          showColorScale={false}
        />,
      );
      add("empty", <HeatmapChart {...size} data={[]} categoryKey="name" />);
      break;
    case "CalendarHeatmap":
      for (const layout of ["fluid", "fill"] as const)
        for (const legendVariant of ["swatches", "gradient", "none"] as const)
          for (const hideGhostCells of [false, true])
            for (const animated of [false, true])
              add(
                `${layout}/${legendVariant}/${hideGhostCells}/${animated}`,
                <CalendarHeatmap
                  {...size}
                  data={calendar}
                  range={["2026-01-01", "2026-04-10"]}
                  layout={layout}
                  legendVariant={legendVariant}
                  hideGhostCells={hideGhostCells}
                  isAnimationActive={animated}
                  animationDuration={100}
                  columnSeparators={{ groupBy: "quarter", spacing: 8, showLabels: true }}
                  onClick={click}
                />,
              );
      add(
        "patterns",
        <CalendarHeatmap
          {...size}
          data={calendar}
          range={["2026-01-01", "2026-01-31"]}
          levelStyles={[
            { pattern: "dots" },
            { pattern: "diagonal" },
            { pattern: "cross" },
            { pattern: "horizontal" },
            { pattern: "vertical" },
          ]}
          weekdayTickFilter="all"
          rowOpacity={[1, 0.5]}
        />,
      );
      add(
        "no-months",
        <CalendarHeatmap
          {...size}
          data={calendar}
          range={["2026-01-01", "2026-01-31"]}
          showMonthLabels={false}
          columnSeparators={{ groupBy: { every: 2 }, dashed: true }}
        />,
      );
      add("empty", <CalendarHeatmap {...size} data={[]} />);
      break;
    case "SegmentedBar":
      for (const legend of ["none", "default", "stacked"] as const)
        for (const animated of [false, true])
          add(
            `${legend}/${animated}`,
            <SegmentedBar
              data={categorical}
              categoryKey="name"
              dataKey="value"
              legend={legend !== "none"}
              legendVariant={legend === "stacked" ? "stacked" : "default"}
              isAnimationActive={animated}
            />,
          );
      add("alias", <SingleStackedBar data={categorical} categoryKey="name" dataKey="value" />);
      add("empty", <SegmentedBar data={[]} categoryKey="name" dataKey="value" />);
      break;
  }
  return cases;
}
