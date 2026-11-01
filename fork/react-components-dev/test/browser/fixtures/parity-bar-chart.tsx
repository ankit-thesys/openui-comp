// Computed styles of BarChart against #72, light and dark; no intentional differences.
import { ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";
import { CartesianCases } from "./cartesian-cases";
const mode = new URLSearchParams(location.search).get("mode") === "dark" ? "dark" : "light";
createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={mode}>
    <CartesianCases family="bar-chart" />
  </ThemeProvider>,
);
