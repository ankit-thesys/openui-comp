# Baseline findings

**Baseline SHA:** `9d73d17d2bbac565672a85e78f6eb7740cb0d9ca`

> **Provenance.** DEFECT-001, DEFECT-002, FINDING-003 and OBSERVATION-004/005/006
> were established in PR #22 against the same baseline SHA and are **unchanged**
> here. FINDING-007 onwards were added by the #24 follow-up. Nothing earlier was
> re-litigated, softened or deleted: where #24 produced better evidence for an
> existing entry, it is appended to that entry rather than replacing it.

These are **recorded, not fixed**. `packages/react-ui` is read-only for this
ticket, and a failing legacy behaviour is evidence for the migration reviewer,
not a bug to patch here. Nothing in `packages/react-ui` was modified — see
`git status`.

Each entry states what was measured, so a reader can disagree with the
interpretation without having to re-derive the numbers.

---

## DEFECT-001 — `HorizontalBarChart` ignores a numeric `width` for its box, but uses it for its scale

**Severity:** medium — silent content overflow in common layouts.
**Affects:** `HorizontalBarChart` only (and `BarChart` with
`orientation="horizontal"`, the same component).

### What happens

Given `width={640}`, the component computes its value scale for 640px but never
applies 640px to its container. Its drawing `<svg>` is sized `width="100%"`
(`src/components/Charts/BarChart/parts/HorizontalBarChartImpl.tsx:141,181`), so
in any parent that does not itself supply the width, the bars and the x-axis are
laid out for 640px inside a box of a different size and spill out of it. There
is no scrollbar and nothing is clipped — the content simply escapes the
component's own bounds and can overlap whatever sits next to it.

### Root cause

`src/components/Charts/utils/buildContainerStyle.ts:7-8`:

```ts
if (typeof fixedWidth === "string") s["width"] = fixedWidth;
if (typeof height === "string") s["height"] = height;
```

Only **string** sizes become CSS. A numeric `width` still reaches
`useContainerSize`, which returns it verbatim as the measured width
(`src/components/Charts/hooks/core/useContainerSize.ts:13-42`), so the scale is
built for 640 while the box is left to CSS. For the other families this is
harmless, because their SVGs carry explicit pixel widths. `HorizontalBarChartImpl`
is the only component in `src/components/Charts/` that uses `width="100%"`.

### Reproduction

`fixtures/browser/repro-hbar-width.tsx`, served at `/repro-hbar-width.html`.
Three cases, same data, same `640` width value:

| Case | `width` | Parent | Container CSS width | Container box | SVG box | Bars overflow box by |
|---|---|---|---|---|---|---|
| A | `640` (number) | `inline-block` | **none** | 340px | 300px | **+256px** |
| B | `"640px"` (string) | `inline-block` | `640px` | 640px | 600px | −79px (fits) |
| C | `640` (number) | `block`, `width:640` | **none** | 640px | 600px | −44px (fits) |

The x-axis ticks make the mismatch explicit. In case A they run from x=22 to
x=638 — a 640px-wide axis — inside a 340px box. Case C produces the **identical**
tick geometry (22…638), which shows the scale is built from the prop regardless
of the box; it only looks correct because the parent happens to supply 640px.
Case B's ticks run 22…598, following the box it was actually given.

Screenshot: `evidence/screenshots/DEFECT-001-hbar-numeric-width.jpg`.
Also visible in `evidence/screenshots/light-bar-horizontalbar.jpg`, where the
chart is given `width={640}` in a shrink-to-fit card.

### Why it matters for the migration

`width` is typed `number | string` on `BaseChartProps` with no hint that the two
behave differently. Any consumer in a flex item, a grid cell, an inline-block or
a narrow parent gets a silently broken chart. A reviewer comparing a new
implementation should decide deliberately whether to keep this.

---

## DEFECT-002 — `PieChart` can exceed or overflow a numeric `height`, contradicting the documented `fitLegendInHeight`

**Severity:** low — contradicts documentation; the rendering stays legible.
**Affects:** `PieChart` (and `RadialChart`, which shares the orchestrator).

### What happens

`BaseChartProps.fitLegendInHeight` documents (`types/common.ts:51-53`): *"When
true, legend height is subtracted from container height so chart + legend fit
within specified dimensions. Defaults to true when `height` is set."*

With `height={240}` that does not hold:

| `width` | Legend layout | Rendered container height | Pie drawn height | Content past container bottom |
|---|---|---|---|---|
| 320 | column | 240 | 270 | **+45px** |
| 380 | column | 240 | 270 | **+45px** |
| 400 | row | **296** | 171 | fits |
| 560 | row | **296** | 243 | fits |
| 720 | row | **296** | 270 | fits |

So at narrow widths the content runs 45px past the box, and at 400px and above
the component simply renders 296px tall when it was asked for 240px.

