# Baseline findings

**Baseline SHA:** `9d73d17d2bbac565672a85e78f6eb7740cb0d9ca`

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
