# Chart baseline — run report

## Baseline

| | |
|---|---|
| **Commit** | `9d73d17d2bbac565672a85e78f6eb7740cb0d9ca` |
| Commit subject | `Examples: keep chat history in localStorage, fix Eve imports (#1373)` |
| Branch | `claude/interesting-clarke-d5d4dd` |
| Package under test | `@openuidev/react-ui` v0.18.1, `packages/react-ui` (unmodified) |

## Environment

| Tool | Version | How it was established |
|---|---|---|
| OS | macOS (darwin 27.0.0), arm64 | `uname` |
| Node | v24.17.0 | `node -v` |
| pnpm | 10.33.0 | `pnpm -v` (matches `packageManager` in the root `package.json`) |
| vitest | 4.1.10 | `vitest --version` |
| vite | 6.4.3 | installed `vite/package.json` |
| react / react-dom | 19.2.4 | installed `react/package.json` |
| typescript | 5.9.3 | installed `typescript/package.json` |
| sass | 1.102.0 | installed `sass/package.json` |
| Browser | Chromium, Claude desktop built-in browser pane | — |

Two corrections to assumptions this work started from, both load-bearing:

1. **Storybook is 8.6.18, not 10.** `packages/react-ui/package.json` pins
   `storybook: ^8.5.3`; the catalog's `eslint-plugin-storybook: ^10.2.14` is a
   lint plugin, not the framework. Nothing here depends on Storybook, but a
   migration plan written around Storybook 10 APIs would be wrong.
2. **`jsdom` is not available to `packages/react-ui`.** It is in the workspace
   catalog and eight sibling packages declare it, but `react-ui` does not, so it
   is not resolvable there. This decided the whole harness design — see below.

## Setup process

```bash
pnpm install --frozen-lockfile     # from the repository root
```

The lockfile was unchanged by the install (`git diff --stat pnpm-lock.yaml` is
empty). `validation/` is not a pnpm workspace member, so this directory never
gets its own `node_modules`; both harnesses run through `react-ui`'s installed
toolchain via a config that lives here. **No shared config, root
`package.json`, `pnpm-workspace.yaml` or lockfile change was needed or made.**

## Commands

```bash
# Deterministic assertions — 138 tests, 6 files
pnpm --dir packages/react-ui exec vitest run \
  --config ../../validation/friend-chart-baseline/vitest.config.ts

# Browser fixture (screenshots + interactions) on http://localhost:5199/
pnpm --dir packages/react-ui exec vite \
  --config ../../validation/friend-chart-baseline/vite.config.ts
```

## Results

**138 assertions pass, 0 fail**, across:

| File | Tests | Covers |
|---|---|---|
| `tests/inventory.baseline.test.ts` | 5 | Registry matches the real export surface |
| `tests/default-render.baseline.test.tsx` | 59 | All 19 families render; container, marks, no degenerate paths, labels |
| `tests/empty-data.baseline.test.tsx` | 39 | All 19 with `data={[]}`; the placeholder split is snapshotted |
| `tests/geometry.baseline.test.tsx` | 5 | Pie arc angles, segment shares, scatter spacing, bar counts, y-scale |
| `tests/theme-responsive.baseline.test.tsx` | 6 | Theme markup identity, custom palette, size responsiveness |
| `tests/legend.baseline.test.tsx` | 24 | Legend contents, toggle affordance, axis-label coupling, a11y surface |

Browser evidence: 16 of 19 families show a tooltip carrying the exact fixture
values; 11 families' legend toggles hide and restore their series exactly;
Pie's legend breakpoint and Heatmap's container tracking measured across five
widths. Recorded in `evidence/browser/`.

### No baseline test failures

Every assertion here passes against unmodified legacy source. The defects in
`reports/DEFECTS.md` are recorded as measurements and reproductions rather than
as failing tests, deliberately: a red suite would obscure whether a future
migration broke something new.

