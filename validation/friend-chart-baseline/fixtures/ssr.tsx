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
  // A capture group is `string | undefined` to the type system even when the
  // pattern guarantees it matched, so the fallback is for the compiler, not a
  // real case.
  return [...html.matchAll(new RegExp(`${attr}="([^"]*)"`, "g"))].map((m) => m[1] ?? "");
}

/** Visible text content of every <text> node, in document order. */
export function textNodes(html: string): string[] {
  return [...html.matchAll(/<text[^>]*>(.*?)<\/text>/g)].map((m) =>
    (m[1] ?? "").replace(/<[^>]*>/g, "").replace(/<!--\s*-->/g, "").trim(),
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

/**
 * Narrow `T | undefined` to `T`, throwing with a useful message if absent.
 *
 * Under the repo's strict settings every indexed access and regex capture is
 * `| undefined`. Silencing that with `!` would hide a genuinely missing match
 * behind a confusing `NaN` comparison further down; this fails at the point of
 * the missing value and says what was being looked for.
 */
export function required<T>(value: T | undefined | null, what: string): T {
  if (value === undefined || value === null) {
    throw new Error(`Expected ${what}, got ${value === null ? "null" : "undefined"}`);
  }
  return value;
}

/**
 * The right-most drawn x coordinate in recorded markup.
 *
 * Families draw with different primitives, so a single regex over `d="..."`
 * only works for the path-based ones and silently reports 0 for Radar
 * (polygon), Heatmap/Calendar (rect) and Scatter (circle). This spans all of
 * them, which is what makes it usable as a size-responsiveness probe across
 * the whole registry rather than just the cartesian families.
 */
export function maxDrawnX(html: string): number {
  const xs: number[] = [];
  const push = (v: string | undefined) => {
    const n = Number(v);
    if (Number.isFinite(n)) xs.push(n);
  };

  // <path d="M36,228C71.2,199 ..."> — every coordinate pair's x component.
  for (const m of html.matchAll(/ d="([^"]*)"/g)) {
    for (const p of (m[1] ?? "").matchAll(/[-\d.]+,[-\d.]+/g)) {
      push(p[0]?.split(",")[0]);
    }
  }
  // <rect x= width=> — the right edge.
  for (const m of html.matchAll(/<rect([^>]*)>/g)) {
    const attrs = m[1] ?? "";
    const x = Number(/\sx="([-\d.]+)"/.exec(attrs)?.[1] ?? 0);
    const w = Number(/\swidth="([-\d.]+)"/.exec(attrs)?.[1] ?? 0);
    if (Number.isFinite(x) && Number.isFinite(w)) xs.push(x + w);
  }
  // <circle cx=>
  for (const m of html.matchAll(/<circle[^>]*\scx="([-\d.]+)"/g)) push(m[1]);
  // <polygon points="x,y x,y ...">
  for (const m of html.matchAll(/<polygon[^>]*\spoints="([^"]*)"/g)) {
    for (const p of (m[1] ?? "").matchAll(/([-\d.eE+]+),[-\d.eE+]+/g)) push(p[1]);
  }
  // <line x1= x2=>
  for (const m of html.matchAll(/<line[^>]*\sx2="([-\d.]+)"/g)) push(m[1]);

  return xs.length ? Math.max(...xs) : 0;
}
