// Every mini-chart curve, gradient/solid area, empty/single/mixed-sign data, animation and click.
import { ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";
import { MiniChartCases } from "./foundation-cases";
const mode = new URLSearchParams(location.search).get("mode") === "dark" ? "dark" : "light";
createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={mode}>
    <MiniChartCases />
  </ThemeProvider>,
);
