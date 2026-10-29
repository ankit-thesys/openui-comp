// All cartesian stable targets, rendered through public exports for override and state checks.
import { ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";
import { CartesianCases, chartFamilies } from "./cartesian-cases";
const params = new URLSearchParams(location.search);
createRoot(document.getElementById("root")!).render(
  <ThemeProvider cssLayer={params.has("layer") ? "openui" : undefined}>
    {chartFamilies.map((family) => (
      <CartesianCases key={family} family={family} />
    ))}
  </ThemeProvider>,
);
