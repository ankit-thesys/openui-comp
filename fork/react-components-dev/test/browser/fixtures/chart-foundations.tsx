// Consumer app for overrides and interaction coverage; public exports only.
import { configureStyles, LineChart, ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";
import { ChartFoundationCases, MiniChartCases } from "./foundation-cases";

const params = new URLSearchParams(location.search);
configureStyles({ layer: params.has("layer") ? "openui" : undefined });
const count = Number(params.get("series") ?? 1);
const data = ["Jan", "Feb"].map((month, i) => ({
  month,
  ...Object.fromEntries(
    Array.from({ length: count }, (_, j) => [j === 0 ? "sales" : `series${j}`, 12 + i + j]),
  ),
}));
createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={params.get("mode") === "dark" ? "dark" : "light"}>
    <div data-testid="tooltip-chart" style={{ width: 480 }}>
      <LineChart data={data} categoryKey="month" width={480} height={260} legend={false} />
    </div>
    <ChartFoundationCases />
    <MiniChartCases />
  </ThemeProvider>,
);
