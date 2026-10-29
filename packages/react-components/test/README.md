# react-components tests

Tests exercise the **built** package through its public exports only, the way a consumer uses it. Build first:

```bash
pnpm --filter @openuidev/react-components build
```

## Unit tests (Node, vitest)

`test/unit/**/*.test.{ts,tsx}` import `@openuidev/react-components` and server-render components.

```bash
pnpm --filter @openuidev/react-components test
```

## Browser tests (Chromium, Playwright)

`test/browser/*.spec.ts` load fixture apps in Chromium and assert what the page shows.

- `test/browser/fixtures/<name>.tsx` is a small app that imports `@openuidev/react-components` and renders into `#root`.
- Playwright's global setup (`build-fixtures.ts`) bundles each fixture with tsdown, as a consumer's bundler would, into `test/browser/.fixtures/` (gitignored). CSS imports become empty modules there; no fixture renders math, which is the only package code that imports a stylesheet.
- `serve.mjs` serves `/<name>.html` (an empty page that loads `/<name>.js`) on port 5370 (override with `OPENUI_TEST_PORT` when several worktrees run browser tests at once). Playwright starts it.

Install Chromium once, then run:

```bash
pnpm --filter @openuidev/react-components exec playwright install chromium
pnpm --filter @openuidev/react-components test:browser
```

To add a browser test, add a fixture that imports `openui-under-test` (aliased to the built package), add it to `fixtures` in `build-fixtures.ts`, and open `/<name>.html` from the spec. Query parameters build the static `<head>`, all loaded before the fixture script:

- `?css=<text>` adds a consumer stylesheet.
- `?sheet=<name>` links `fixtures/<name>.css`.
- `?recipe=<layer order>` starts `<head>` with the layer-mode recipe: `<style>@layer <layer order>;</style><style id="_goober"> </style>`.

`fixtures/tailwind33.css`, `tailwind34.css` and `tailwind4.css` are unmodified Tailwind 3.3.7, 3.4.17 and 4.1.11 CLI output (`@tailwind base/components/utilities` for 3, `@import "tailwindcss"` for 4) with `bg-red-500` as the only source (plus `!bg-red-500` for 4), checked in so the tests need no Tailwind dependency. Regenerate them the same way if the tests need more utilities.

## Benches

`bench.*.spec.ts` are the acceptance benches from the earlier out-of-repo harness, plus the lab's
override and Tailwind cases.

- **Bench app** (`fixtures/bench-app.tsx`): Select, Accordion, Tabs, TooltipWrapper, DatePicker,
  Switch/Checkbox/Radio, Slider, Carousel, theme probes, a nested ThemeProvider and every component
  that renders with no props. It takes a package namespace, so the same tree runs against this
  package and against the workspace's built `@openuidev/react-ui`, imported by path (react-ui is
  not a dependency; build it first). `fixtures/bench-server.tsx`, bundled for Node by
  `build-fixtures.ts`, server-renders it; `bench.tsx` and `bench-react-ui.tsx` hydrate it. The Node
  bundle exists because Playwright compiles JSX in spec files for component testing.
  - `bench.hydration`: no mismatch, caught/uncaught or render error, light and dark, both packages.
  - `bench.interactions`: mouse and keyboard on the interactive components, both packages.
  - `bench.theme`: mode round trip, dark first paint, portalled Select content, nested provider.
  - `bench.react-ui-parity`: the theme observations match react-ui's computed styles. Class names
    may differ; computed styles may not.
