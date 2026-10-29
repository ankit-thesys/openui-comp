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

## Citations and sources rollout (#95)

The contract list includes InlineMarkdownRenderer, Citation (including CitationItem and portal
parts), Sources (including ListedSources and ListedSourceItem), and SourceFaviconImage.
InlineMarkdownRenderer opts into the existing prose grammar only because it composes the pilot's
MarkDownRenderer; its own reset is a flat class on `openui-inline-markdown-renderer-content`.
Citation's scrollbar track/thumb are single pseudo-elements under the same selector budget.

`citations-sources.spec.ts` uses `citations-sources.tsx` to cover every owned stable class in both
load orders and layer modes, citation hover/press/open, all five inline callers, the overflowing
source carousel, favicon fallback/recovery, and rewriting the html classes. The shared override
bench explicitly preserves the listed-source container's important background exception while
checking all its other properties normally. Sources owns the card element and its styles so the
unmigrated CarouselItem cannot outrank them in layer mode; a browser regression compares default
and hover styles across modes. Carousel itself remains on the allowlist. The Tailwind bench
checks that inline content inherits caller typography instead of pinning the page-owned font
that Tailwind changes; link/code typography keeps its existing coverage.

The common benches pin Citation's real tooltip and include portal elements outside `#root`.
Its icon and portal parts must render; they are not overflow-dependent skips. The favicon
fixtures use a local data image, and the fallback bench waits for its lazy globe. Tailwind 3.3's
documented typed-button background reset is an explicit expected value in the general matrix
as well as the dedicated reset test; every other declared property still compares unchanged.
The bench page sets `button { color: inherit; }` in both runs. CitationItem leaves its root
text color to the page, so preflight legitimately changes a native button's color inside the
tooltip (and the implicit `currentColor` from `border: none`). Giving both runs the same
page-owned default preserves the full computed-style comparison, including border widths,
styles and colors, without changing component CSS or the #72 parity fixtures.
The focused Citation override includes a 40px width and height so its padding and border leave
room for the icon. Inline caller coverage also pins TextBlock's hidden tertiary row; the inline
root uses the span's default display so caller visibility rules retain control.

The five new #72 parity names are `inline-markdown`, `citation`, `citation-tooltip`, `sources`, and
`source-favicon-image`. Their `parity-<name>.tsx` fixtures wait for images and lazy globe icons;
`citation-tooltip` pins a real portal before exposing its parity case. Citation's item cases
target their actual buttons via `data-parity-target`, and its trigger runs last so the pressed
state's pinned tooltip cannot cover another case. No intentional visual
differences are allowed. Capture the baselines with `pnpm test:parity:baseline` in an environment
that can run Chromium, then run the parity specs and `citations-sources.spec.ts` (and the common
benches). No baseline JSON is authored by hand.

## Lists and tables rollout (#99)

The contract list includes ListItem, ListBlock, EntityList, Table (including ScrollableTable),
EditableTable (including cell outlines, the select portal and changes bar), and the MetricIndicator
family. Each has its own Node contract file. `lists-tables.test.tsx` checks defaults and public SSR
markup. The checker additionally accepts single `:focus`, `:nth-child(even)` and WebKit input
spin-button pseudo-elements. Tests reject chains and `nth-child(... of .class)`; the selector
budget is unchanged.

`lists-tables.spec.ts` uses `lists-tables.tsx` for every owned stable class in both load orders and
both layer modes, real cell editing/saving, selected/editing outlines, open/checked/highlighted
select states, hover/focus inheritance, scrolling and rewriting html classes. Hidden URL warnings
and zero-height outlines are checked by stable class. Portal readiness waits for a visible option;
portal parts are queried across the document, outside `#root`. The common override and Tailwind
benches also pick up these families from the contract list. The shared readiness helper waits for
measured overflow and opens the EditableTable select portal; input overrides enter text editing
instead. The comparisons include portal parts outside `#root`. The grid
pins #72's content-box sizing so preflight cannot change its column or cell geometry. Radix inserts
a style sibling before the select viewport, which receives only bottom corner rounding in #72.
Their ordinary buttons are library
components, and native text examples carry explicit typography.

The ordinary Tailwind matrix removes button `type` attributes in both runs, including those
Radix supplies, so every declared property compares unchanged. The separate typed-button cases
retain the open select and portal. Tailwind 3.3 clears only backgrounds declared by a matching
single-class base rule; matching class-plus-state backgrounds must keep their exact plain color.
The typed comparison checks each button in document order, including composed buttons, rather
than collapsing their colors into a set. Cases without a painted base background skip only the
dedicated 3.3 reset assertion.

EditableTable owns its select's Radix markup and copies the effective #72 defaults. This keeps
unmigrated Select rules from outranking layered cell styles. Radix intentionally ignores className
on Value and ItemText; owned spans around those primitives supply the stable parts without
changing the effective typography or the text projected into the trigger. Column geometry is
carried in a private CSS variable; ordinary width declarations can override it. DatePicker remains
a composed dependency outside this rollout; its cell uses the same flat outline and base styles.

Capture these new #72 parity names (each has a matching `parity-<name>.tsx` fixture and spec):
`list-item`, `list-block`, `entity-list`, `metric-indicator`, `table`, `scrollable-table`,
`editable-table`, `editable-table-selected`, `editable-table-editing`, `editable-table-select`.
The state fixtures pin a real selected cell, input or select portal before exposing one body case;
portal snapshots run against a visible checked option and close only after the final measurement.
Run the pilot's existing `markdown.parity.spec.ts` too: its tables must still match #72. No
intentional visual differences are listed. Baselines must be captured with Chromium using
`pnpm test:parity:baseline`; none are authored by hand.

The shared SSR bench documents are rendered during fixture setup for both packages and both
modes. Specs read those documents and hydrate the same app; importing the large generated server
bundle in a cold worker previously exhausted the test timeout before navigation. The hydration,
Select interaction and react-ui comparisons retain their complete assertions.

The #99 audit found no class references in other react-components callers or in the checked-out
chat-kit/assistant packages to rename. Public props are unchanged.
