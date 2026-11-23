# Coverage matrix

**Baseline SHA:** `9d73d17d2bbac565672a85e78f6eb7740cb0d9ca`

Legend:

- **Y** — covered by an assertion or recorded evidence in this directory.
- **N/A** — the family has no such feature in its public API; absence is correct
  behaviour, not a missing test.
- **UNTESTED** — the feature exists (or may exist) and this baseline does **not**
  establish it. These are real gaps, listed again at the bottom.

Two environments produced the evidence, and the split matters:

- **SSR** — `react-dom/server`, via `tests/*.baseline.test.tsx`. Deterministic
  and runnable in CI. Cannot observe computed colour, layout measurement, or any
  event.
- **Browser** — Chromium in the Claude desktop browser pane, via
  `fixtures/browser/`. Covers what SSR cannot. Results recorded under
  `evidence/browser/`.

## Per family

| Family | Default render | Empty data | Light/dark | Responsive | Legend | Tooltip | Legend toggle | Screenshot |
|---|---|---|---|---|---|---|---|---|
| AreaChart | Y (SSR) | Y placeholder | Y (browser) | Y (SSR size props) | Y | Y | Y | Y light+dark |
| AreaChartCondensed | Y (SSR) | Y placeholder | Y (browser) | Y (SSR size props) | Y | Y | Y | Y light |
| LineChart | Y (SSR) | Y placeholder | Y (browser) | Y (SSR size props) | Y | Y | Y | Y light |
| LineChartCondensed | Y (SSR) | Y placeholder | Y (browser) | Y (SSR size props) | Y | Y | Y | Y light |
| BarChart | Y (SSR) | Y placeholder | Y (browser) | Y (SSR size props) | Y | Y | Y | Y light+dark |
| BarChartCondensed | Y (SSR) | Y placeholder | Y (browser) | Y (SSR size props) | Y | Y | Y | Y light |
| HorizontalBarChart | Y (SSR) | Y placeholder | Y (browser) | **see DEFECT-001** | Y | Y | Y | Y light |
| PieChart | Y (SSR) | Y placeholder | Y (browser) | Y (browser, 400px breakpoint) | Y (browser only — empty in SSR) | Y | UNTESTED | Y light+dark |
| RadialChart | Y (SSR) | Y placeholder | Y (browser) | UNTESTED | Y (browser only — empty in SSR) | Y | UNTESTED | Y light |
| RadarChart | Y (SSR) | Y placeholder | Y (browser) | UNTESTED | Y | Y | Y | Y light+dark |
| ScatterChart | Y (SSR) | Y placeholder | Y (browser) | UNTESTED | Y | Y | Y | Y light |
| HeatmapChart | Y (SSR) | Y placeholder | Y (browser) | Y (browser, container-driven) | Y | Y | Y | Y light+dark |
| FunnelChart | Y (SSR) | Y placeholder | Y (browser) | UNTESTED | Y | Y | Y | Y light |
| SegmentedBar | Y (SSR) | Y placeholder | Y (browser) | UNTESTED | Y | Y | UNTESTED | Y light |
| SingleStackedBar | Y (SSR) | Y placeholder | Y (browser) | UNTESTED | Y | Y | UNTESTED | Y light |
| CalendarHeatmap | Y (SSR) | Y placeholder | Y (browser) | UNTESTED | N/A (scale key, not a series legend) | Y | N/A | Y light |
| MiniAreaChart | Y (SSR) | Y — empty `d=""` | Y (browser) | N/A (`size` only) | N/A | N/A | N/A | Y light |
| MiniBarChart | Y (SSR) | Y — empty `<svg>` | Y (browser) | N/A (`size` only) | N/A | N/A | N/A | Y light |
| MiniLineChart | Y (SSR) | Y — empty `d=""` | Y (browser) | N/A (`size` only) | N/A | N/A | N/A | Y light |

## What each column means

**Default render.** `tests/default-render.baseline.test.tsx` renders all 19 on
the deterministic datasets and records the markup under `evidence/ssr/`. It
asserts the family's container class, that it drew at least one mark (segments,
for the div-based families), and that no degenerate zero-area path was emitted.

