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

### Shared helpers (#90)

`src/styles/base.ts` and `src/components/Skeleton/skeletonPulse.ts` are factories registered
by their users through `useStyles`, with no import-time registration or `<html>` marker.
Their `names` appear as SharedBase and SkeletonPulse in the generated reference.
`sharedStyleContracts` in `components.tsx` records these helpers separately; their focused
`SharedBase.contract.test.tsx` and `SkeletonPulse.contract.test.tsx` collect only the CSS
added by rendering public components. `sharedBaseConsumers` lists the three border-box users.
The callers' remaining owned styles stay allowlisted for #91, #96 and #101. They are not
fully migrated families and must not join `migratedComponents` yet.

`shared-base.spec.ts` covers both stable helper classes before/after the library, in default
and layer mode, import-time inactivity, an `<html class>` rewrite, root-only box sizing and
actual pulse progression. `shared-base.parity.spec.ts` and `skeleton-pulse.parity.spec.ts`
use the `parity-shared-base` and `parity-skeleton-pulse` fixtures. Capture the new
`shared-base.json` and `skeleton-pulse.json` baselines from #72 with the command above.
No intentional differences are allowed. The parity collector pauses infinite animations
at time zero (they cannot be finished); the browser spec separately advances the pulse
through its 0% and 50% frames to verify the animation still runs.

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
through public card blocks). Each has its own contract file. OverviewCardBlock explicitly
excludes only the classes rendered by its allowlisted public MetricIndicatorInline dependency
from owned-class grammar/reference checks; MetricIndicator's module remains allowlisted.
All newly registered CSS and every owned stable class still pass the ordinary checks in both modes.

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
