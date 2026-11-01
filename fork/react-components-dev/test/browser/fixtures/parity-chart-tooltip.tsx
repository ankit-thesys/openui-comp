// The real portal is activated through public LineChart mouse interaction by the parity spec.
import { LineChart, ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";
declare const __PARITY_BASELINE__: boolean;
const portal = __PARITY_BASELINE__ ? ".openui-portal-tooltip" : ".openui-chart-tooltip-portal";
const mode = new URLSearchParams(location.search).get("mode") === "dark" ? "dark" : "light";
const globalParts = JSON.stringify({
  portal,
  root: ".openui-chart-tooltip",
  label: ".openui-chart-tooltip-label",
  content: ".openui-chart-tooltip-content",
  item: ".openui-chart-tooltip-content-item",
  indicator: ".openui-chart-tooltip-content-indicator",
  wrapper: ".openui-chart-tooltip-content-value-wrapper",
  contentLabel: ".openui-chart-tooltip-content-label",
  labelText: ".openui-chart-tooltip-content-label span",
  value: ".openui-chart-tooltip-content-value",
  separator: ".openui-chart-tooltip-content-item-separator",
  lastSeparator:
    ".openui-chart-tooltip-content-item:last-child .openui-chart-tooltip-content-item-separator",
  more: ".openui-chart-tooltip-content-view-more",
});
createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={mode}>
    {[1, 2, 3, 11].map((count) => (
      <section
        key={count}
        data-parity-case={`tooltip/${count}`}
        data-parity-global-parts={globalParts}
        style={{ width: 480, marginBottom: 24 }}
      >
        <LineChart
          data={["Jan", "Feb"].map((month, i) => ({
            month,
            ...Object.fromEntries(
              Array.from({ length: count }, (_, j) => [`Series ${j + 1}`, 12 + i + j]),
            ),
          }))}
          categoryKey="month"
          width={480}
          height={260}
          legend={false}
        />
      </section>
    ))}
  </ThemeProvider>,
);
