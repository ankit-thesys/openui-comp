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
  components/<group>/<Name>/  # plain React component, props, raw style fragments, index.ts
  components/shared/<Name>/  # shared visual pieces
  components/ThemeProvider/
  lib/<group>/<Name>/         # schema.ts and index.tsx (OpenUI Lang definition)
  lib/<group>/index.ts        # group definitions and style classes
  lib/defineComponents.ts     # registry, slots and prompt order
  lib/library.tsx             # createLibrary and shared schema names
  lib/prompt-options/         # prompt groups and notes
  shared/                    # contexts, Format and pure helpers
```

Definitions import components; components import shared code. Nothing imports upward into
`lib/`, and `shared/` imports neither components nor definitions. Runtime adapters can live in
`shared/` so visual components consume plain state. Groups awaiting migration still live in
their original `src/` folders; their `lib/<group>/index.ts` registrations point there.

Card is the worked example: `components/structure/Card/Card.tsx` exports `Card` and its
`CardProps` interface. It receives rendered children, controls and a streaming boolean, and owns
the header slot, layout and DOM watcher that identifies the card being written.
`lib/structure/Card/schema.ts` exports `cardPropsSchema` and its inferred `CardSchemaProps`.
`lib/structure/Card/index.tsx` exports `CardComponent`: the unchanged OpenUI Lang name, schema
and description, plus a render function that reads runtime state and resolves nodes into `Card`
props. Components import neither zod nor `@openuidev/react-lang` nor `lib/`.

Each component's `<name>.styles.ts` exports raw `String.raw` fragments in `<name>Rules`.
The group's assembler orders them and compiles once with `css(...)` from
`@openuidev/react-components`. Keep selectors, declarations and complete responsive blocks in
their original order: goober merges duplicate at-rule blocks into the first one's position.
The dashboard's root classes are joined in `lib/styles.ts`: structure, shared, then group styles
in their fixed order. Two selector rules are checked by the test package:

- A functional pseudo-class (`:has()`, `:not()`, `:is()`, `:nth-child()`) may only end a selector.
- Never put a comma inside its parentheses; write alternatives as separate selectors.

Tests live in `tests/dashboard-library` at the repository root. Its boundary test checks the
dependency direction. See its README for how to run the tests.
