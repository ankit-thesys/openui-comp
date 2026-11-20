/**
 * Browser fixture: every chart family on the deterministic datasets, rendered
 * as an external consumer would (public `Charts` entry point only).
 *
 * URL controls, so a screenshot run is fully described by its URL:
 *   ?theme=light|dark   theme mode passed to ThemeProvider (default light)
 *   ?only=<Family>[,<Family>…]  render just these families, in registry order
 *   ?state=default|empty  default props, or `data={[]}`
 *   ?motion=on          keep CSS transitions (default: off, see below)
 *
 * Animations: every family already defaults `isAnimationActive` to false, so no
 * entrance animation plays. CSS transitions on hover/fill are killed from the
 * HARNESS side by the stylesheet injected below — product source is untouched.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "../../../../packages/react-ui/src/components/ThemeProvider";
import { FAMILIES } from "../families";
// Exposes window.__chartProbe for the interaction evidence run.
import "./interactions";

// react-ui ships styles as SCSS; vite compiles them with the `sass` already
// installed in packages/react-ui. This is the package's own component CSS
// entry, imported unchanged.
import "../../../../packages/react-ui/src/components/index.scss";

const params = new URLSearchParams(window.location.search);
const theme = params.get("theme") === "dark" ? "dark" : "light";
const only = params.get("only");
const state = params.get("state") === "empty" ? "empty" : "default";
const motion = params.get("motion") === "on";

/**
 * Harness-side motion freeze. Charts settle instantly without it for entrance
 * (that is `isAnimationActive=false`), but fills and dots carry CSS
 * transitions; zeroing them makes a hover screenshot reproducible. Scoped to a
 * harness <style> tag — no product stylesheet is edited.
 */
if (!motion) {
  const style = document.createElement("style");
  style.dataset.harness = "freeze-motion";
  style.textContent = `*, *::before, *::after {
    transition-duration: 0s !important;
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    transition-delay: 0s !important;
  }`;
  document.head.appendChild(style);
}

document.documentElement.dataset.fixtureTheme = theme;
document.body.style.margin = "0";
document.body.style.fontFamily = "system-ui, sans-serif";
/**
 * The page surface comes from the theme's own tokens.
 *
 * ThemeProvider emits CSS CUSTOM PROPERTIES only — it does not paint a page
 * background. Without this, `mode="dark"` renders near-white axis and legend
 * text onto the browser's default white page and the labels are invisible. That
 * is the consumer's job, not a library defect, but a screenshot fixture has to
 * do it or the dark evidence is unreadable.
 */
document.body.style.background = "var(--openui-background, #ffffff)";
document.body.style.color = "var(--openui-foreground, #000000)";

const wanted = only
  ? new Set(
      only
        .split(",")
        .map((n) => n.trim())
        .filter(Boolean),
    )
  : null;
const shown = wanted ? FAMILIES.filter((f) => wanted.has(f.name)) : FAMILIES;
if (wanted) {
  const missing = [...wanted].filter((n) => !FAMILIES.some((f) => f.name === n));
  // Fail loudly rather than silently screenshotting an empty page: a typo in
  // `only` would otherwise look like "this family renders nothing".
  if (missing.length) throw new Error(`Unknown family in ?only=: ${missing.join(", ")}`);
}

function Card({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <section
      data-family={name}
      data-state={state}
      style={{
        border: "1px solid rgba(128,128,128,0.35)",
        borderRadius: 8,
        padding: 12,
        display: "inline-block",
        verticalAlign: "top",
        margin: 8,
      }}
    >
      <h2 style={{ font: "600 13px/1.4 system-ui, sans-serif", margin: "0 0 8px" }}>{name}</h2>
      <div data-chart-slot={name}>{children}</div>
    </section>
  );
}

function App() {
  return (
    <ThemeProvider mode={theme}>
      <main
        data-fixture-ready="true"
        data-theme-mode={theme}
        style={{ padding: 8, minHeight: "100vh" }}
      >
        {shown.map((f) => {
          const node = state === "empty" ? f.renderEmpty?.() : f.render();
          return (
            <Card key={f.name} name={f.name}>
              {node ?? <em>no case</em>}
            </Card>
          );
        })}
      </main>
    </ThemeProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
