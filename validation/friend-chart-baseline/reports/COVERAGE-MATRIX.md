# Coverage matrix

**Baseline SHA:** `9d73d17d2bbac565672a85e78f6eb7740cb0d9ca`
**Families:** 19 exported chart components. Every table below accounts for all 19.

Legend:

- **verified** — exercised and asserted.
- **unsupported** — the family does not implement it; a source citation says so.
  Not a gap.
- **n/a** — the feature does not exist in that family's public API.
- **UNTESTED** — a real gap. Listed again at the bottom.

Three environments produced this evidence, and which one a row came from matters:

| Harness | What it is | What it cannot do |
|---|---|---|
| **SSR** | `react-dom/server` via `tests/*.baseline.test.tsx` (176 assertions across 7 files) | no computed colour, no measurement, no events |
| **Browser** | headless Chrome over CDP via `browser/run.mjs`, with **real** mouse/keyboard (`event.isTrusted === true`) | no automated image comparison |
| **Source** | cited code, for behaviour that does not exist | — |

## 1. Rendering and data

| Family | Default render | Empty data | Dark reference image |
|---|---|---|---|
| AreaChart | verified (SSR) | verified — placeholder | verified |
| AreaChartCondensed | verified (SSR) | verified — placeholder | verified |
| LineChart | verified (SSR) | verified — placeholder | verified |
| LineChartCondensed | verified (SSR) | verified — placeholder | verified |
| BarChart | verified (SSR) | verified — placeholder | verified |
| BarChartCondensed | verified (SSR) | verified — placeholder | verified |
| HorizontalBarChart | verified (SSR) | verified — placeholder | verified |
| PieChart | verified (SSR) | verified — placeholder | verified |
| RadialChart | verified (SSR) | verified — placeholder | verified |
| RadarChart | verified (SSR) | verified — placeholder | verified |
| ScatterChart | verified (SSR) | verified — placeholder | verified |
| HeatmapChart | verified (SSR) | verified — placeholder | verified |
| FunnelChart | verified (SSR) | verified — placeholder | verified |
| SegmentedBar | verified (SSR) | verified — placeholder | verified |
| SingleStackedBar | verified (SSR) | verified — placeholder | verified |
| CalendarHeatmap | verified (SSR) | verified — placeholder | verified |
| MiniAreaChart | verified (SSR) | verified — empty `d=""` | verified |
| MiniBarChart | verified (SSR) | verified — empty `<svg>` | verified |
| MiniLineChart | verified (SSR) | verified — empty `d=""` | verified |

**19/19 dark reference images captured**, one per family, at 1280x900 with
`prefers-color-scheme: dark` emulated. They are **reference images only** — no
automated comparison is implemented, and `browser-run.json` repeats that note on
every entry. A family that rendered no marks would be recorded as a *failure*
with no image, not as coverage; none did.

## 2. Sizing — two different mechanisms, never conflated

This is the correction the #24 review asked for. PR #22 marked four families as
"size-prop verified" when the dimension-changing test only covered AreaChart and
BarChart. Both columns below are now driven across the whole registry.

| Mechanism | What is varied | Harness | Where |
|---|---|---|---|
| **Size props** | numeric `width`/`height` (or mini `size`) passed in | SSR | `tests/size-props.baseline.test.tsx` |
| **Container resize** | the surrounding box; the chart measures it via `ResizeObserver` | Browser | `browser/run.mjs` |

They are genuinely different code paths: `useContainerSize`
(`hooks/core/useContainerSize.ts:13-14`) returns numeric props verbatim and
never measures, so a size-prop pass says nothing about container behaviour.

| Family | Size props (SSR) | Container resize (browser) |
|---|---|---|
| AreaChart | verified | verified |
| AreaChartCondensed | verified | verified |
| LineChart | verified | verified |
| LineChartCondensed | verified | verified |
| BarChart | verified | verified |
| BarChartCondensed | verified | verified |
| HorizontalBarChart | verified | verified |
| PieChart | **unsupported** — stacked legend (see below) | **unsupported** — stacked legend (see below) |
| RadialChart | **unsupported** — stacked legend | **unsupported** — stacked legend |
| RadarChart | verified | verified |
| ScatterChart | verified | verified |
| HeatmapChart | verified | verified |
| FunnelChart | verified | verified |
| SegmentedBar | n/a — no size props | verified |
| SingleStackedBar | n/a — no size props | verified |
| CalendarHeatmap | verified | verified |
| MiniAreaChart | verified (`size`) | verified |
| MiniBarChart | verified (`size`) | **unsupported** — fixed marks (see below) |
| MiniLineChart | verified (`size`) | verified |

**Counts, consistent with `evidence/browser/browser-run.json`:**

- Size props: **15 verified**, 2 unsupported (Pie, Radial), 2 n/a
  (SegmentedBar, SingleStackedBar) = 19.
- Container resize: **16 verified**, 3 unsupported (Pie, Radial, MiniBarChart) = 19.

### The three "unsupported" sizing results, with their mechanisms

None of these is "the chart ignores its box". Each was isolated to a specific
cause, and in two cases the same family demonstrably *does* scale once that
cause is removed:

