/**
 * Deterministic synthetic datasets for the chart baseline.
 *
 * Every value here is a literal. Nothing is random, nothing reads the clock,
 * and nothing depends on locale or timezone except where a family's own API
 * forces a date (see `CALENDAR_ROWS`, which pins explicit date-only strings —
 * `CalendarHeatmap` documents that it parses those in LOCAL time).
 *
 * Rationale for the shapes: the row-shaped families all take
 * `Array<Record<string, string | number>>` (`ChartData` in
 * packages/react-ui/src/components/Charts/types/common.ts:11), with
 * `categoryKey` naming the label field and every other key becoming a series.
 * Three series x six categories is the smallest shape that still exercises
 * multi-series colour assignment, stacking and legend wrapping.
 */

/** Canonical multi-series rows: 6 categories x 3 numeric series. */
export const MULTI_SERIES_ROWS = [
  { month: "Jan", desktop: 186, mobile: 80, tablet: 45 },
  { month: "Feb", desktop: 305, mobile: 200, tablet: 100 },
  { month: "Mar", desktop: 237, mobile: 120, tablet: 150 },
  { month: "Apr", desktop: 73, mobile: 190, tablet: 60 },
  { month: "May", desktop: 209, mobile: 130, tablet: 95 },
  { month: "Jun", desktop: 214, mobile: 140, tablet: 110 },
] as const satisfies ReadonlyArray<Record<string, string | number>>;

/** Single-series rows for the share-of-total families (pie / radial / funnel / segmented). */
export const SHARE_ROWS = [
  { browser: "Chrome", visitors: 400 },
  { browser: "Safari", visitors: 300 },
  { browser: "Firefox", visitors: 200 },
  { browser: "Edge", visitors: 100 },
] as const satisfies ReadonlyArray<Record<string, string | number>>;

/** Signed values — exercises the zero line, negative stacking and diverging ramps. */
export const SIGNED_ROWS = [
  { quarter: "Q1", profit: 120, loss: -40 },
  { quarter: "Q2", profit: -60, loss: -90 },
  { quarter: "Q3", profit: 210, loss: -20 },
  { quarter: "Q4", profit: -35, loss: -150 },
] as const satisfies ReadonlyArray<Record<string, string | number>>;

/** Scatter takes datasets of points, not rows (ScatterChart/types.ts:11). */
export const SCATTER_DATASETS = [
  {
    name: "Group A",
    data: [
      { x: 10, y: 30 },
      { x: 20, y: 50 },
      { x: 30, y: 25 },
      { x: 40, y: 70 },
    ],
  },
  {
    name: "Group B",
    data: [
      { x: 15, y: 60 },
      { x: 25, y: 20 },
      { x: 35, y: 45 },
      { x: 45, y: 80 },
    ],
  },
] as const satisfies ReadonlyArray<{ name: string; data: ReadonlyArray<{ x: number; y: number }> }>;

/**
 * Calendar days. Dates are pinned date-only strings AND the `range` is passed
 * explicitly in the fixtures: `range: "6m"/"12m"` is relative to TODAY
 * (CalendarHeatmap/types.ts), which would make output non-deterministic.
 */
export const CALENDAR_ROWS = [
  { date: "2026-01-05", value: 1 },
  { date: "2026-01-06", value: 3 },
  { date: "2026-01-09", value: 7 },
  { date: "2026-01-14", value: 2 },
  { date: "2026-01-21", value: 5 },
  { date: "2026-02-02", value: 4 },
  { date: "2026-02-17", value: 9 },
  { date: "2026-03-03", value: 6 },
] as const satisfies ReadonlyArray<{ date: string; value: number }>;

/** Explicit calendar window, so the grid never depends on the current date. */
export const CALENDAR_RANGE: [string, string] = ["2026-01-01", "2026-03-31"];

/** Flat numeric series for the three mini charts (MiniAreaChart/types.ts:1). */
export const MINI_SERIES = [4, 9, 6, 12, 8, 15, 11, 18] as const;

/**
 * Fixed palette used wherever a test pins colours. Keeping this explicit means
 * the recorded evidence does not move when the default theme palette changes —
 * palette-derived defaults are asserted separately, in the theme fixture.
 */
export const FIXED_PALETTE = ["#2563eb", "#16a34a", "#dc2626", "#d97706"] as const;

/** Viewport/canvas sizes recorded with every piece of evidence. */
export const SIZES = {
  wide: { width: 960, height: 420 },
  standard: { width: 640, height: 360 },
  narrow: { width: 320, height: 280 },
  square: { width: 400, height: 400 },
} as const;