- **Migrated components**: the contract test's `test/unit/contract/components.tsx` list. The
  `elements` fixture (`/migrated-<folder>.html?component=<folder>`) imports that list and renders a
  component's elements client-side exactly as written; its browser bundle gets the list's stable
  names, read from the built package at fixture build time, instead of `node:fs`.
  `fixtures/migrated-server.tsx` gives specs each component's own stable classes. A component
  joins these benches when it joins that list.
  - `bench.overrides`: consumer CSS on every stable class, loaded before or after the library, beats
    it on every element carrying the class (the lab's nested-vs-flat bench). As the README's
    contract says, the consumer rule adds the same state where the library styles one, such as an
    active Tabs trigger's `[data-state="active"]`; the bench reads those states from the library
    rules that match each element. Classes listed as `clientOnly` that the fixture does not render
    (Tabs' scroll buttons) are skipped.
  - `bench.tailwind`: with Tailwind 3.3, 3.4 or 4.1 loaded, every property a library rule declares on
    a stable-class element keeps its computed value (percentage sizes compare as declared, since
    they resolve against page layout). Properties the library leaves to the page are Tailwind's to
    reset. It pins the known conflict: 3.3 clears the background of `button[type=button]`, 3.4 and
    4.1 do not. Markdown prose has no stable class, so a separate "MarkDownRenderer prose" case
    checks that list markers and padding, quote margins, strong weight and heading font survive
    every version.

## Styling contract

`test/unit/contract/` enforces the styling contract (README, "Styling and overrides") at the Node seam.

- `components.tsx` lists every migrated component with elements covering every value of every
  prop that changes its classes. Each component has its own `<Folder>.contract.test.tsx`, which calls
  `describeContract(folder)` from `defineContract.tsx`. One file per component gives each a fresh
  module graph, so a component's CSS is never already registered by another that renders it.
  `coverage.test.ts` fails if an entry has no file. The contract test server-renders the entry through public exports,
  collects the CSS registered while rendering (`collect.ts`: what the render added to the public
  `getComponentStyles()` sheet), and checks:
  - every selector is one generated class, optionally with one state, a sibling pair
    (`.go1 + .go1`) or a zero-weight `:where(.go1) <type selectors>` rule, and no rule is layered;
  - components that set `prose: true` in `components.tsx` (MarkDownRenderer only) may also use
    prose rules: `.go1` and a combinator, then at most two compounds of tags or `*`, with at most
    one structural pseudo-class (tag-only `:has()` or `:where()` included) and one pseudo-element,
    such as `.go1 p`, `.go1 li :last-child` or `.go1 blockquote > *:first-child::before`;
  - the same elements rendered under `<ThemeProvider cssLayer="openui">` put every rule in
    `@layer openui` (no unlayered rule, no other or nested layer), within the same budget and
    with the same selector shapes;
  - every rendered `openui-*` class matches `openui-<block>[--<prop>-<value>]`, a modifier attaches
    to a documented root or part, and the rendered classes equal the component's `names`.
- `checks.ts` holds the selector, layer and class grammar; `checks.test.ts` feeds it deliberately
  broken selectors, layered rules and names so a passing contract test means something.
- `reference.test.ts` fails when `docs/reference/selectors.md` differs from what
  `scripts/selector-reference.mjs` generates from the built `names`. Regenerate it after a build:

```bash
pnpm --filter @openuidev/react-components docs:selectors
```

### Migration allowlist

`test/flat-allowlist.json` lists the source modules still on the old styling: they import Goober
themselves and register CSS on import. `allowlist.test.ts` fails if a module that imports Goober is
missing from it, if a listed module no longer imports Goober (or no longer exists), or if a
component that exports `names` is missing from `components.tsx`. `src/styles/defaults.ts` (theme
token defaults), `src/styles/useStyles.ts` and `src/utils/componentStyles.ts` are exempt.

When you convert a component: remove its modules from the allowlist, add it to `components.tsx`
and add a one-line `<Folder>.contract.test.tsx`,
regenerate the reference, and add a parity spec. The list must be empty before a stable release.

## Parity with #72

Converted components must render exactly as they did before the flat-styles pilot. A parity spec
(`<component>.parity.spec.ts`) snapshots computed styles of every `[data-parity-case]` element in
a `parity-<component>` fixture, plus its `[data-parity-part]` children and any parts named by
selector in the case's `data-parity-parts` JSON (for parts the component renders itself), at rest, hovered and pressed,
in light and dark. It compares them with `parity/baselines/<component>.json`, captured from the
source at #72's head (`5e09b37c`). A case's id names its props, so a component with renamed props
renders the same cases from both sources: `__PARITY_BASELINE__` is `true` in the baseline bundle.

Pass design changes that are meant to differ to `checkParity(page, name, intentional)` as
`"<snapshot key> <property>"` entries and list them in the PR.

To add a component: write `fixtures/parity-<component>.tsx`, add it to `fixtures` in
`build-fixtures.ts`, add a spec titled `"<Component> matches the #72 computed styles"` calling
`checkParity(page, "<component>")` (the capture script selects specs by that title), then capture its
baseline (this extracts the #72 source into `test/browser/.baseline/`, gitignored):

```bash
pnpm --filter @openuidev/react-components test:parity:baseline
```

Commit the new baseline file. Recapture only when adding cases, never to absorb a regression.

## Review screenshots

`screenshots.spec.ts` saves a full-page PNG of every parity fixture, in light and dark, to
`test/browser/.screenshots/` (gitignored) for attaching to a pull request. It is skipped unless
`OPENUI_SCREENSHOTS=1`, so CI never runs it:

```bash
pnpm --filter @openuidev/react-components test:screenshots
```

It finds fixtures by their `fixtures/parity-*.tsx` file name, so a new component's parity fixture
is included once it is in `fixtures` in `build-fixtures.ts`. The capture adds a presentation-only
stylesheet on the page and `#root` only: the cases sit in wrapping rows as flex items, on the theme
background. Components are not restyled; parity, not the screenshots, is the gate.

## CI

- `pnpm run ci` (typecheck of `src` and tests, unit tests, lint of `src`, format) needs the build too, because tests import the built package; in CI it runs in the shared `build-js.yml` step after all packages are built.
- Browser tests run in the separate `react-components-browser` job in `build-js.yml`, which builds this package and `@openuidev/react-ui` (for the react-ui benches) with their workspace dependencies, installs Chromium and runs `test:browser`. Locally, build react-ui too: `pnpm --filter "@openuidev/react-ui..." build`.

## Ticket #102: chart foundations

`Charts.contract.test.tsx` renders public LineChart, BarChart, HorizontalBarChart, PieChart,
StackedLegend and all three mini charts. Chart-specific frames remain allowlisted; the contract
accounts for their composed names separately, as markdown does for Table and CodeBlock. The nine
shared modules are no longer allowlisted. Browser-only portal and measured header parts are listed
as `clientOnly`; `chart-foundations.spec.ts` checks their grammar, layers and overrides through the
public charts, including every stable class loaded before/after library CSS and in layer mode.
`chart-animations.test.tsx` guards deferred keyframe registration through the built public package.

New browser fixtures: `chart-foundations`, `parity-chart-foundations`, `parity-mini-charts`,
`parity-chart-tooltip`; `foundation-cases.tsx` shares the public consumer cases. Parity names are
`chart-foundations`, `mini-charts`, `chart-tooltip`, with no intentional visual differences.
The parity helper accepts an optional fourth `prepareCase(page, id)` argument for interaction-only
parts, run before each observation. A fixture's `data-parity-global-parts` JSON names portal parts
outside its root; `data-parity-hover-target` chooses an owned part for hover/press while the
case root and every named part are still measured. Expanded/show-all legend cases activate their
public controls before measurement. The tooltip spec activates the actual public chart before measuring its portal.

Orchestrator follow-up (Chromium cannot run in the implementation sandbox):

```bash
pnpm test:parity:baseline
pnpm exec playwright test chart-foundations.spec.ts chart-foundations.parity.spec.ts mini-charts.parity.spec.ts chart-tooltip.parity.spec.ts
pnpm test:browser
```

Capture baselines from #72 using the script; never hand-write or recapture them to absorb a
regression. Run the full browser suite too: the shared override and Tailwind benches now include
the chart foundations. Screenshot capture discovers the new parity fixtures automatically;
tooltip appearance is checked by its activated parity spec.

The #102 browser follow-up preserves #72's active-row swatch scale (1.3 at rest, 1.2 when
hovered or pressed). The scroll interaction test locates disabled controls by stable class because
their intentional `visibility: hidden` removes them from role queries; it checks native disabled
state and visibility before scrolling, after scrolling, and after returning. The HTML-class rewrite
test checks the foundations' styles, including minimum widths for mini charts and the tooltip.
For DefaultLegend it checks its declared gap instead of an undeclared minimum width: removing
the still-allowlisted parent chart's flex layout changes the browser's resolution of `auto`.
These fixes do not change parity fixtures or require baseline recapture.

## Ticket #104: other charts

PieChart, RadarChart, RadialChart, FunnelChart, HeatmapChart, CalendarHeatmap and SegmentedBar
have individual `test/unit/contract/<Component>.contract.test.tsx` files. The shared public cases
in `test/fixtures/other-charts.tsx` cover appearance axes, animation on/off, empty frames, legend
layouts, radar dots/grids/truncation, heatmap labels/empty cells/diverging ramps, calendar patterns,
ghost cells and separators, and the SingleStackedBar alias. `components.tsx` includes these cases
in the Charts family and also supplies each focused contract. Only hydration-dependent heatmap
labels and the truncated radar label hitbox are marked `clientOnly`.

`other-chart-modifiers.test.tsx` pins default modifiers; `other-chart-overrides.test.tsx` guards
against inline appearance declarations defeating consumer CSS. It retains #102's documented
exception for the shared StackedLegend frame's JavaScript width. The seven converted style
modules are removed from the allowlist; regenerate the reference after building.

`other-charts.spec.ts` checks every stable class before/after library CSS and in layer mode,
including SVG fill, the diverging notch pseudo-element, runtime cell states, render-time
registration and HTML-class rewrites. Its fixture is `other-charts`; `?chart=<Component>` selects
one chart and `?layer=1` enables layer mode. The parity fixtures and names are:

- `parity-pie-chart` / `pie-chart`
- `parity-radar-chart` / `radar-chart`
- `parity-radial-chart` / `radial-chart`
- `parity-funnel-chart` / `funnel-chart`
- `parity-heatmap-chart` / `heatmap-chart`
- `parity-calendar-heatmap` / `calendar-heatmap`
- `parity-segmented-bar` / `segmented-bar`

Each `<name>.parity.spec.ts` checks light and dark against #72. No intentional differences.
The shared parity helper accepts an optional fifth argument for extra computed properties;
these cases include SVG fill, fill opacity, stroke, stroke width/dashes, pointer events,
overflow, transform origins/boxes and animation delays/durations/easing, including later marks
that exercise each entrance stagger. Existing parity properties and baselines are unchanged.

Orchestrator follow-up (Chromium is unavailable in this implementation sandbox):

```bash
pnpm test:parity:baseline
pnpm exec playwright test other-charts.spec.ts pie-chart.parity.spec.ts radar-chart.parity.spec.ts radial-chart.parity.spec.ts funnel-chart.parity.spec.ts heatmap-chart.parity.spec.ts calendar-heatmap.parity.spec.ts segmented-bar.parity.spec.ts
pnpm test:browser
```

Capture the seven baseline JSON files from #72 with the script; do not hand-write them. The
screenshot runner discovers the parity fixtures automatically. Run the full browser suite,
including foundation parity and the shared override/Tailwind benches, before committing.

### #104 browser follow-up

The Tailwind snapshot indexes flat rules by their owning class and finishes animations once
before reading styles, retaining every stable-class element and declared property in the large
Charts matrix. Complex selectors still use `matches()`, with stylesheet order and active media
preserved. `bench-snapshot.test.ts` guards coverage, portals, rule ordering and matching work.
The ordinary reset matrix uses untyped buttons; the separate typed-button tests retain the
documented Tailwind 3.3 conflict.

The `elements` fixture opens a public LineChart with eleven series so both generic benches
exercise the tooltip summary and every portal part outside `#root`. Readiness waits for the
visible panel and its positioned wrapper; tooltip override cases cannot silently skip.
The foundations HTML-class rewrite test reopens the public chart tooltip after reflow and
requires a visible panel before each unchanged style comparison.

The supplied #72 capture completed all fourteen specs. No parity fixtures or baseline JSON
changed in this follow-up, so no recapture is needed. Rerun `bench.tailwind.spec.ts`,
`bench.overrides.spec.ts` and `chart-foundations.spec.ts`, then the full browser suite.

The next browser run exposed actual style differences in all three Charts reset cases, rather
than timeouts: Preflight's block SVG reset removed CalendarHeatmap's 4px inline baseline gap,
and its page font reset changed the seven SegmentedBar tracks that declare `font-family: inherit`.
CalendarHeatmap now explicitly preserves #72's `display: inline` and baseline alignment. The
Charts bench supplies page typography (`16px/normal serif`) on `body`, including portals, since
inherited typography is a page input. Every element, case and property comparison remains in
place. No parity fixtures or baselines changed; rerun the Tailwind and override benches,
`calendar-heatmap.parity.spec.ts`, and then the full browser suite. No recapture is required.
