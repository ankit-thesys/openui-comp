/**
 * Responsive fixture: container-driven layout, which SSR cannot observe.
 *
 * The main grid fixture pins every chart to numeric width/height for
 * determinism, so nothing there reflows. This page does the opposite: it varies
 * the width and lets the components measure it, which is the path that actually
 * runs in a consumer app (ResizeObserver -> useContainerSize).
 *
 * Two documented behaviours are exercised:
 *  - PieChart's stacked legend sits BESIDE the chart from 400px wide and BELOW
 *    it when narrower (PieChart/types.ts, `legendVariant`).
 *  - HeatmapChart follows its container's width when no `width` prop is set
 *    (HeatmapChart stories: "width always follows the container unless `width`
 *    is set").
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HeatmapChart, PieChart } from "../../../../packages/react-ui/src/components/Charts";
import { ThemeProvider } from "../../../../packages/react-ui/src/components/ThemeProvider";
import { MULTI_SERIES_ROWS, SHARE_ROWS } from "../datasets";
import "../../../../packages/react-ui/src/components/index.scss";

const rows = MULTI_SERIES_ROWS as unknown as Array<Record<string, string | number>>;
const share = SHARE_ROWS as unknown as Array<Record<string, string | number>>;

const freeze = document.createElement("style");
freeze.textContent = `*,*::before,*::after{transition-duration:0s!important;animation-duration:0s!important}`;
document.head.appendChild(freeze);

/** Widths that straddle the documented 400px legend breakpoint. */
const WIDTHS = [320, 380, 400, 560, 720];

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider mode="light">
      <main data-responsive-ready="true" style={{ font: "13px system-ui", padding: 12 }}>
        <h1 style={{ fontSize: 15 }}>PieChart — stacked legend across the 400px breakpoint</h1>
        {WIDTHS.map((w) => (
          <div key={`pie-${w}`} data-pie-width={w} style={{ width: w, outline: "1px solid #bbb", marginBottom: 10 }}>
            <PieChart data={share} categoryKey="browser" dataKey="visitors" width={w} height={240} />
          </div>
        ))}

        <h1 style={{ fontSize: 15, marginTop: 24 }}>HeatmapChart — no width prop, follows its container</h1>
        {WIDTHS.map((w) => (
          <div key={`heat-${w}`} data-heat-width={w} style={{ width: w, outline: "1px solid #bbb", marginBottom: 10 }}>
            <HeatmapChart data={rows} categoryKey="month" height={200} />
          </div>
        ))}
      </main>
    </ThemeProvider>
  </StrictMode>,
);
