import * as Core from "@openuidev/react-ui-core";
import { useState } from "react";
import { createRoot } from "react-dom/client";

type Family =
  | "area"
  | "area-condensed"
  | "line"
  | "line-condensed"
  | "bar"
  | "bar-condensed"
  | "horizontal"
  | "scatter"
  | "mini-area"
  | "mini-bar"
  | "mini-line";
type Configuration = {
  family: Family;
  theme: string;
  nested: boolean;
  overrides: boolean;
  visible: boolean;
  width: number;
  height: number | string;
  empty: boolean;
  updated: boolean;
  animation: boolean;
  legend: boolean;
  grid: boolean;
  palette: boolean;
  stacked: boolean;
  sizeMode: "container" | "number" | "string";
  miniSize: number | string;
  print: boolean;
  longLabels: boolean;
  fitLegend: boolean;
};
type RecordedEvent = { kind: string; args: unknown[] };
declare global {
  interface Window {
    mountCharts: () => void;
    configure: (next: Partial<Configuration>) => void;
    readEvents: () => RecordedEvent[];
    clearEvents: () => void;
  }
}
const custom = {
  textNeutralPrimary: "rgb(40,70,90)",
  textNeutralSecondary: "rgb(60,80,100)",
  borderDefault: "rgb(130,140,150)",
  spaceM: "18px",
  radiusM: "11px",
};
function App() {
  const [config, setConfig] = useState<Configuration>({
    family: "area",
    theme: "light",
    nested: false,
    overrides: false,
    visible: true,
    width: 640,
    height: 320,
    empty: false,
    updated: false,
    animation: false,
    legend: true,
    grid: true,
    palette: false,
    stacked: true,
    sizeMode: "container",
    miniSize: 120,
    print: false,
    longLabels: false,
    fitLegend: true,
  });
  const [events, setEvents] = useState<RecordedEvent[]>([]);
  Object.assign(window, {
    configure: (next: Partial<Configuration>) => setConfig((old) => ({ ...old, ...next })),
    readEvents: () => events,
    clearEvents: () => setEvents([]),
  });
  const framework = new URLSearchParams(location.search).get("framework");
  const className = !config.overrides
    ? "consumer-chart"
    : framework === "tailwind3"
      ? "consumer-chart !bg-red-500 !text-white !p-8 !rounded-none !border-0 hover:!bg-green-500"
      : framework === "tailwind4"
        ? "consumer-chart bg-red-500! text-white! p-8! rounded-none! border-0! hover:bg-green-500!"
        : "consumer-chart explicit";
  const data = config.empty
    ? []
    : Array.from({ length: config.updated ? 5 : 3 }, (_, index) => ({
        name: config.longLabels
          ? `Quarter ${index + 1} with a deliberately long category label`
          : `Q${index + 1}`,
        Alpha: (index + 1) * (config.updated ? 15 : 10),
        Beta: index % 2 ? -8 : 15,
      }));
  const record = (kind: string, ...args: unknown[]) => setEvents((old) => [...old, { kind, args }]);
  const common = {
    data,
    categoryKey: "name" as const,
    className,
    height: config.height,
    width: config.sizeMode === "number" ? 480 : config.sizeMode === "string" ? "480px" : undefined,
    fitLegendInHeight: config.fitLegend,
    legend: config.legend,
    grid: config.grid,
    isAnimationActive: config.animation,
    customPalette: config.palette ? ["#1264a3", "#d04a35"] : undefined,
    xAxisLabel: "Quarter",
    yAxisLabel: "Amount",
    onClick: (row: (typeof data)[number], index: number) => record(config.family, row, index),
  };
  const mini = {
    data: config.empty ? [] : config.updated ? [12, -8, 0, 28, 17] : [10, 0, -5],
    size: config.miniSize,
    className,
    customPalette: common.customPalette,
    isAnimationActive: config.animation,
  };
  const miniClick = (event: React.MouseEvent<HTMLDivElement>) =>
    record(config.family, { type: event.type, tag: event.currentTarget.tagName });
  let chart;
  switch (config.family) {
    case "area":
      chart = <Core.AreaChart {...common} stacked={config.stacked} crosshair highlight />;
      break;
    case "area-condensed":
      chart = <Core.AreaChartCondensed {...common} stacked={config.stacked} crosshair highlight />;
      break;
    case "line":
      chart = <Core.LineChart {...common} showDots crosshair highlight />;
      break;
    case "line-condensed":
      chart = <Core.LineChartCondensed {...common} showDots crosshair highlight />;
      break;
    case "bar":
      chart = <Core.BarChart {...common} variant={config.stacked ? "stacked" : "grouped"} />;
      break;
    case "bar-condensed":
      chart = (
        <Core.BarChartCondensed {...common} variant={config.stacked ? "stacked" : "grouped"} />
      );
      break;
    case "horizontal":
      chart = (
        <Core.HorizontalBarChart {...common} variant={config.stacked ? "stacked" : "grouped"} />
      );
      break;
    case "scatter":
      chart = (
        <Core.ScatterChart
          className={className}
          height={config.height}
          width={common.width}
          data={
            config.empty
              ? []
              : [
                  {
                    name: "Alpha",
                    data: [
                      { x: 10, y: 20 },
                      { x: 30, y: config.updated ? 50 : 40 },
                    ],
                  },
                  { name: "Beta", data: [{ x: 20, y: 15 }] },
                ]
          }
          legend={config.legend}
          grid={config.grid}
          customPalette={common.customPalette}
          isAnimationActive={config.animation}
          xAxisLabel="X value"
          yAxisLabel="Y value"
          onClick={(...args) => record(config.family, ...args)}
        />
      );
      break;
    case "mini-area":
      chart = <Core.MiniAreaChart {...mini} onAreaClick={miniClick} />;
      break;
    case "mini-bar":
      chart = <Core.MiniBarChart {...mini} onBarsClick={miniClick} />;
      break;
    case "mini-line":
      chart = <Core.MiniLineChart {...mini} onLineClick={miniClick} />;
      break;
  }
  let content = (
    <div
      id="sizing-parent"
      style={{
        width: config.width,
        maxWidth: "100%",
        height: config.family.startsWith("mini") ? 240 : undefined,
      }}
    >
      {chart}
    </div>
  );
  if (config.print) content = <Core.PrintContextProvider>{content}</Core.PrintContextProvider>;
  return (
    <>
      <div id="unrelated">Host content</div>
      <button id="outside">Outside</button>
      <section id="zone" data-ready data-config={JSON.stringify(config)}>
        {config.visible &&
          (config.theme === "none" ? (
            content
          ) : (
            <Core.ThemeProvider
              cssSelector="#zone"
              mode={config.theme.includes("dark") ? "dark" : "light"}
              lightTheme={config.theme.startsWith("custom") ? custom : undefined}
              darkTheme={config.theme.startsWith("custom") ? custom : undefined}
            >
              <span id="outer-color" style={{ color: "var(--openui-text-neutral-primary)" }}>
                Outer scope
              </span>
              <div id="nested-owner">
                {config.nested ? (
                  <Core.ThemeProvider cssSelector="#nested-owner" mode="dark" darkTheme={custom}>
                    {content}
                  </Core.ThemeProvider>
                ) : (
                  content
                )}
              </div>
            </Core.ThemeProvider>
          ))}
      </section>
      <section id="independent">
        <Core.ThemeProvider cssSelector="#independent" mode="light">
          <span id="independent-color" style={{ color: "var(--openui-text-neutral-primary)" }}>
            Independent scope
          </span>
        </Core.ThemeProvider>
      </section>
      <output id="events">{JSON.stringify(events)}</output>
    </>
  );
}
const root = createRoot(document.getElementById("app")!);
window.mountCharts = () => root.render(<App />);