### Root cause

`src/components/Charts/hooks/polar/useCategoricalChartOrchestrator.ts:85-91`:

```ts
const legendDeduction = showLegend && shouldFitLegend ? legendHeight : 0;
const availableHeight = (containerHeight || 300) - legendDeduction;
const chartSize = Math.max(
  minChartSize,
  Math.min(maxChartSize, availableWidth, isSemiCircular ? availableHeight * 2 : availableHeight),
);
```

`minChartSize` defaults to 150 (`PieChart.tsx:61`). At width 320 the measured
legend is 128px tall, so `availableHeight = 240 - 128 = 112`; the inner `Math.min`
yields 112, and `Math.max(150, 112)` floors it back to **150**. The floor wins
over the requested height, which is where the overflow comes from.

### Interpretation

The floor looks deliberate — shrinking a pie below 150px would make it
unreadable, and overflowing is friendlier than rendering something illegible.
The defect is the **mismatch with the documented contract**, so the right fix is
most likely to the documentation (or a note that `height` is a target the chart
will not honour below `minChartSize` + legend), not to the clamp. Flagging it so
a migration makes that call on purpose rather than by accident.

### Reproduction

`fixtures/browser/responsive.tsx` (`/responsive.html`). Measurements recorded in
`evidence/browser/responsive-and-theme.json` under `pieChartHeightOverflow`.

---

## FINDING-003 — the three Mini charts have three different empty-data representations, and none matches the other 16 families

**Severity:** low — an inconsistency, not a failure.

With `data={[]}`:

- 16 families render the shared placeholder `No data available`.
- `MiniBarChart` renders an empty `<svg>` with no children.
- `MiniAreaChart` renders an area path and a line path, both with `d=""`, plus a
  `<linearGradient>` def.
- `MiniLineChart` renders a line path with `d=""`.

`d=""` is valid SVG and draws nothing, so nothing is broken for a user. But a
consumer cannot detect "no data" uniformly, and three sibling components chose
three different representations. Pinned by the snapshot in
`tests/__snapshots__/empty-data.baseline.test.tsx.snap`, so a migration that
changes which side a family falls on will fail the test rather than drift.

---

## OBSERVATION-004 — tight y-domain draws data above the last gridline

**Not a defect.** Recorded because it looks like clipping and is not.

`AreaChart` on the fixture data stacks to 605 (Feb: 305+200+100). The y-axis
emits labelled ticks at 0…600 by 100, so the top of the Feb stack is drawn
**above** the highest gridline. Reconstructing the scale from two ticks and
mapping the topmost drawn pixel back gives exactly 605.0 — the domain covers the
data and nothing is cut off. d3 simply stops emitting round ticks at 600.
Asserted in `tests/geometry.baseline.test.tsx`.

---

## OBSERVATION-005 — `ThemeProvider` emits tokens but paints no surface

**Not a defect.** Consumer responsibility, recorded because it bit this fixture.

`<ThemeProvider mode="dark">` sets CSS custom properties on its selector
(`body` by default) and nothing else. It does not set a page background. A
consumer that does not supply one gets near-white axis and legend text on the
browser's default white page — invisible. The first dark screenshot run here
produced exactly that. The fixture now sets
`background: var(--openui-background)` (`fixtures/browser/main.tsx`), which is
what a real consumer must also do.

---

## OBSERVATION-006 — React `useId` values leak into rendered markup

**Not a defect**, but it affects how baseline evidence should be compared.

Gradient and `clipPath` ids embed React's `useId` output (`grad-d3ac-_R_1_-tk-0`,
`clip-d3ac-_R_0_`). Those values depend on the component's position in the render
tree, so merely wrapping a chart in one more provider shifts every id — wrapping
`AreaChart` in `ThemeProvider` was the *only* difference between two otherwise
byte-identical SSR renders. Any diff of recorded markup must normalise them or
it drowns in meaningless churn. `fixtures/ssr.tsx` normalises them to `_R_ID_`
before recording.

---

## FINDING-007 — Pie and Radial do not scale while their default stacked legend is in place

**Severity:** low–medium — affects every default-configuration Pie/Radial in a
resizable layout.
**Affects:** `PieChart`, `RadialChart`.
**Found:** #24 follow-up. Independently reproduced in two harnesses.

### What happens

Both families default to `legendVariant="stacked"` (`PieChart/types.ts`). With
that default, the drawn chart does not grow when its space grows — in **either**
sizing mechanism:

