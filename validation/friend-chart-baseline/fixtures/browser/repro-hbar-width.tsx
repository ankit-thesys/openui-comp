/**
 * Minimal reproduction for DEFECT-001 (see reports/DEFECTS.md).
 *
 * `HorizontalBarChart` computes its value scale from a NUMERIC `width` prop but
 * never applies that width to its container box, while its drawing `<svg>` is
 * sized `width="100%"`. So in any parent that does not itself supply the width,
 * the bars are laid out for `width` px inside a box of a different size and
 * overflow it.
 *
 * Three cases, identical data and identical `width` value:
 *   A  numeric width={640}, shrink-to-fit parent (inline-block)  -> expected broken
 *   B  string  width="640px", same shrink-to-fit parent          -> expected correct
 *   C  numeric width={640}, parent is a 640px block              -> expected correct
 *
 * Case B vs A isolates the cause to the numeric-vs-string branch in
 * packages/react-ui/src/components/Charts/utils/buildContainerStyle.ts:7-8.
 * Case C shows the numeric path only looks right when the parent happens to
 * provide the same width.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HorizontalBarChart } from "../../../../packages/react-ui/src/components/Charts";
import { ThemeProvider } from "../../../../packages/react-ui/src/components/ThemeProvider";
import { MULTI_SERIES_ROWS } from "../datasets";
import "../../../../packages/react-ui/src/components/index.scss";

const rows = MULTI_SERIES_ROWS as unknown as Array<Record<string, string | number>>;

const freeze = document.createElement("style");
freeze.textContent = `*,*::before,*::after{transition-duration:0s!important;animation-duration:0s!important}`;
document.head.appendChild(freeze);

function Case({
  id,
  label,
  wrapperStyle,
  children,
}: {
  id: string;
  label: string;
  wrapperStyle: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 24 }}>
      <h2 style={{ font: "600 13px system-ui", margin: "0 0 6px" }}>{label}</h2>
      {/* The outer box is always 900px and visible, so clipping is obvious. */}
      <div style={{ width: 900, outline: "2px solid #888" }}>
        <div data-case={id} style={wrapperStyle}>
          {children}
        </div>
      </div>
    </section>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider mode="light">
      <main data-repro-ready="true" style={{ font: "13px system-ui", padding: 12 }}>
        <Case
          id="A-numeric-shrink"
          label="A — numeric width={640}, inline-block (shrink-to-fit) parent"
          wrapperStyle={{ display: "inline-block" }}
        >
          <HorizontalBarChart data={rows} categoryKey="month" width={640} height={360} />
        </Case>
        <Case
          id="B-string-shrink"
          label='B — string width="640px", same inline-block parent'
          wrapperStyle={{ display: "inline-block" }}
        >
          <HorizontalBarChart data={rows} categoryKey="month" width="640px" height={360} />
        </Case>
        <Case
          id="C-numeric-block640"
          label="C — numeric width={640}, parent is a 640px block"
          wrapperStyle={{ display: "block", width: 640 }}
        >
          <HorizontalBarChart data={rows} categoryKey="month" width={640} height={360} />
        </Case>
      </main>
    </ThemeProvider>
  </StrictMode>,
);