**Empty data.** `tests/empty-data.baseline.test.tsx`, `data={[]}` for all 19.
The split is **not uniform**, and the snapshot in
`tests/__snapshots__/empty-data.baseline.test.tsx.snap` pins it: 16 families
render the shared `No data available` placeholder; the three Mini charts render
no placeholder at all, in three different ways — `MiniBarChart` emits a
completely empty `<svg>`, while `MiniAreaChart` and `MiniLineChart` emit paths
with an empty `d=""` attribute. See FINDING-003.

**Light/dark.** Covered in the **browser**, where computed colours are
observable: chrome tokens flip (`oklch(0.097 0 0)` light → `oklch(0.985 0
89.876)` dark) while series fills stay `rgb(33,150,243)` in both — the default
palette is not theme-derived. **SSR cannot cover this at all**: ThemeProvider
injects tokens from an effect, so server markup is byte-identical between modes.
`tests/theme-responsive.baseline.test.tsx` asserts that identity deliberately,
so the limitation is pinned rather than assumed.

**Responsive.** Two different things, kept apart:
- *Size props* (SSR): changing numeric `width`/`height` changes drawn geometry.
  Asserted for Area and Bar.
- *Container-driven* (browser): the real `ResizeObserver` path. Measured for
  PieChart's legend breakpoint (column below 400px, row from 400px — matches the
  documented behaviour exactly) and HeatmapChart following its container 1:1
  from 320px to 720px. Other families are **UNTESTED** here; the fixture pins
  numeric sizes, so they do not reflow in the main grid.

**Legend.** `tests/legend.baseline.test.tsx` asserts item labels and order,
that `legend={false}` removes the container, the documented coupling where
`legend={false}` also hides `xAxisLabel`/`yAxisLabel`, and the `cursor:pointer`
affordance. PieChart and RadialChart are called out separately: their stacked
legend is **empty in SSR** (it is filled from a store on an effect) and
populated in the browser — both states are asserted/recorded.

**Tooltip.** Browser only. 16 of 19 families show a tooltip whose text matches
the fixture data exactly, and all dismiss on pointer-out. The three Mini charts
have no tooltip in their public API, so N/A. Full texts in
`evidence/browser/interactions.json`.

**Legend toggle.** Browser only. Clicking an item hides that series (series-mark
count drops), dims the item to `opacity: 0.3`, and a second click restores the
original count exactly — verified for 11 families.

**Screenshot.** `evidence/screenshots/`. Grouped captures at a recorded viewport
(1280x900 emulated), light for all 19, dark for a representative five.

## Gaps — stated plainly

1. **Container-driven responsiveness for 10 families** (Radial, Radar, Scatter,
   Funnel, SegmentedBar, SingleStackedBar, CalendarHeatmap, and the three Mini
   charts). Only Pie and Heatmap were measured across widths. Everything else
   has size-prop evidence only.
2. **Legend toggle for PieChart/RadialChart** is UNTESTED. Their legend entries
   go through the `StackedLegend` store and the probe's selector does not match
   them. Their *tooltips* are covered.
3. **Legend toggle for SegmentedBar/SingleStackedBar** is UNTESTED: their
   segments are divs, so the SVG mark count cannot detect the change.
4. **Dark-mode screenshots cover 5 of 19 families** (Area, Bar, Pie, Heatmap,
   Radar). Dark *computed colours* were sampled across families, but the images
   are a subset. Reproduce any other with
   `?theme=dark&only=<Family>`.
5. **No real-input events.** The interaction probe dispatches synthetic
   `MouseEvent`s. They run the components' real handlers, scales and rendering,
   but cannot catch problems below the event layer — pointer capture, touch
   emulation, OS-level hit-testing. Two families (ScatterChart, SegmentedBar)
   were additionally checked by hand through the browser automation and agreed.
6. **No keyboard or screen-reader testing.** Only the static a11y surface is
   asserted (`role="img"` plus a non-empty `aria-label` on every family).
7. **No visual regression baseline.** Screenshots are reference images for a
   human to compare; nothing diffs them automatically. There is no screenshot
   harness in this repo and adding one would be a dependency change this ticket
   forbids.
8. **Print path untested.** Every family consults `usePrintContext` and disables
   animation when printing; none of that is exercised here.
9. **`isAnimationActive={true}` untested.** All evidence is captured with the
   default `false`. Entrance animations are therefore not characterised.
