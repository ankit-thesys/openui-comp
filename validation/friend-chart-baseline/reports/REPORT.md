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
# Deterministic assertions — 176 tests, 7 files
pnpm --dir packages/react-ui exec vitest run \
  --config ../../validation/friend-chart-baseline/vitest.config.ts

# Browser fixture (screenshots + interactions) on http://localhost:5199/
pnpm --dir packages/react-ui exec vite \
  --config ../../validation/friend-chart-baseline/vite.config.ts
```

## Results

**176 assertions pass, 0 fail**, across:

| File | Tests | Covers |
|---|---|---|
| `tests/inventory.baseline.test.ts` | 5 | Registry matches the real export surface |
| `tests/default-render.baseline.test.tsx` | 59 | All 19 families render; container, marks, no degenerate paths, labels |
| `tests/empty-data.baseline.test.tsx` | 39 | All 19 with `data={[]}`; the placeholder split is snapshotted |
| `tests/geometry.baseline.test.tsx` | 5 | Pie arc angles, segment shares, scatter spacing, bar counts, y-scale |
| `tests/theme-responsive.baseline.test.tsx` | 6 | Theme markup identity, custom palette, size responsiveness |
| `tests/legend.baseline.test.tsx` | 24 | Legend contents, toggle affordance, axis-label coupling, a11y surface |
| `tests/size-props.baseline.test.tsx` | 38 | Explicit size-prop responsiveness across all 19 families |

### Browser runner

```bash
node validation/friend-chart-baseline/browser/run.mjs
```

One command: spawns the fixture server, launches headless Chrome over the
DevTools Protocol, drives it with **real** mouse and keyboard input, asserts,
writes `evidence/browser/browser-run.json` plus 19 dark reference images, and
exits non-zero with an actionable summary on any failure or missing scenario.

Latest run — **40 verified, 5 unsupported, 0 failed**:

| Group | Result |
|---|---|
| `trusted-input` | verified — `event.isTrusted === true` |
| `legend-toggle` | Pie + Radial **verified**; SegmentedBar + SingleStackedBar **unsupported** (source-cited) |
| `hover-highlight` | verified for both segmented-bar families |
| `container-resize` | 19/19 accounted for — 16 verified, 3 unsupported with cited mechanisms |
| `dark-reference` | 19/19 images captured |

Zero new dependencies. There is no Playwright, Puppeteer, `@vitest/browser` or
webdriverio in this workspace's lockfile and this ticket forbids unproposed
dependency changes; Node 24's global `WebSocket` plus CDP's JSON-RPC is enough
(`browser/cdp.mjs`, ~200 lines).

**Why real input matters.** PR #22 dispatched synthetic `MouseEvent`s from
inside the page. A synthetic event dispatched on an element Claude selected
cannot miss — which means it also cannot *detect* a wrong or overlapped target.
That is exactly how PR #22 mis-recorded the Pie/Radial legend toggles as
untested: it searched for `.openui-chart-legend-item`, which those families do
not render. CDP input goes through the browser's own hit-testing, so a
mis-targeted click fails visibly instead of silently.

**Failure behaviour is itself verified.** With an unreachable fixture server the
runner prints `RUNNER ERROR` and exits 1; with per-family failures it lists each
one and exits 1. Both were exercised during development.

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

## Typechecking

A directory-local `tsconfig.json` **does** work, and is the supported way to
typecheck this directory:

```bash
pnpm --dir packages/react-ui exec tsc --noEmit \
  -p ../../validation/friend-chart-baseline/tsconfig.json
```

It exits 0, with the legacy `packages/react-ui` sources in the program and zero
errors from them.

PR #22 claimed this was impossible. That was wrong, and the error is worth
recording: its `paths` pointed `react` at the **runtime** package, which ships
no declarations, so every importer — the legacy sources included — failed to
find types, producing hundreds of spurious `implicitly has an 'any' type`
errors. Mapping to **`@types/react`** resolves cleanly for both this
directory's files and theirs. See OBSERVATION-010 in `reports/DEFECTS.md`.

The 32 errors the working config did surface were all genuine issues in this
directory's own code — unchecked index access and regex captures typed
`string | undefined` under the repo's strict settings — and are fixed. The
`required()` helper in `fixtures/ssr.tsx` narrows those cases while failing
loudly at the missing value, rather than `!`-asserting and surfacing a confusing
`NaN` three lines later.

**What "it runs" does and does not prove.** Vitest executes every test file, so
those are genuinely exercised. A Vite dev server does **not**: it compiles
modules on demand, so a fixture entry nobody navigates to is never built, and
serving the fixture is not evidence that unvisited entries even parse. Neither
tool typechecks — both strip types. Static correctness comes only from the `tsc`
command above.

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
