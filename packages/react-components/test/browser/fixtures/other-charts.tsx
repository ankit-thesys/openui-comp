// Public consumer app for #104: supports static CSS before render, layers and lazy registration.
import { ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";
import { otherCharts } from "../../fixtures/other-charts";
import { OtherChartCases } from "./other-chart-cases";
const params = new URLSearchParams(location.search);
const charts = otherCharts.filter((chart) => !params.has("chart") || params.get("chart") === chart);
const mount = () =>
  createRoot(document.getElementById("root")!).render(
    <ThemeProvider
      mode={params.get("mode") === "dark" ? "dark" : "light"}
      cssLayer={params.has("layer") ? "openui" : undefined}
    >
      {charts.map((chart) => (
        <OtherChartCases key={chart} chart={chart} />
      ))}
    </ThemeProvider>,
  );
(window as Window & { mountOtherCharts?: () => void }).mountOtherCharts = mount;
if (!params.has("lazy")) mount();
