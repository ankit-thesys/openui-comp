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
in light and dark. Cases may set `data-parity-target` to hover/press an owned part and
`data-parity-setup-click` to enter a runtime state before measuring it (CodeBlock
freezes its copied-state reset timer in the spec). It compares them with `parity/baselines/<component>.json`, captured from the
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

### Shared helpers (#90)

`src/styles/base.ts` and `src/components/Skeleton/skeletonPulse.ts` are factories registered
by their users through `useStyles`, with no import-time registration or `<html>` marker.
Their `names` appear as SharedBase and SkeletonPulse in the generated reference.
`sharedStyleContracts` in `components.tsx` records these helpers separately; their focused
`SharedBase.contract.test.tsx` and `SkeletonPulse.contract.test.tsx` collect only the CSS
added by rendering public components. `sharedBaseConsumers` lists the three border-box users.
The border-box callers' owned styles are migrated by #91 and #96, and the Skeleton
family is fully migrated by #101. These families are covered by `migratedComponents`.

`shared-base.spec.ts` covers both stable helper classes before/after the library, in default
and layer mode, import-time inactivity, an `<html class>` rewrite, root-only box sizing and
actual pulse progression. `shared-base.parity.spec.ts` and `skeleton-pulse.parity.spec.ts`
use the `parity-shared-base` and `parity-skeleton-pulse` fixtures. Capture the new
`shared-base.json` and `skeleton-pulse.json` baselines from #72 with the command above.
No intentional differences are allowed. The parity collector pauses infinite animations
at time zero (they cannot be finished); the browser spec separately advances the pulse
through its 0% and 50% frames to verify the animation still runs.

### Choice controls (#92)

CheckBoxGroup/Item, RadioGroup/Item, SwitchGroup/Item, ToggleGroup/Item and Chips
join the contract, override and Tailwind benches. `choice-controls.spec.ts` uses the
`choice-controls` fixture for checked/unchecked, disabled and keyboard-focus overrides
before/after the library in default/layer mode, mouse/keyboard state changes, SVG/ thumb
part overrides, render-time registration and `<html class>` replacement.

The `check-box`, `radio`, `switch`, `toggle` and `chips` parity specs use their
`parity-<name>` fixtures and need `<name>.json` baselines captured from #72. No intentional
differences are allowed. `choice-parity.tsx` translates old classes only for the baseline
bundle and measures both item containers and the actual hovered/pressed controls.
Cases can add `data-parity-properties` (a JSON string array) to compare SVG fill/stroke,
thumb transforms or focus outlines alongside the standard properties. Chromium capture
and execution are left to the orchestrator in the #92 sandbox.

The Tailwind matrix compares buttons without a `type` attribute, matching the pilot Button
fixture; separate cases exercise `type="button"`. Tailwind 3.3 clears a class-level
background but leaves a background declared by a class plus a state intact. Those cases
check both groups separately: an all-checked SwitchGroup or selected Chips has no
class-level background to clear. The migrated bench also normalizes page-owned button
text color with a zero-specificity rule, so UA disabled text color does not change the
computed `currentColor` of a library's `border: none`. Library and consumer color rules
still win. Radio parity includes disabled unchecked hover/press in light and dark; the
disabled fill must stay at the foreground color, as it did in #72.

### Loading and code (#101)

Skeleton (including its internal SkeletonBar), PieChartSkeleton, TableSkeleton,
DotMatrixLoader and CodeBlock are fully migrated. `Skeleton.contract.test.tsx` covers
all Skeleton family parts and pie appearance combinations through public exports;
DotMatrixLoader and CodeBlock have their own contract files. They join the generic
`bench.overrides` and `bench.tailwind` coverage for every stable class. The benches
pause infinite animations at time zero, matching the parity collector.

