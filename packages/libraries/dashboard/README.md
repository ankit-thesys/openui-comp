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

Each component group has a folder in `src/` and registers its components in `src/groups/<group>.ts`. The registry in `src/groups/index.ts` and the prompt notes in `src/prompt.ts` place components by name.

Styles use the `css` tag from `@openuidev/react-components`. Two rules keep its compiler from breaking a selector, and the test package lints for both:

- a functional pseudo-class (`:has()`, `:not()`, `:is()`, `:nth-child()`) may only end a selector;
- never put a comma inside its parentheses. Write the alternatives as separate selectors.

The tests live in `tests/dashboard-library` at the repository root. See its README for how to run them.
