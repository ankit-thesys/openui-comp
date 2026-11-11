# @openuidev/dashboard-library

An [OpenUI Lang](https://www.npmjs.com/package/@openuidev/react-lang) component library for analytics dashboards. A model writes a short program, and the component library draws it as a full dashboard: filters, a strip of headline numbers, charts, tables and maps, with loading, empty and error states built in.

## Install

```bash
pnpm add @openuidev/dashboard-library @openuidev/react-lang react react-dom zod
```

React 18 and 19 are supported.

## Use

```tsx
import { library, ThemeProvider } from "@openuidev/dashboard-library";
import { Renderer } from "@openuidev/react-lang";

export function Dashboard({ program }: { program: string }) {
  return (
    <ThemeProvider mode="light">
      <Renderer library={library} response={program} />
    </ThemeProvider>
  );
}

// Give this to the model as its system prompt.
const systemPrompt = library.prompt();
```

No stylesheet import is needed.

## A dashboard program

```
root = Dashboard([filters, kpis, trends])
$period = "30d"
filters = FilterBar([PeriodPicker("period", [{value: "7d", label: "7D"}, {value: "30d", label: "30D"}], $period)])
kpis = Section("", [Kpis([Kpi("Revenue", 412600, "currency-compact", 398200), Kpi("Win rate", 27.4, "percent", 24.9)])])
trends = Section("Revenue", [Row([Card("Revenue by week", [TimeSeries(["Oct 5", "Oct 12", "Oct 19", "Oct 26"], [Series("Revenue", [99, 101, 102, 104.2])], "area", {type: "currency", suffix: "K"})], "two-thirds", "Weekly · USD thousands")])])
```

Numbers are written raw, and a Format says how to show them. A previous-period value beside a number draws the change, and `goodWhen` says which direction is good news.

## Components

41 components in 10 groups, each named for the question it answers:

| Group         | Components                                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------------------------ |
| Structure     | Dashboard, Section, Row, Card                                                                                      |
| Filters       | FilterBar, PeriodPicker, DateRangeFilter, ChipFilter, SelectFilter, MultiSelectFilter, SearchFilter, CompareToggle |
| Metrics       | Kpis, Kpi, Stat, KeyValues, Goal                                                                                   |
| Tables        | Table, Column                                                                                                      |
| Trends        | TimeSeries, Series, Reference, Marker, SmallMultiples, StatusTimeline                                              |
| Comparison    | Bars, Leaderboard, Dumbbell, Distribution, Intervals                                                               |
| Composition   | Donut, SegmentedBar, Treemap, Waterfall                                                                            |
| Flow          | Funnel, Flow                                                                                                       |
| Relationships | Scatter, Heatmap, Cohorts                                                                                          |
| Maps          | GeoMap, PointMap                                                                                                   |

## Theming

`ThemeProvider` sets the dashboard's tokens as `--openui-dashboard-*` CSS variables on its own scope.

```tsx
<ThemeProvider mode="dark" lightTheme={{ series1: "#6155e8" }} darkTheme={{ series1: "#8f86ff" }}>
  <Renderer library={library} response={program} />
</ThemeProvider>
```

- `mode` is `"light"` or `"dark"`. Without it, a provider takes the mode of the nearest dashboard `ThemeProvider` above it, and otherwise light.
- `lightTheme` and `darkTheme` are partial overrides, merged over that mode's defaults. Keys are camel case, such as `surfaceSubtle`, `series1` and `space2xl`. If `darkTheme` is left out, the `lightTheme` overrides apply to both modes.
- Every provider has its own scope, so two dashboards on one page can have different themes.
- A dashboard with no `ThemeProvider` above it uses the light defaults.

The dashboard theme is separate from `@openuidev/react-components`' theme: a react-components `ThemeProvider` does not change a dashboard's mode or colours.

The default series colours are ordered so that neighbouring series stay distinguishable for colour-blind viewers. Charts use the first eight in order; anything past the eighth is drawn in the muted colour.

## Developing

```text
src/
  components/<group>/<Name>/  # plain React component, its props interface, <name>.styles.ts, index.ts
  components/<group>/styles.ts  # joins the group's raw fragments, in their original order
  components/shared/<Name>/   # shared visual pieces
  components/ThemeProvider/
  lib/<group>/<Name>/         # schema.ts and index.tsx (OpenUI Lang definition)
  lib/<group>/index.ts        # the group's registration: its definitions and raw style blocks
  lib/group.ts                # the Group type
  lib/registeredGroups.ts     # every group but Structure, imported once
  lib/slots.ts                # which slot each component joins, and the prompt order
  lib/defineComponents.ts     # Structure plus every group: the full component list
  lib/schemaCoverage.ts       # compile-time check that a schema reaches its component
  lib/styles.ts               # compiles every style block once, in STYLE_ORDER
  lib/library.tsx             # createLibrary and shared schema names
  lib/prompt-options/         # prompt groups and notes
  shared/                     # contexts, Format, pure helpers, runtime adapters
```

Definitions import components; components import shared code. Nothing imports upward into
`lib/`, `shared/` imports neither components nor definitions, and neither components nor
`shared/` import `@openuidev/react-lang`. The one exception is a runtime adapter in `shared/`
that hands Query or streaming state to visuals as plain values (`shared/queryState.ts`); each
such module is listed in the boundary test. Groups awaiting migration still live in their
original `src/` folders; their `lib/<group>/index.ts` registrations point there.

Card is the worked example. `components/structure/Card/Card.tsx` exports `Card` and its
`CardProps` interface. It receives rendered children, controls and a streaming boolean, and owns
the header slot, layout and DOM watcher that identifies the card being written.
`lib/structure/Card/schema.ts` exports `cardPropsSchema` and its inferred `CardSchemaProps`.
`lib/structure/Card/index.tsx` exports `CardComponent`: the unchanged OpenUI Lang name, schema
and description, plus a render function that reads runtime state (`useIsStreaming`,
`renderNode`, child nodes) and passes each prop to `Card` by name. Components import neither zod
nor `@openuidev/react-lang` nor `lib/`.

Passing each prop by name makes a field whose type drifts from the props interface fail the
build. A field added to the schema and never passed on would not, so every definition also
declares, once:

```ts
export type CardSchemaCovered = Covered<SchemaCoverage<CardSchemaProps, CardProps, "content">>;
```

Every schema field must be a prop of the component or be named as one the definition uses
itself (here `content`, rendered into children). A leftover field fails the build with its
name, and the boundary test checks each definition declares the type.

### Styles

Each component's `<name>.styles.ts` exports raw CSS, as `String.raw` fragments in `<name>Rules`;
nothing calls `css()` there. The group's `styles.ts` joins its fragments into one raw block in
their original order, and `lib/<group>/index.ts` registers it by block name in `styles`.
`lib/styles.ts` is the only place CSS is compiled: it calls `css()` once per block, in the
fixed order of `STYLE_ORDER`, because rules reach the page in the order `css()` runs and rules
of equal specificity rely on it. A new block's name must be added to `STYLE_ORDER`.

- Splitting a block into fragments must keep its text byte for byte: goober names a block's
  class from a hash of its text, and `styleOrder.test.ts` pins every block's class and order.
- Keep selectors, declarations and complete responsive blocks in their original order: goober
  merges duplicate at-rule blocks into the first one's position.

The Dashboard puts every block's class on its root. Something rendered outside the root, in a
portal on `document.body`, reads the classes it needs with `useStyleClasses("filters",
"shared")` (`shared/styleClasses.ts`), together with the theme's portal class. A portal into a
card's header slot is inside the root and needs neither.

Two selector rules are checked by the test package:

- A functional pseudo-class (`:has()`, `:not()`, `:is()`, `:nth-child()`) may only end a selector.
- Never put a comma inside its parentheses; write alternatives as separate selectors.

Tests live in `tests/dashboard-library` at the repository root. Its boundary test checks the
dependency direction and each definition's schema check; `styleOrder.test.ts` pins the CSS. See
its README for how to run the tests.
