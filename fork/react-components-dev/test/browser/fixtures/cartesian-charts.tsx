// All cartesian stable targets, rendered through public exports for override and state checks.
import { configureStyles, ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";
import { CartesianCases, chartFamilies } from "./cartesian-cases";
const params = new URLSearchParams(location.search);
configureStyles({ layer: params.has("layer") ? "openui" : undefined });
createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    {chartFamilies.map((family) => (
      <CartesianCases key={family} family={family} />
    ))}
  </ThemeProvider>,
);
