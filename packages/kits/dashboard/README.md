# @openuidev/dashboard-kit (beta)

The OpenUI dashboard AI component library: the registry, prompt options and
examples that tell a model which components it may emit for dashboard surfaces.

Rendering comes from `@openuidev/react-components`, which is a required peer.

## Install

```sh
pnpm add @openuidev/dashboard-kit@0.0.0-beta.0 @openuidev/react-components@0.0.0-beta.0
```

`@openuidev/react-components`, `@openuidev/react-lang`, `react`, `react-dom` and
`zod` are peer dependencies.

## Usage

```ts
import {
  openuiDashboardLibrary,
  openuiDashboardPromptOptions,
} from "@openuidev/dashboard-kit/lib";

const systemPrompt = openuiDashboardLibrary.prompt(openuiDashboardPromptOptions);
```

Then render a model's response with `Renderer` from `@openuidev/react-lang`:

```tsx
<Renderer response={program} library={openuiDashboardLibrary} />
```

- `/lib` exports the five AI-integration values plus `dashboardComponents`.
- The root entrypoint exports the standalone React components, such as `Dashboard`,
  `Section`, `CardRow` and `DashboardThemeProvider`.
- Components style themselves with goober, so there is no stylesheet to import.

## Styling

Styles follow the same flat contract as `@openuidev/react-components`:

- Every element has one generated class and one stable class. Each `<name>.styles.ts`
  exports them as `names` and `styles`, and all stable classes start with
  `openui-dashboard-`, so a plain class in your stylesheet can target and override them.
- Variants set private `--_openui-dashboard-*` variables that the parts read. States are
  attributes such as `data-collapsed`, `data-empty` and `aria-expanded`.
- Every `--openui-*` token has a fallback, so components still render without a provider.
- The kit only keeps what react-components doesn't already style. Where it has to change a
  react-components element, it uses a wrapper class plus that element's stable class, such
  as `& .openui-date-picker-trigger`.

## The library

Root component is `Dashboard`. 48 components in 6 groups:

| Group | Components |
|---|---|
| Dashboard Layout | `Dashboard`, `DashboardHeader`, `Section`, `FilterBar`, `FilterSelect`, `FilterMultiSelect`, `DatePicker`, `CardRow`, `IconButton` |
| Shell Cards | `SmallCard`, `MediumCard`, `LargeCard`, `DashboardCardHeader`, `IconTag`, `IconText`, `TextBlock`, `List`, `ListItem`, `EntityList`, `Callout`, `Button`, `ButtonGroup`, `Select`, `SelectItem`, `ImageBlock`, `Tag`, `TagBlock`, `TextContent`, `MarkDownRenderer`, `TextCallout` |
| Metrics | `MetricIndicator`, `OverviewCardItem`, `OverviewCardBlock` |
| Charts | `LineChart`, `BarChart`, `AreaChart`, `HorizontalBarChart`, `RadarChart`, `ScatterChart`, `RadialChart`, `PieChart` |
| Data Display | `Table`, `Col` |
| Primitives | `Icon`, `IconTag`, `IconText`, `TextBlock` |

`Series`, `ScatterSeries`, `Point` and `Slice` are registered as chart data
helpers and are described through the chart signatures rather than their own
group.

## Filters

The prompt teaches the model to bind each `FilterSelect` to a `$variable` and read values from it,
such as `data[$region].revenue`, so filters change the dashboard with no backend. Those values are
written by the model, so they are placeholders. For live data, give the model your own tools so it
can pass `$region` to `Query`. The kit can't supply those.

Without tools, the model uses `FilterSelect` even when asked for a date picker or several ticked
options, because written values can't follow them.

## What makes it a dashboard library

The component list matters less than the **layout grammar** the groups carry as
`notes`, which the generated system prompt inherits:

- `Dashboard` is the root, with `DashboardHeader` plus `Section` children.
- A `Section` owns rows and an optional section-scoped `FilterBar`.
- `CardRow` arranges cards. Valid patterns are small-only, medium-only,
  medium+large mixed, or large-only.
- `FilterBar` accepts only `FilterSelect`, `FilterMultiSelect` and `DatePicker`.
- `SmallCard` has three forms — overview card with icon, overview card, and
  snippet card — each with a stated rule for when to choose it.
- Some combinations are explicitly refused: no `PieChart`, `RadialChart` or
  `RadarChart` inside `LargeCard`; no `FilterBar`, `Image`, `ImageGallery`,
  `Separator`, `CodeBlock` or `Form` inside `MediumCard` or `LargeCard`.

That grammar is why this library is smaller than a general component set — 48
components and a ~20,000-character system prompt — while producing dashboards
rather than a vertical stack of cards.

## Tests

```bash
pnpm test                               # library, prompt and style rules
pnpm exec playwright install chromium   # once
pnpm test:browser                       # rendering, computed styles, layout and clicks
pnpm test:update                        # accept an intended change, then review the diff
```

Run them from `packages/kits/dashboard`, after building `@openuidev/react-components` and
`@openuidev/react-lang`. `pnpm test` also runs in this package's `ci` script. The browser tests
don't run in CI yet.

## Provenance

The library is ported from genui-sdk's `packages/c1/src/dashboard`, with its
rendering retargeted from `@openuidev/react-ui` and `@openuidev/visualization`
onto `@openuidev/react-components`. Two deliberate changes:

- `Table` and `Col` are real component definitions rather than a string lookup
  into the legacy `openuiLibrary` registry, so they are no longer typed
  `DefinedComponent | undefined` and the kit does not depend on the old library.
- The Sass is gone: styles are rewritten flat in goober, and the `c1-` class prefix
  is now `openui-dashboard-`.
