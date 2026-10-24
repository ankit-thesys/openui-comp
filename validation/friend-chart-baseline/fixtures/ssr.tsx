/**
 * SSR evidence helper.
 *
 * Why `react-dom/server` and not a DOM: packages/react-ui does NOT depend on
 * jsdom (only its sibling packages do — see reports/REPORT.md), and this ticket
 * forbids adding dependencies, so there is no DOM environment available here.
 * The repo's own component tests use the same approach
 * (src/components/AgentInterface/__tests__/*.ssr.test.tsx), so this reuses an
 * existing convention rather than inventing one.
 *
 * What makes it deterministic: `useContainerSize`
 * (src/components/Charts/hooks/core/useContainerSize.ts:13-14) returns early
 * and reports the props verbatim when BOTH `width` and `height` are numeric, so
 * a chart given numeric sizes needs no measurement, no ResizeObserver and no
 * effects to lay itself out. Every family in the registry is given numeric
 * sizes for exactly this reason. Entrance animation is off by default
 * (`isAnimationActive` defaults false), and effects do not run during
 * `renderToString` at all, so the recorded markup is the settled first frame.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { renderToString } from "react-dom/server";

const EVIDENCE_DIR = fileURLToPath(new URL("../evidence/ssr", import.meta.url));

/**
 * React's `useId` values (`_R_0_`, `_R_1b_`, …) are allocated by position in the
 * render tree, so merely wrapping a chart in another provider shifts every
 * generated id — and they leak into markup through `clipPath` / gradient ids.
 * Left raw they would swamp any diff of recorded evidence with meaningless
 * churn, so they are normalised to a single placeholder. Nothing else is
 * rewritten: all geometry, colour and text stays byte-exact.
 */
export function normalizeIds(html: string): string {
  return html.replace(/_R_[0-9a-z]*_/g, "_R_ID_");
}

export function render(el: React.ReactElement): string {
  return normalizeIds(renderToString(el));
}

/** Record markup as evidence under evidence/ssr/, returning it for assertions. */
export function renderAndRecord(name: string, el: React.ReactElement): string {
  const html = normalizeIds(renderToString(el));
  mkdirSync(EVIDENCE_DIR, { recursive: true });
  writeFileSync(`${EVIDENCE_DIR}/${name}.html`, `${html}\n`);
  return html;
}

/** Count occurrences of an SVG/DOM tag in recorded markup. */
export function countTag(html: string, tag: string): number {
  return (html.match(new RegExp(`<${tag}[\\s>]`, "g")) ?? []).length;
}

/**
 * Every drawable mark a family might use. Families differ in technology —
 * SegmentedBar is CSS divs, Radar/Heatmap/Calendar use polygon/rect, the
 * cartesian families use path — so "did it draw anything" has to span all of
 * them rather than assume `<path>`.
 */
export const MARK_TAGS = ["path", "rect", "circle", "polygon", "polyline", "line"] as const;

export function countMarks(html: string): number {
  return MARK_TAGS.reduce((n, t) => n + countTag(html, t), 0);
}

/** Numbers pulled from an attribute, for geometry assertions. */
export function attrValues(html: string, attr: string): string[] {
  return [...html.matchAll(new RegExp(`${attr}="([^"]*)"`, "g"))].map((m) => m[1]);
}

/** Visible text content of every <text> node, in document order. */
export function textNodes(html: string): string[] {
  return [...html.matchAll(/<text[^>]*>(.*?)<\/text>/g)].map((m) =>
    m[1].replace(/<[^>]*>/g, "").replace(/<!--\s*-->/g, "").trim(),
  );
}

/**
 * A path `d` that is a degenerate zero-area stub, e.g. `M0,-135L0,0Z` — what a
 * share-of-total family emits when every value resolves to 0 (for instance when
 * `dataKey` names a field the rows do not have). Used to prove the default
 * cases really drew something.
 */
export function isDegeneratePath(d: string): boolean {
  return /^M0,-?[\d.]+L0,0Z$/.test(d.trim());
}
