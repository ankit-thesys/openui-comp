// Client-renders one migrated component of the contract test (test/unit/contract/components.tsx),
// `?component=<folder>`, straight from that list, the way a client-only app renders it: its
// elements keep every prop as written, functions and plugin objects included, and its styles
// register at render.
import { LineChart, ThemeProvider } from "@openuidev/react-components";
import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { migratedComponents, otherChartContracts } from "../../unit/contract/components";

export { getComponentStyles } from "@openuidev/react-components";

const params = new URLSearchParams(location.search);
const folder = params.get("component");
// `?layer=<name>` renders the same elements in layer mode (`<ThemeProvider cssLayer>`).
const layer = params.get("layer");
const component = [...migratedComponents, ...otherChartContracts].find(
  (entry) => entry.folder === folder,
);
if (!component) throw new Error(`No migrated component ${folder}`);
const elements = component.elements(params.has("contract"));
const markdownLooks = params.has("contract")
  ? migratedComponents.find((entry) => entry.folder === "MarkDownRenderer")!.elements()
  : [];
export const proseMarkup = params.has("contract")
  ? renderToString(
      layer ? (
        <ThemeProvider cssLayer={layer}>{markdownLooks}</ThemeProvider>
      ) : (
        <>{markdownLooks}</>
      ),
    )
  : "";
function Fixture() {
  useEffect(() => {
    document.querySelector<HTMLButtonElement>("[data-tooltip-trigger]")?.focus();
  }, []);
  return (
    <>
      {folder === "Charts" && (
        <div data-testid="bench-chart-tooltip" style={{ width: 480 }}>
          <LineChart
            data={["Jan", "Feb"].map((month) => ({
              month,
              ...Object.fromEntries(Array.from({ length: 11 }, (_, i) => [`Series ${i}`, i + 1])),
            }))}
            categoryKey="month"
            width={480}
            height={260}
            legend={false}
          />
        </div>
      )}
      {elements}
    </>
  );
}
createRoot(document.getElementById("root")!).render(
  layer ? (
    <ThemeProvider cssLayer={layer}>
      <Fixture />
    </ThemeProvider>
  ) : (
    <Fixture />
  ),
);
