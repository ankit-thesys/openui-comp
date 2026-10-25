import * as Core from "@openuidev/react-ui-core";
import { useState } from "react";
import { createRoot } from "react-dom/client";

const rows = [
  { name: "Alpha", value: 80, other: 30 },
  { name: "Beta", value: 50, other: 70 },
  { name: "Gamma", value: 20, other: 40 },
];
const calendarRows = [
  { date: "2026-01-05", value: 1 },
  { date: "2026-01-08", value: 3 },
  { date: "2026-01-17", value: 7 },
];
const custom = {
  textNeutralPrimary: "rgb(40,70,90)",
  textNeutralSecondary: "rgb(60,80,100)",
  spaceM: "18px",
  radiusS: "9px",
};
function App() {
  const [config, setConfig] = useState({
    family: "PieChart",
    compactLegend: false,
    theme: "light",
    variant: false,
    width: 520,
    height: 340,
    empty: false,
    visible: true,
    print: false,
    animate: false,
    nested: false,
    overrides: false,
  });
  Object.assign(window, {
    configure: (next: Partial<typeof config>) => setConfig((old) => ({ ...old, ...next })),
  });
  const props = {
    data: config.empty ? [] : rows,
    categoryKey: "name",
    dataKey: "value",
    height: config.height,
    isAnimationActive: config.animate,
    className: config.overrides ? "consumer-chart" : undefined,
  };
  const chart =
    config.family === "PieChart" ? (
      <Core.PieChart
        legendVariant={config.compactLegend ? "default" : "stacked"}
        {...props}
        variant={config.variant ? "donut" : "pie"}
        appearance={config.variant ? "semiCircular" : "circular"}
      />
    ) : config.family === "RadialChart" ? (
      <Core.RadialChart
        {...props}
        legendVariant={config.compactLegend ? "default" : "stacked"}
        grid
        variant={config.variant ? "semiCircular" : "circular"}
      />
    ) : config.family === "RadarChart" ? (
      <Core.RadarChart
        {...props}
        gridShape={config.variant ? "circle" : "polygon"}
        showDots={config.variant}
        variant={config.variant ? "area" : "line"}
      />
    ) : config.family === "HeatmapChart" ? (
      <Core.HeatmapChart
        {...props}
        showCellLabels
        rampMode={config.variant ? "diverging" : "sequential"}
      />
    ) : config.family === "FunnelChart" ? (
      <Core.FunnelChart
        {...props}
        orientation={config.variant ? "vertical" : "horizontal"}
        edges={config.variant ? "straight" : "curved"}
      />
    ) : config.family === "CalendarHeatmap" ? (
      <Core.CalendarHeatmap
        className={config.overrides ? "consumer-chart" : undefined}
        data={config.empty ? [] : calendarRows}
        range={["2026-01-04", "2026-01-24"]}
        height={config.height}
        isAnimationActive={config.animate}
        legendVariant={config.variant ? "gradient" : "swatches"}
        hideGhostCells={false}
        columnSeparators={{ groupBy: { every: 2 }, spacing: 8, dashed: config.variant }}
        levelStyles={
          config.variant
            ? [null, null, null, null, { pattern: "dots", color: "#123456" }]
            : undefined
        }
      />
    ) : (
      <Core.SegmentedBar {...props} legendVariant={config.variant ? "stacked" : "default"} />
    );
  const content = (
    <div style={{ width: config.width, maxWidth: "100%" }}>
      {config.print ? <Core.PrintContextProvider>{chart}</Core.PrintContextProvider> : chart}
    </div>
  );
  return (
    <>
      <div id="unrelated">Host content</div>
      <style>{`.consumer-chart{outline:3px solid rgb(200,20,30)!important}.overrides [class*="-chart-grid"],.overrides .openui-calendar-heatmap-separator{stroke:rgb(170,20,80)!important}`}</style>
      <section
        id="zone"
        className={config.overrides ? "overrides" : undefined}
        data-ready
        data-config={JSON.stringify(config)}
      >
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
          <span style={{ color: "var(--openui-text-neutral-primary)" }}>Independent scope</span>
        </Core.ThemeProvider>
      </section>
    </>
  );
}
const root = createRoot(document.getElementById("app")!);
Object.assign(window, { mountCharts: () => root.render(<App />) });