- **PieChart / RadialChart** default to `legendVariant="stacked"`. That wrapper
  caps the chart column, so the drawn pie stays 270px (Pie) / 218px (Radial) at
  both container sizes. The identical chart with `legendVariant="default"`
  scales **256 → 450** and **207 → 365** — recorded as diagnostic cases
  `PieChart__defaultLegend` / `RadialChart__defaultLegend` in the same run. The
  same wrapper makes them size-invariant in SSR, asserted in
  `tests/size-props.baseline.test.tsx`.
- **MiniBarChart**: its `<svg>` *does* follow the container (360 → 900), but
  `MINI_BAR_WIDTH = 8` and `MINI_BAR_SPACING = 10` are fixed pixels
  (`shared/mini/miniChartUtils.ts:35-36`) and `miniBarsLeftPadding` right-aligns
  the bars (`:50-51`), so extra width becomes empty space and the drawn bars stay
  132px. Narrowing instead drops the oldest bars (`recentBarsThatFit`, `:41-47`).

### Why both container dimensions are varied

The container sweep varies **width and height together** (360x300 → 900x760). A
width-only sweep is a false negative for the square families: RadarChart draws
173px wide at 360x300 and 303px at 900x760, so holding height at 300 would have
reported it as unresponsive. An earlier iteration of this suite did exactly that.

## 3. Interactions

All browser rows use **real** CDP input, not synthetic `MouseEvent` dispatch.
`trusted-input` is asserted as a scenario in its own right: the page observes
`event.isTrusted === true`. This matters because a synthetic event dispatched on
an element cannot miss, so it also cannot detect a mis-targeted or overlapped
control — which is precisely how PR #22 mis-recorded the Pie/Radial toggles.

| Family | Tooltip | Legend toggle | Hover highlight |
|---|---|---|---|
| AreaChart | verified | verified | — |
| AreaChartCondensed | verified | verified | — |
| LineChart | verified | verified | — |
| LineChartCondensed | verified | verified | — |
| BarChart | verified | verified | — |
| BarChartCondensed | verified | verified | — |
| HorizontalBarChart | verified | verified | — |
| PieChart | verified | **verified** (was UNTESTED in #22) | — |
| RadialChart | verified | **verified** (was UNTESTED in #22) | — |
| RadarChart | verified | verified | — |
| ScatterChart | verified | verified | — |
| HeatmapChart | verified | verified | — |
| FunnelChart | verified | verified | — |
| SegmentedBar | verified | **unsupported** (was UNTESTED in #22) | **verified** |
| SingleStackedBar | verified | **unsupported** (was UNTESTED in #22) | **verified** |
| CalendarHeatmap | verified | n/a — scale key, not a series legend | — |
| MiniAreaChart | n/a | n/a | — |
| MiniBarChart | n/a | n/a | — |
| MiniLineChart | n/a | n/a | — |

**All four previously-untested legend-toggle families are now resolved:**

- **PieChart / RadialChart — verified.** Their legend is published to the shared
  store and rendered as `.openui-stacked-legend__item`, not the
  `.openui-chart-legend-item` the cartesian families use. PR #22 looked for the
  latter, found nothing, and recorded "untested". A real click on the correct row
  hides the series (visible filled paths 4 → 3), dims the row to `opacity: 0.3`,
  and a second click restores the snapshot **exactly**.
- **SegmentedBar / SingleStackedBar — unsupported, by design.**
  `SegmentedBar.tsx:28` says: *"no legend visibility toggle (openui only
  hover-highlights)"*, and `DefaultLegend` is rendered without `onItemClick` or
  `hiddenSeries` (0 occurrences in that file), so no toggle handler exists. The
  negative is demonstrated rather than assumed: a real click lands on the
  measured centre of a real legend row and nothing observable changes. The
  interaction they *do* support — hover highlight — is separately **verified**,
  including restoration on pointer-out.

## 4. Gaps — the remaining real ones

1. **No automated image comparison.** The 19 dark references and the light
   screenshots are reference images for a human. Nothing diffs them, so they
   cannot catch a subtle visual regression on their own. A screenshot-diff
   harness would be a dependency change this ticket forbids. The mechanically
   comparable evidence is `evidence/ssr/` markup and `evidence/browser/*.json`.
2. **Light reference images are grouped, not per-family.** Dark is 19/19
   individually; light is 8 grouped captures from PR #22, retained as
   superseded-but-valid evidence. Any single family: `?theme=light&only=<Family>`.
3. **Keyboard interaction is not exercised.** `Input.dispatchKeyEvent` is
   implemented and verified trusted in `browser/cdp.mjs`, but no chart scenario
   uses it — none of these families documents keyboard-operable controls, and
   asserting an expectation that the source does not make would be inventing one.
4. **No accessibility certification.** Only a static surface check: every family
   exposes `role="img"` with a non-empty `aria-label`. No screen-reader, focus
   order, or contrast verification was performed, and none is claimed.
5. **No SSR-hydration or performance claims.** Charts are rendered with
   `renderToString` for deterministic markup; no hydration round-trip, and no
   timing or memory measurement was done.
6. **Print path untested.** Every family consults `usePrintContext` and disables
   animation when printing; not exercised.
7. **`isAnimationActive={true}` untested.** All evidence is captured with the
   default `false`, so entrance animations are not characterised.
8. **Tooltip coverage is from the PR #22 synthetic-event sweep** for the 13
   cartesian/polar families. The four families #24 called out were re-done with
   real input; the rest were not re-run through CDP. Their recorded tooltip
   texts match the fixture data exactly, but they carry the weaker evidence.
