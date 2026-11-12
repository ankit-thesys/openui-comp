# Chart baseline — `validation/friend-chart-baseline`

Independent, reproducible reference evidence for the **19 exported chart
components** of `@openuidev/react-ui`, captured against a pinned baseline so a
future migration can be compared fairly.

**Baseline SHA:** `9d73d17d2bbac565672a85e78f6eb7740cb0d9ca`

Nothing outside this directory is created or modified. `packages/react-ui` is
read-only here: defects are **recorded**, never fixed.

## Start here

| File | What it is |
|---|---|
| `reports/REPORT.md` | The run report: environment, versions, commands, results, failures, limitations |
| `reports/INVENTORY.md` | Source-linked inventory of every family and public type |
| `reports/COVERAGE-MATRIX.md` | Per-family coverage, with gaps marked explicitly |
| `reports/DEFECTS.md` | Baseline defects and observations, with reproductions |

## Setup

From the **repository root**, once:

```bash
pnpm install --frozen-lockfile
```

`validation/` is deliberately **not** a pnpm workspace member
(`pnpm-workspace.yaml` covers only `packages/*` and `docs/`), so this directory
has no `node_modules` of its own and none is created. Both harnesses below run
through `packages/react-ui`'s already-installed toolchain. No shared config, no
root `package.json` and no lockfile entry was changed to make this work.

## 1. Deterministic assertions (no browser)

From the repository root:

```bash
pnpm --dir packages/react-ui exec vitest run --config ../../validation/friend-chart-baseline/vitest.config.ts
```

138 assertions across 6 files. Re-records the markup evidence under
`evidence/ssr/` as a side effect, so a clean run leaves that directory
unchanged if behaviour has not moved.

These render through `react-dom/server`. That is not a stylistic choice:
`packages/react-ui` does not depend on `jsdom` (its sibling packages do), and
this ticket forbids adding dependencies, so **no DOM environment is available**.
The repo's own component tests use the same approach
(`src/components/AgentInterface/__tests__/*.ssr.test.tsx`).

Determinism comes from `useContainerSize`
(`hooks/core/useContainerSize.ts:13-14`), which returns `width`/`height`
verbatim when both are numeric — so a chart given numeric sizes needs no
measurement, no `ResizeObserver` and no effects to lay itself out. Entrance
animation is off by default (`isAnimationActive` defaults `false`) and effects
do not run during `renderToString`, so the recorded markup is the settled first
frame.

Run one file:

```bash
pnpm --dir packages/react-ui exec vitest run --config ../../validation/friend-chart-baseline/vitest.config.ts tests/geometry
```

## 2. Browser evidence (screenshots and interactions)

Start the fixture server from the repository root:

```bash
pnpm --dir packages/react-ui exec vite --config ../../validation/friend-chart-baseline/vite.config.ts
```

It serves `http://localhost:5199/`. Pages:

| URL | Purpose |
|---|---|
| `/?theme=light` | All 19 families |
| `/?theme=dark` | All 19, dark |
| `/?only=PieChart,BarChart` | Just these, in registry order |
| `/?state=empty` | Every family with `data={[]}` |
| `/?motion=on` | Keep CSS transitions (default: frozen) |
| `/responsive.html` | Container-driven layout across widths |
| `/repro-hbar-width.html` | DEFECT-001 reproduction |

Animations are settled from the **harness side only** — product source is
untouched. Entrance animation is already off by default; the fixture injects a
`<style data-harness="freeze-motion">` that zeroes transition and animation
durations so a hover screenshot is reproducible.

### Interaction probe

With a page open, in the browser console:

```js
await window.__chartProbe()
```

It walks every family, hovers one data mark, records the tooltip text and
whether it dismissed, then toggles the first legend item and checks the series
marks drop and restore. Source: `fixtures/browser/interactions.ts`. Results as
captured: `evidence/browser/interactions.json`. Two consecutive runs produce
identical results.

The probe dispatches **synthetic** `MouseEvent`s. They exercise the real
handlers, scales and rendering, but are not a real input device — see the gaps
in `reports/COVERAGE-MATRIX.md`.

## Layout

```
fixtures/
  datasets.ts          deterministic synthetic data (no clock, no randomness)
  families.tsx         the single registry of all 19 families — shared by BOTH harnesses
  ssr.tsx              render + record helper, with useId normalisation
  browser/
    index.html/main.tsx     the grid fixture
    interactions.ts         window.__chartProbe
    responsive.html/.tsx    container-driven layout cases
    repro-hbar-width.*      DEFECT-001 reproduction
tests/                 vitest assertions (*.baseline.test.ts[x])
evidence/
  ssr/                 recorded markup per family and per case
  browser/             interaction + responsive/theme measurements (JSON)
  screenshots/         captured images
reports/               inventory, coverage matrix, run report, defects
```

`fixtures/families.tsx` is the point of the design: the screenshots and the
assertions read the same registry, so they are provably about the same props on
the same data.

## Conventions

- Fixtures import the **public entry point** (`components/Charts`) only, as an
  external consumer would — never a family's internal parts.
- Assertions are about **observable output**: class names, drawn geometry,
  rendered text, computed colour. Never internal state or component structure.
- Recorded numbers are derived from the fixture data independently wherever
  possible (pie arc angles, segment shares, scatter spacing), so the tests
  check the component rather than echo it.
