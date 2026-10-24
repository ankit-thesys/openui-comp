/**
 * Container-driven responsiveness fixture — all 19 families.
 *
 * This is the OTHER mechanism from `?only=...` in main.tsx, and the two are
 * deliberately never mixed:
 *
 *  - Explicit size props: the chart is TOLD its size. `useContainerSize`
 *    (hooks/core/useContainerSize.ts:13-14) returns numeric width/height
 *    verbatim and never measures. Covered deterministically in SSR by
 *    tests/size-props.baseline.test.tsx.
 *  - Container-driven (this file): the chart is told only its HEIGHT and must
 *    MEASURE its width from the box it is placed in, through a real
 *    ResizeObserver. That cannot be observed server-side at all, which is why
 *    it lives in the browser runner.
 *
 * Every family here is given a numeric `height` and NO `width`, so width comes
 * from the container. Height must be supplied: with `height` omitted,
 * `useContainerSize` returns 0 for it (`numericHeight ?? (typeof fixedHeight
 * === "string" ? size.height : 0)`), and the chart collapses. The three mini
 * charts take neither — their `size` defaults to "100%" — and the two
 * segmented-bar families take no size props at all, so both follow the
 * container natively.
 *
 * URL: ?width=<px>&theme=light|dark
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  AreaChart,
  AreaChartCondensed,
  BarChart,
  BarChartCondensed,
  CalendarHeatmap,
  FunnelChart,
  HeatmapChart,
  HorizontalBarChart,
  LineChart,
  LineChartCondensed,
  MiniAreaChart,
  MiniBarChart,
  MiniLineChart,
  PieChart,
  RadarChart,
  RadialChart,
  ScatterChart,
  SegmentedBar,
  SingleStackedBar,
} from "../../../../packages/react-ui/src/components/Charts";
import { ThemeProvider } from "../../../../packages/react-ui/src/components/ThemeProvider";
import {
  CALENDAR_RANGE,
  CALENDAR_ROWS,
  MINI_SERIES,
  MULTI_SERIES_ROWS,
  SCATTER_DATASETS,
  SHARE_ROWS,
} from "../datasets";
import "../../../../packages/react-ui/src/components/index.scss";

const params = new URLSearchParams(window.location.search);
const theme = params.get("theme") === "dark" ? "dark" : "light";
const width = Number(params.get("width") ?? 900);
/**
 * Height is a parameter too, because the square families (Pie, Radial, Radar
 * and the mini charts) size from min(width, height). Growing width alone can
 * never grow them, so a width-only sweep would report them as unresponsive
 * when they are simply height-bound.
 */
const height = Number(params.get("height") ?? 300);

const rows = MULTI_SERIES_ROWS as unknown as Array<Record<string, string | number>>;
const share = SHARE_ROWS as unknown as Array<Record<string, string | number>>;
const scatter = SCATTER_DATASETS as unknown as Array<{
  name: string;
  data: Array<{ x: number; y: number }>;
}>;
const calendar = CALENDAR_ROWS as unknown as Array<{ date: string; value: number }>;
const mini = MINI_SERIES as unknown as number[];

const freeze = document.createElement("style");
freeze.dataset["harness"] = "freeze-motion";
freeze.textContent = `*,*::before,*::after{transition-duration:0s!important;animation-duration:0s!important;animation-delay:0s!important;transition-delay:0s!important}`;
document.head.appendChild(freeze);

document.body.style.margin = "0";
document.body.style.fontFamily = "system-ui, sans-serif";
document.body.style.background = "var(--openui-background, #ffffff)";
document.body.style.color = "var(--openui-foreground, #000000)";

const H = height;

/** Height only — width is whatever the container gives. */
const CASES: Array<[string, React.ReactNode]> = [
  ["AreaChart", <AreaChart data={rows} categoryKey="month" height={H} />],
  ["AreaChartCondensed", <AreaChartCondensed data={rows} categoryKey="month" height={H} />],
  ["LineChart", <LineChart data={rows} categoryKey="month" height={H} />],
  ["LineChartCondensed", <LineChartCondensed data={rows} categoryKey="month" height={H} />],
  ["BarChart", <BarChart data={rows} categoryKey="month" height={H} />],
  ["BarChartCondensed", <BarChartCondensed data={rows} categoryKey="month" height={H} />],
  ["HorizontalBarChart", <HorizontalBarChart data={rows} categoryKey="month" height={H} />],
  ["PieChart", <PieChart data={share} categoryKey="browser" dataKey="visitors" height={H} />],
  ["RadialChart", <RadialChart data={share} categoryKey="browser" dataKey="visitors" height={H} />],
  ["RadarChart", <RadarChart data={rows} categoryKey="month" height={H} />],
  ["FunnelChart", <FunnelChart data={share} categoryKey="browser" dataKey="visitors" height={H} />],
  ["HeatmapChart", <HeatmapChart data={rows} categoryKey="month" height={H} />],
  ["ScatterChart", <ScatterChart data={scatter} height={H} />],
  ["SegmentedBar", <SegmentedBar data={share} categoryKey="browser" dataKey="visitors" />],
  ["SingleStackedBar", <SingleStackedBar data={share} categoryKey="browser" dataKey="visitors" />],
  ["CalendarHeatmap", <CalendarHeatmap data={calendar} range={CALENDAR_RANGE} height={H} />],
  ["MiniAreaChart", <MiniAreaChart data={mini} />],
  ["MiniBarChart", <MiniBarChart data={mini} />],
  ["MiniLineChart", <MiniLineChart data={mini} />],

  // --- Diagnostic cases, NOT part of the 19-family inventory ---------------
  // Pie and Radial default to the stacked legend, whose wrapper caps the chart
  // column's height. These two isolate that: same family, same container, only
  // the legend variant differs. Named with a suffix so the runner's
  // all-19-accounted-for check ignores them.
  [
    "PieChart__defaultLegend",
    <PieChart data={share} categoryKey="browser" dataKey="visitors" legendVariant="default" height={H} />,
  ],
  [
    "RadialChart__defaultLegend",
    <RadialChart data={share} categoryKey="browser" dataKey="visitors" legendVariant="default" height={H} />,
  ],
];

function App() {
  return (
    <ThemeProvider mode={theme}>
      <main
        data-container-ready="true"
        data-container-width={width}
        data-container-height={height}
        style={{ padding: 8 }}
      >
        {CASES.map(([name, node]) => (
          <section key={name} data-family={name} style={{ marginBottom: 16 }}>
            <h2 style={{ font: "600 12px system-ui", margin: "0 0 4px" }}>{name}</h2>
            {/* The box under test. Width is the independent variable; the
                outline makes overflow visible in a screenshot. */}
            <div
              data-container
              style={{
                width,
                // The families with no height prop (mini charts, segmented
                // bars) take their height from this box instead.
                height,
                outline: "1px solid rgba(128,128,128,0.5)",
                overflow: "visible",
              }}
            >
              <div data-chart-slot={name}>{node}</div>
            </div>
          </section>
        ))}
      </main>
    </ThemeProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