| Case | Small | Large | Grew? |
|---|---|---|---|
| Container resize, `legendVariant="stacked"` (default) — Pie | 270px @ 360x300 | 270px @ 900x760 | no |
| Container resize, `legendVariant="default"` — Pie | 256px | **450px** | yes |
| Container resize, `legendVariant="stacked"` (default) — Radial | 218px | 218px | no |
| Container resize, `legendVariant="default"` — Radial | 207px | **365px** | yes |
| Size props in SSR, stacked (default) — Pie/Radial | identical at 320x280 and 960x420 | | no |
| Size props in SSR, `legendVariant="default"` — Pie | 126 | **189** | yes |

The `legendVariant="default"` rows are what make this a finding about the
**wrapper** rather than about the chart: the identical component, on identical
data, in an identical box, scales correctly once the stacked legend is not in
the way.

### Mechanism

`hooks/polar/useCategoricalChartOrchestrator.ts:85-91` sizes the chart from
`Math.min(maxChartSize, availableWidth, availableHeight)`. Under the stacked
legend the chart column's height stops tracking the container, so
`availableHeight` plateaus and the whole expression plateaus with it. Measured
directly: at a 900x760 container the wrapper is 900x760 while the chart column
is 440x**300** and the svg 300x300.

### Evidence

`evidence/browser/browser-run.json` → `container-resize/PieChart` and
`/RadialChart`, each carrying its `diagnostic` block with the
`legendVariant="default"` comparison. SSR side:
`tests/size-props.baseline.test.tsx`, which asserts both the invariance and the
default-legend scaling as separate facts.

### Note for the migration

Recorded as **behaviour**, not as a demand. Whether a new implementation should
let the stacked legend cap the chart is a design decision; this only ensures it
is made deliberately.

---

## FINDING-008 — MiniBarChart's canvas is responsive but its bars are fixed-size

**Severity:** low — by design, and documented in source.
**Affects:** `MiniBarChart`.

The `<svg>` follows its container exactly (360 → 900 px), but the drawn bars
stay 132px wide at both sizes. `MINI_BAR_WIDTH = 8` and `MINI_BAR_SPACING = 10`
are fixed pixels (`shared/mini/miniChartUtils.ts:35-36`) and `miniBarsLeftPadding`
right-aligns the row (`:50-51`), so extra width becomes empty space rather than
wider bars. Narrowing does not shrink them either — `recentBarsThatFit`
(`:41-47`) drops the oldest bars instead.

`MiniAreaChart` and `MiniLineChart` do **not** behave this way: both draw a
continuous path across the full width and scale normally (360 → 900). So this is
specific to the bar variant, and worth knowing before a migration "fixes" it
into inconsistency with its own siblings.

Recorded as `container-resize/MiniBarChart` with `kind: "fixed-marks"`.

---

## FINDING-009 — SegmentedBar and SingleStackedBar have no legend visibility toggle

**Severity:** none — this is correct, documented behaviour. Recorded because
PR #22 listed it as an untested gap, which implied a feature that does not exist.

`SegmentedBar.tsx:28` states plainly: *"no legend visibility toggle (openui only
hover-highlights)"*. `DefaultLegend` accepts `onItemClick` and `hiddenSeries`,
but SegmentedBar renders it without either — 0 occurrences of both identifiers
in the whole file — so there is no handler for a click to reach.

Demonstrated rather than assumed: the runner performs a **real** click at the
measured centre of a real legend row and records that nothing observable
changes. The behaviour that *is* supported — hover highlight, including
restoration on pointer-out — is separately verified for both families.

This is the distinction the #24 ticket asked for: documented-unsupported, with
source evidence, instead of an invented expectation.

---

## OBSERVATION-010 — PR #22's "a local tsconfig is not possible here" was wrong

**Not a product finding.** A correction to this directory's own earlier claim,
kept because the reasoning is a trap worth not repeating.

PR #22 reported that a directory-local `tsconfig.json` could not work, having
observed hundreds of `implicitly has an 'any' type` errors inside
`packages/react-ui` whenever `paths` redirected `react` at
`packages/react-ui/node_modules/react`.

The diagnosis was wrong. The runtime `react` package ships **no declarations**,
so pointing `paths` at it makes every importer — including the legacy sources —
fail to find types. Mapping to **`@types/react`** instead resolves cleanly:

```bash
pnpm --dir packages/react-ui exec tsc --noEmit \
  -p ../../validation/friend-chart-baseline/tsconfig.json   # exits 0
```

The config now typechecks every fixture and test in this directory, with the
legacy sources in the program and **zero** errors from them. The 32 errors it
did surface were all genuine issues in this directory's own code (unchecked
index access, regex captures typed `string | undefined`) and have been fixed —
see `fixtures/ssr.tsx`'s `required()` helper, which fails loudly at the missing
value instead of propagating a `NaN`.

The related claim that "vite/vitest transpile and execute every fixture" is also
softened in `reports/REPORT.md`: a dev server only compiles what is actually
requested, so serving a page is not a typecheck of the files it never loads.
