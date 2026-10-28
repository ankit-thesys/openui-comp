// Client-renders one migrated component of the contract test (test/unit/contract/components.tsx),
// `?component=<folder>`, straight from that list, the way a client-only app renders it: its
// elements keep every prop as written, functions and plugin objects included, and its styles
// register at render.
import { LineChart } from "@openuidev/react-components";
import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { migratedComponents } from "../../unit/contract/components";

const folder = new URLSearchParams(location.search).get("component");
const component = migratedComponents.find((entry) => entry.folder === folder);
if (!component) throw new Error(`No migrated component ${folder}`);
const elements = component.elements();
function Fixture() {
  useEffect(() => {
    document.querySelector<HTMLButtonElement>("[data-tooltip-trigger]")?.focus();
  }, []);
  return (
    <>
      {component?.folder === "Modal" && (
        // Modal leaves box-sizing to the page. Pin that input so its percentage translation
        // resolves against the same border box with or without preflight. Zero specificity
        // lets any library declaration still win; every declared property remains asserted.
        <style>{`:where(.openui-modal-content) { box-sizing: border-box; }`}</style>
      )}
      {["VisualCardBlock", "OverviewCardBlock"].includes(component?.folder ?? "") && (
        // #100: like #72, these cards leave box-sizing to the page. Pin that input so
        // auto margins/flex widths resolve identically with and without preflight.
        // Zero specificity lets library declarations win; the bench still checks all of them.
        <style>{`:where(.openui-visual-card, .openui-overview-card-block-card) { box-sizing: content-box; }`}</style>
      )}
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
createRoot(document.getElementById("root")!).render(<Fixture />);
