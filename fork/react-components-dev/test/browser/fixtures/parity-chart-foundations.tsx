// Shared chart chrome, measured against #72 in light and dark. Class mappings live in the cases.
import { ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";
import { ChartFoundationCases } from "./foundation-cases";
const mode = new URLSearchParams(location.search).get("mode") === "dark" ? "dark" : "light";
createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={mode}>
    <ChartFoundationCases />
  </ThemeProvider>,
);