`loading-code.spec.ts` and `fixtures/loading-code.tsx` cover render-time registration,
HTML class replacement, dimension overrides, live dot opacity, CodeBlock's two class
props, hover visibility and copied colours (including #72's hover/press precedence), before/after
consumer CSS in default and layer mode. `skeleton.parity.spec.ts`,
`dot-matrix-loader.parity.spec.ts` and `code-block.parity.spec.ts` use the corresponding
`parity-skeleton`, `parity-dot-matrix-loader` and `parity-code-block` fixtures and
`skeleton.json`, `dot-matrix-loader.json` and `code-block.json` #72 baselines.
There are no intentional visual differences. Dot parity freezes RAF at the initial
frame in both builds; the focused spec separately checks that the trail moves.
The existing `parity-skeleton-pulse` fixture translates the #101 part renames.
Baseline capture and browser execution require Chromium; see the checklist below.
CodeBlock's default highlighter frame has no inline styles; the public-export Node
test guards this while preserving token colours, explicit themes and replacement
classes. The focused browser spec checks frame colour, background and all four
padding overrides in both load orders and layer modes. The generic override and
Tailwind benches also cover the frame; their assertions remain unchanged.

### Migrate a component checklist

Follow ADR 0001 **including its Amendments**, the package glossary and the pilot spec on
`origin/claude/flat-styles-spec-grill`. Button, IconButton, Tabs and MarkDownRenderer are
the working examples. Keep the change inside the rollout ticket's family scope.

1. Inventory the public roots, owned parts, appearance props and runtime states. Read the
   existing styles and callers, including chat-kit references (report kit references; do not
   change that package). Record the exact old-to-new names and props in the README migration
   table and update internal callers. Preserve `"use client"` as every component module's
   first line; barrels have no directive.
2. Add a public-export contract case in `test/unit/contract/components.tsx` and a
   `<Folder>.contract.test.tsx` calling `describeContract("<Folder>")`. Cover every value of
   every prop that changes classes, defaults included, and all parts. Record genuinely
   browser-only parts in `clientOnly`. Start with one failing behaviour through public
   server rendering of the **built** package; never import factories or `useStyles` in tests.
3. Export a plain `names` const from each style module and a `componentStyles(css: StyleCss)`
   factory returning root, part and axis entries. Call `useStyles(factory)` inside the component
   render and join generated and stable classes with `clsx`, as Button does. Register nothing
   at import and remove the module's `<html>` marker. Reuse the shared border-box and pulse
   factories at render when applicable; do not copy or eagerly register them.
4. Use roots `openui-<component>`, parts `openui-<component>-<part>` and modifiers
   `--<kebab-case-prop>-<kebab-case-value>`. Emit default modifiers, and boolean modifiers only
   when true. Put states on native attributes/pseudo-classes or Radix attributes. Keep each
   selector to one class plus one state (or the documented sibling/foreign-content rules).
   Root modifiers pass cross-axis/part values via private `--_openui-*` variables. Keep state
   rules ordered to preserve precedence, as in the pilot. Only MarkDownRenderer opts into
   the amended prose budget. Retain the documented `!important` exceptions.
5. Go green for that behaviour, rebuild and run its single contract file and `pnpm typecheck`.
   Repeat one behaviour at a time. Add a `parity-<component>.tsx` fixture importing
   `openui-under-test`, register it in `build-fixtures.ts`, and add a spec titled
   `"<Component> matches the #72 computed styles"` calling `checkParity(page, "<component>")`.
   Cover prop combinations and parts in light/dark at rest, hover and press. Use
   `__PARITY_BASELINE__` only to translate renamed props/classes for the #72 bundle.
6. Capture the computed-style baseline from **#72 at `5e09b37c`**, using
   `pnpm test:parity:baseline`; commit its generated `parity/baselines/<component>.json`.
   Never hand-write JSON or recapture to hide a regression. List any intentional visual
   differences explicitly in `checkParity` and explain why. If Chromium is unavailable,
   leave capture/execution to the orchestrator and report the fixture/spec/baseline names.
7. Joining `migratedComponents` automatically joins `bench.overrides` and `bench.tailwind`.
   Verify consumer CSS wins on **every stable class** before and after the library, adding
   the same state when needed, with no `!important`. Add focused fixture/spec coverage for
   runtime states, portal/measurement-only parts, layer mode and `<html class>` replacement
   as needed; the generic bench does not replace these. Typecheck browser tests even when
   Chromium cannot run.
8. Remove only the converted modules from `test/flat-allowlist.json`. After building, run
   `pnpm docs:selectors` and check in the generated reference. Additive entries in shared
   files must preserve other tickets' work. Shared helper migrations use the focused
   contracts above instead of claiming an entire family is flat.
9. From this package, run `pnpm build && pnpm test && pnpm run ci` from a clean build, then
   run Chromium's `pnpm test:browser` (including parity and override specs). Review the diff
   against the ticket and ADR, fix findings, and report any blocked checks or intentional
   differences. Leave commits, pushes and PRs to the ticket's authorized delivery flow.

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

## Text and tag primitives rollout (#96)

The eleven new contract families are TextBlock (public TextBlockView), TextCallout, Callout,
TextContent, TextContentWrapper, InlineHeader, IconText, IconTag, Tag, TagBlock and Separator.
They join the common override and Tailwind benches. The inline owners opt into the prose
checker only for their composed MarkDownRenderer; their owned rules keep the flat budget.
IconTag's lazy SVG is client-only in SSR and the browser bench waits for it explicitly.
TagBlock still registers the shared border-box factory; the shared helper's contract collects
only the generated rule shared by its three public roots now that TagBlock also registers layout.

`text-blocks.spec.ts`, using `text-blocks.tsx` and `text-blocks-cases.tsx`, checks every owned
class before/after the library in default/layer mode, html class replacement, overridable line
clamping, actual lazy SVG sizes and Callout's timed fade/collapse. No raw native buttons appear
in these fixtures. TextContent owns its child typography; tags and callouts own theirs.

TextBlock preserves all size × variant × type typography combinations through private inherited
variables. IconText supplies its horizontal icon offset and primary typography through private
variables rather than descendant selectors. Numeric line-clamp and duration values stay in private
inline variables; display, overflow and animation defaults live in CSS. TextContentWrapper's
paragraph-before-list spacing is passed to MarkDownRenderer through a private variable, keeping
prose structure in its existing renderer. Its old dark paragraph/heading color rules duplicated
MarkDownRenderer's theme colors. Its lazy KaTeX span gets the owned `-math` class and inherits its
dark display/margin values from the wrapper, with vendor typography unchanged.

Capture these eleven #72 baselines with `pnpm test:parity:baseline`: `text-block`, `text-callout`,
`callout`, `text-content`, `text-content-wrapper`, `inline-header`, `icon-text`, `icon-tag`, `tag`,
`tag-block`, `separator`. Each has `fixtures/parity-<name>.tsx` and `<name>.parity.spec.ts`.
Cases cover defaults, every appearance value and owned parts in both themes, plus clamping,
alignment, secondary tone, icon aliases, math and list lead-ins. Callout's duration case is
measured at its completed collapsed frame; the focused browser test also checks animation start.
No intentional visual differences are allowed. Chromium execution and baseline capture are
left to the orchestrator; no baseline JSON is authored by hand.

Internal renamed-class callers updated here are ImageText and SnippetCardBlock, plus the #95
inline caller browser test. No chat-kit package or chat-kit references exist in this checkout.

The Callout override checks disable its forwards-filled animation with a consumer
`animation: none` rule on the same stable/state selector before checking animated properties.
They assert the animation override too; the focused timing test separately verifies the
original fade/collapse. IconText's boolean `bold` names entry uses the `true` axis value, and
the reference generator displays it as `bold={true}` rather than a part or string prop.

## Disclosure, layout and overlays (#98)

`Accordion`, `SectionBlock` (SectionV2 and FoldableSection), `Steps`, `Card`, `CardHeader`,
`Modal` and `TooltipWrapper` now join the contract and override benches. Modal and tooltip
classes are marked `clientOnly` because Node cannot render their portals; their factories
still register during Node rendering in both layer modes. The `elements` fixture opens Modal
in the browser and focuses the tooltip trigger. The shared benches query the whole isolated
fixture document so they include portal content and Radix's accessible copies.

The shared readiness helper waits for a visible stable part, including fixed-positioned Modal
content whose portal wrapper has no height. The tooltip trigger is a library `Button`, so the
button-background bench measures declared library styles. The foldable fixture's caller-supplied
body has explicit typography: its `fit-content` height must not vary with preflight's inherited
line height. These fixture choices preserve all override and Tailwind assertions.

The Modal fixture also pins caller-supplied body typography and sets the dialog's page-owned
`box-sizing` to `border-box` with a zero-specificity rule in `elements.tsx`. Its
`translate(-50%, -50%)` computes to a pixel matrix using the border box: preflight's box-sizing
and inherited line-height resets otherwise change that matrix without overriding any Modal
declaration. The bench still compares the computed transform and every other declared property.
These inputs apply only to the benches; the #72 parity fixtures keep their original page inputs.

`disclosure.spec.ts` exercises open/closed overrides with mouse and keyboard, Modal and tooltip
portal overrides before/after library CSS in both modes, all tooltip sides, lazy registration,
and an html-class rewrite. The parity fixtures/specs cover `accordion`, `section-block`, `steps`,
`card`, `card-header`, `modal-sm`, `modal-md`, `modal-lg`, and `tooltip-wrapper`, in light and dark.
No intentional visual differences are declared. Modal's overlay is named with a `document:`
selector in `data-parity-parts` because it is a sibling of the measured content root.

Chromium execution and #72 baseline capture for these names are delegated to the orchestrator.
Run `pnpm test:parity:baseline`, then `pnpm test:browser`. Baselines must come from #72;
never write them manually or capture the migrated implementation as the reference.

## Card blocks rollout (#100)

The seven contract entries are CompositeCardBlock, ContextCardBlock, VisualCardBlock,
OverviewCardBlock, SnippetCardBlock, OptionCards and `_shared` (CardBlockLayout, exercised only
through public card blocks). Each has its own contract file. OverviewCardBlock includes its
MetricIndicatorInline dependency in the class grammar and reference checks now that #99 has
migrated MetricIndicator. All newly registered CSS and every stable class pass the ordinary
checks in both modes.

The common override and Tailwind benches include all seven entries. `card-blocks.spec.ts` and
`fixtures/card-blocks.tsx` add before/after overrides for owned classes in default/layer modes,
hover/focus and selected/disabled states, keyboard activation, the real truncated-text tooltip
portal, lazy registration and html-class replacement. Fixtures use library buttons and pin
caller-owned raw text typography. Selected OptionCards backgrounds are declared on the base
button through a private value, preserving the documented Tailwind 3.3 typed-button conflict.

Capture these seven #72 baselines with `pnpm test:parity:baseline`:
`card-block-layout`, `composite-card-block`, `context-card-block`, `visual-card-block`,
`overview-card-block`, `snippet-card-block`, `option-cards`. Each has a matching
`fixtures/parity-<name>.tsx` and `<name>.parity.spec.ts`, backed by `card-blocks-cases.tsx`.
Cases cover both layout sizes, grid row distributions, narrow containers, carousel widths,
responsive false/true, numeric/string gaps, colored/image cards and tags, emphasis/code, snippet text/icon/image
callers and all option states. Parity cases do not open truncation tooltips; the focused spec
owns those interactions. `card-blocks.parity-details.spec.ts` additionally compares #72 geometry, overlays,
image zoom and carousel masks, including the legacy narrow Overview carousel behavior with
`responsive={false}`. No intentional visual differences are declared. Chromium execution
and baseline capture are left to the orchestrator; no baseline JSON is authored by hand.

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

### Form controls (#91)

FormControl (including Hint), Label, Input, TextArea and Buttons join `migratedComponents`,
so `bench.overrides` and `bench.tailwind` exercise every stable class. Their focused contract
files cover the built package in Node; `Hint.contract.test.tsx` additionally guards the family
part's inherited invalid state. The shared-base test isolates the generated class common to
its three roots, since Buttons and FormControl now register their owned rules as well.

`form-controls.spec.ts` uses `fixtures/form-controls.tsx` for before/after overrides on every
class in both default and layer mode, invalid/disabled/focus precedence, context updates,
independent hint/label overrides, lazy render registration and `<html class>` replacement.
Native fields use `:focus-within` (equivalent to focus on these elements) within the existing
selector grammar. Input's invalid ring remains visible when disabled, while the disabled
border wins; TextArea keeps its focus ring and invalid border independently.

Parity fixtures/specs and baseline names are `input`, `text-area`, `label`, `hint`,
`form-control` and `buttons` (each fixture is `parity-<name>.tsx`). They cover defaults,
appearance props, owned parts and invalid/disabled combinations, light/dark at rest, hover
and press; press also focuses enabled native fields. There are no intentional differences.
Only `parity-form-control` translates renamed part selectors with `__PARITY_BASELINE__`.
When Chromium cannot run, the orchestrator must capture these six baselines from #72 using
`pnpm test:parity:baseline`, then run the full browser suite. Never hand-write baselines.

No renamed-class references were found in the current tree outside these modules/tests/docs,
or in `packages/kits` on the available `origin/codex/chat-kit-separate` and
`origin/claude/chat-kit-tone` refs. The chat kit is not present in this worktree and is unchanged.

### Select, Calendar and DatePicker (#93)

These families join the public-export contract and generic override/Tailwind benches.
`select-calendar.spec.ts` and `fixtures/select-calendar.tsx` cover every stable class before
and after library CSS, both cascade modes, portal nodes outside `#root`, keyboard selection,
disabled items/days, lazy registration and `<html class>` replacement. Readiness waits on
visible item/day parts; hidden Calendar navigation buttons are queried by class.

`select.parity.spec.ts`, `calendar.parity.spec.ts` and `date-picker.parity.spec.ts` use
`parity-select.tsx`, `parity-calendar.tsx` and `parity-date-picker.tsx`. Capture the baseline
names `select`, `calendar` and `date-picker` from #72 with `pnpm test:parity:baseline`.
There are no intentional visual differences. The parity helper accepts optional fresh-page
scenarios and a preparation callback: each modal popup gets a separate page, preventing it
from blocking the next hover/press target. Calendar preparation marks actual day cells and
opened dropdown parts; DatePicker fixes the date and waits for its floating day buttons.
Calendar dropdown captures wait for the debounced measured bounds before taking even the rest
snapshot. Its week-number scenario also pins the native 1px cell padding against Preflight.
The #72 Select fixture hides the regular icon with fixture CSS for hidden-icon cases: passing
`hideDropdownIcon` to #72 throws with the installed Radix Slot because its `asChild` child is
falsy. This preserves the requested hidden-icon appearance without changing the #72 source.
The `select` and `calendar` baselines were recaptured after these fixture/readiness changes;
`date-picker` is unchanged. Do not hand-write baseline JSON. Selected disabled Select triggers
retain #72's primary text/icon colour on hover and press, while placeholders remain secondary.
The private hover colour variable preserves that precedence within the flat selector budget.

The generic benches open Select/Calendar/DatePicker through their public triggers and query
owned classes across the document, including portals. The override helper opens the requested
size/position or month/year dropdown; Tailwind checks both dropdowns and all Select sizes and
positions. Ordinary checks remove Radix's automatic `type=button`; the typed-background checks
restore it explicitly. Keyboard tests await focused options before sending the next key.

Calendar composes public Select parts (including the new `container`/`viewportClassName`
props), and uses its own flat classes. It imports no Select style module or private variables.
DatePicker uses Calendar's `components.Root` slot for its borderless owned content, with a
private context preserving the caption defaults for that internal use. Public Calendar
`components` maps retain replacement semantics.
Only Floating UI position/transform and Calendar dropdown measurements remain inline;
static colour/background/padding defaults are CSS. Radix's static Content display/outline/
box-sizing/item-aligned max-height and Viewport position/flex/overflow defaults move from inline styles into the flat
factory, with focused overrides verifying those properties. The SelectValue ref lands on its
owned styling root. Calendar's state adapter also wraps consumer Day components that forward
their cell props, including incomplete ranges without a selected fill.

Chat-kit inspection: the available `origin/codex/chat-kit-separate` and
`origin/claude/chat-kit-tone` refs contain ModelSwitcher references to the unchanged
`.openui-select-trigger-icon` and `.openui-select-content`; no renamed-class references
were found in `packages/kits`. The kit is absent in this worktree and is unchanged.

### Slider and SliderBlock (#94)

The `Slider` family entry covers both public exports, every variant, range/single and
invalid/disabled/streaming combinations. `Slider.contract.test.tsx` enforces the full family
budget in default and layer modes; `SliderBlock.contract.test.tsx` checks render-time input
validation parts separately. Both use only the built package's public exports. The generic
override/Tailwind benches include all stable classes. The override bench exempts only the
existing important error border on `.openui-slider-block-input[data-invalid="true"]`,
including when that element is targeted through the public Input class.

The typed-button Tailwind check distinguishes base backgrounds from matching state
backgrounds. Tailwind 3.3 clears the enabled Select triggers' base backgrounds, while
SliderBlock's disabled Select triggers retain their higher-specificity `:disabled`
backgrounds. Both results are asserted; Tailwind 3.4 and 4.1 preserve both groups.

`slider.spec.ts` and `fixtures/slider.tsx` cover thumb hover/focus/disabled overrides before
and after library CSS in both modes, active marks/minimum range/tooltip overrides, embedded
Input/Select sizing and interactions, portal selection, streaming, import-time inactivity
and `<html class>` replacement. Input defaults register through their shared internal factory
before SliderBlock's composed input rules; Select defaults register at its public root before
the owned trigger renders. No public Input/Select variables or legacy names are shared.

`slider.parity.spec.ts` / `fixtures/parity-slider.tsx` cover min/middle/max/range values,
continuous/discrete, disabled and side content, with explicit enabled-thumb hover/press cases.
`slider-block.parity.spec.ts` / `fixtures/parity-slider-block.tsx` cover continuous Input and
discrete Select controls, single/range, invalid/reversed values and disabled combinations.
Each Select portal scenario uses a fresh page and waits for the focused selected item outside
`#root`. Capture the `slider` and `slider-block` baselines from #72 with
`pnpm test:parity:baseline`, then run `pnpm test:browser`. Chromium execution and capture
are left to the orchestrator when unavailable; no baselines are hand-written. There are no
intentional visual differences. The old handle `:focus` tooltip rule was ineffective (that
owned div cannot receive focus); the Radix thumb still accepts consumer `:focus-visible` CSS.

No renamed-class references were found outside the Slider modules and package docs in this
worktree, or in `packages/kits` on `origin/codex/chat-kit-separate` and
`origin/claude/chat-kit-tone`. The chat kit is absent here and unchanged.
