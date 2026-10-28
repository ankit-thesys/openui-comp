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

## Ticket #103: cartesian charts

`Charts/{AreaChart,BarChart,HorizontalBarChart,LineChart,ScatterChart}.contract.test.tsx`
checks each public family independently. The contract list supports nested chart families;
`Charts` continues to cover the shared foundations and mini charts. The migrated browser benches
use each entry's own documented names, excluding composed dependencies, so one chart's fixture
never claims another chart's parts. The five chart style modules are off the allowlist.

`cartesian-charts.test.tsx` checks render-time registration, layers, data states, empty horizontal
frames, stable classes on owned SVG output and overridable dynamic appearance. Existing built-dist
client-boundary tests cover every changed component. No style internals are imported by tests.

`cartesian-charts.spec.ts` uses the `cartesian-charts` consumer fixture and checks every stable
class before/after library CSS and in layer mode, SVG properties, data-state origins, zero lines,
HTML-class rewrites, reduced motion and printing. Parity fixtures and names are `area-chart`,
`bar-chart`, `horizontal-bar-chart`, `line-chart`, `scatter-chart`; their source files are
`fixtures/parity-<name>.tsx`, sharing `cartesian-cases.tsx`. Each family's spec is
`<name>.parity.spec.ts`. There are no intentional visual differences. Cases cover empty frames,
curves, grouped/stacked bars, signs, dots, internal lines, entrances, condensed wrappers, scrolling,
axes and grid/legend suppression. Fixtures can add SVG/animation properties with
`data-parity-properties`; the shared parity observations remain unchanged for other fixtures.

Orchestrator follow-up (Chromium is unavailable in the implementation sandbox):

```bash
pnpm test:parity:baseline
pnpm exec playwright test parity.spec.ts cartesian-charts.spec.ts area-chart.parity.spec.ts bar-chart.parity.spec.ts horizontal-bar-chart.parity.spec.ts line-chart.parity.spec.ts scatter-chart.parity.spec.ts
pnpm test:browser
```

Capture the five new JSON baselines using #72's source and the script; do not hand-write them.
The full browser suite also reruns chart foundations, overrides, Tailwind and hydration benches.
`pnpm test:screenshots` discovers all five parity fixtures automatically.

Ticket #103 browser follow-up: parity settles all observed descendants, including unnamed SVG
marks and portal children, before measuring any part's geometry. `parity.spec.ts` pins this
ordering with paused descendant animations. Recapture the #72 baselines with
`pnpm test:parity:baseline` after this measurement change, then rerun the parity specs and full
browser suite. The print check waits for marks to settle naturally to opacity 1 and zero
animations; the reduced-motion check still requires those values immediately. Neither forces
animation completion. This retains #72's area opacity transition while accounting for the
print hook's effect-driven entrance-class removal.
