// #104: identical public cases for #72 and the migrated package, in either theme.
import { ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";
import { OtherChartCases } from "./other-chart-cases";
const mode = new URLSearchParams(location.search).get("mode") === "dark" ? "dark" : "light";
createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={mode}>
    <OtherChartCases chart="FunnelChart" />
  </ThemeProvider>,
);
