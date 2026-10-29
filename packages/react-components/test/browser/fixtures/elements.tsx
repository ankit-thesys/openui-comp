// Client-renders one migrated component of the contract test (test/unit/contract/components.tsx),
// `?component=<folder>`, straight from that list, the way a client-only app renders it: its
// elements keep every prop as written, functions and plugin objects included, and its styles
// register at render.
import { LineChart } from "@openuidev/react-components";
import { createRoot } from "react-dom/client";
import { migratedComponents } from "../../unit/contract/components";

const folder = new URLSearchParams(location.search).get("component");
const component = migratedComponents.find((entry) => entry.folder === folder);
if (!component) throw new Error(`No migrated component ${folder}`);
createRoot(document.getElementById("root")!).render(
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
    {component.elements()}
  </>,
);
