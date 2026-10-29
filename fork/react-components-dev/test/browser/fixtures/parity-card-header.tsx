import { CardHeader, ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";
declare const __PARITY_BASELINE__: boolean;
const mode = new URLSearchParams(location.search).get("mode") === "dark" ? "dark" : "light";
const prefix = __PARITY_BASELINE__ ? ".openui-header" : ".openui-card-header";
const parts = JSON.stringify(
  Object.fromEntries(
    ["top", "top-left", "top-left-icon", "top-right", "bottom"].map((part) => [
      part,
      `${prefix}-${part}`,
    ]),
  ),
);
createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={mode}>
    {[false, true].map((full) => (
      <CardHeader
        key={String(full)}
        title="Title"
        subtitle={full ? "Subtitle" : undefined}
        icon={full ? <svg width="18" height="18" /> : undefined}
        data-parity-case={full ? "full" : "title"}
        data-parity-parts={parts}
      />
    ))}
  </ThemeProvider>,
);