The one exception is intentional — `tests/theme-responsive.baseline.test.tsx`
asserts that SSR output is *identical* between light and dark. That pins a
limitation, so if a migration ever starts emitting theme-dependent markup
server-side, the test fails and the change is noticed.

## Why `react-dom/server` rather than a DOM

`packages/react-ui` has no `jsdom` dependency and this ticket forbids adding
one, so there is no DOM test environment to use. The repo's own component tests
already work this way (`src/components/AgentInterface/__tests__/*.ssr.test.tsx`),
so this reuses an existing convention.

It works better than expected: all 19 families emit full, exact geometry
server-side, because `useContainerSize`
(`src/components/Charts/hooks/core/useContainerSize.ts:13-14`) short-circuits
measurement entirely when both `width` and `height` are numeric. Every family in
the registry is given numeric sizes for exactly that reason.

What it cannot do — and what the browser pass therefore covers — is computed
colour, container-driven layout, and any event.

## Screenshot approach, and its honest limitation

There is no Playwright and no screenshot harness anywhere in this repo, and
adding one is a dependency change this ticket forbids. So screenshots were
captured by driving a real browser against the fixture and saving the images,
at a recorded viewport (1280x900 emulated) with the theme set explicitly by URL.

Animations are settled from the **harness side only**: entrance animation is
already off by default (`isAnimationActive` defaults `false`), and the fixture
injects a `<style data-harness="freeze-motion">` zeroing transition and
animation durations. No product source was touched.

**The limitation:** these are reference images for a human to compare. Nothing
diffs them automatically, so they will not catch a subtle visual regression on
their own. The deterministic, diffable evidence is the recorded markup under
`evidence/ssr/` and the measurements under `evidence/browser/` — those are what
a reviewer should compare mechanically. Dark-mode images cover 5 of 19 families;
any other is one URL away.

## No standalone typecheck for the fixtures

There is no `tsconfig.json` here, and that is a deliberate omission rather than
an oversight.

Because `validation/` is not a workspace member, a tsconfig in this directory
has to redirect `react`, `react-dom` and `vitest` at
`packages/react-ui/node_modules` via `paths`. Those same overrides then apply to
the legacy sources the fixtures import, and bypass the normal resolution that
finds `@types/react` for them — so a full typecheck reports hundreds of
`implicitly has an 'any' type` errors inside `packages/react-ui/src`, none of
which are real. Making it work properly needs either a workspace entry or a
`node_modules` link here, and both are out of scope for this ticket.

The fixtures are still type-annotated throughout, and vitest/vite transpile and
execute every one of them on each run, so syntax and runtime behaviour are
exercised by the 138 passing assertions. What is *not* mechanically enforced is
static type correctness of the fixture code itself. If this directory is ever
promoted to a workspace package, add a tsconfig then.

## Determinism

- **Data**: every value in `fixtures/datasets.ts` is a literal. Nothing reads
  the clock or uses randomness. `CalendarHeatmap` is given an explicit
  `range` because its `"6m"`/`"12m"` presets are relative to *today*.
- **Layout**: numeric `width`/`height` bypass measurement entirely.
- **Markup**: React `useId` values leak into gradient and `clipPath` ids and
  shift with tree position, so they are normalised to `_R_ID_` before
  recording. Without that, wrapping a chart in one more provider rewrites every
  id and swamps a diff (see OBSERVATION-006).
- **Interactions**: the probe picks the visible data mark nearest the card's
  centre — deterministic, and verified identical across two consecutive runs.

## Scope compliance

- Only `validation/friend-chart-baseline/` was created or modified.
  `git status` shows no change anywhere else.
- `packages/react-ui` was read, never written.
- No dependency, shared config, `pnpm-workspace.yaml`, root `package.json` or
  lockfile change.
- `validation/friend-controls-baseline/` (the sibling ticket) was not touched.
- `.vite-cache/` is generated inside this directory and git-ignored here.
