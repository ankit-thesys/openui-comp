# Source map

Paths in the first column are relative to `dashboards-ui-library/src/`; our paths are
relative to this package's `src/`. Component folders contain plain React code under
`components/` and definitions under `lib/`.

| Source file                | What it holds                                                                                                      | Our folders                                                                                                                                                                                         |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `library.ts`               | Library creation, component registration, prompt groups and notes                                                  | `lib/library.tsx`, `lib/defineComponents.ts`, `lib/registeredGroups.ts`, `lib/slots.ts`, `lib/prompt-options/`                                                                                      |
| `format.ts`                | Format schema, presets, number and delta formatting                                                                | `shared/format.ts`                                                                                                                                                                                  |
| `schema.ts`                | Width, tone, goodWhen and numeric schemas                                                                          | `shared/schema.ts`                                                                                                                                                                                  |
| `theme.ts`                 | Default themes, series colours, ramps and textures                                                                 | `components/ThemeProvider/`, `shared/colors.ts`                                                                                                                                                     |
| `styles.css`               | All dashboard CSS                                                                                                  | `components/<group>/styles.ts`, component `*.styles.ts`, `components/shared/styles.ts`; compiled by `lib/styles.ts`                                                                                 |
| `components/layout.tsx`    | Dashboard, Section, Row, Card                                                                                      | `components/structure/`, `lib/structure/`, `shared/cardSlot.ts`                                                                                                                                     |
| `components/shared.tsx`    | Legends, tooltips, states, shared visuals, contexts and pure helpers                                               | `components/shared/`, `shared/`                                                                                                                                                                     |
| `components/kpi.tsx`       | Kpi, Kpis, Stat                                                                                                    | `components/metrics/`, `lib/metrics/`                                                                                                                                                               |
| `components/filters.tsx`   | FilterBar, PeriodPicker, ChipFilter, SelectFilter, DateRangeFilter, MultiSelectFilter, SearchFilter, CompareToggle | `components/filters/`, `lib/filters/`, `shared/filterRegistry.tsx`, `shared/compare.tsx`                                                                                                            |
| `components/table.tsx`     | Table and Column (absent from the local source copy; see `data.tsx`)                                               | `components/tables/`, `lib/tables/`                                                                                                                                                                 |
| `components/charts.tsx`    | Series, Reference, Marker, TimeSeries, Bars, Donut, Waterfall, Intervals and chart helpers                         | `components/trends/`, `lib/trends/`, `components/comparison/`, `lib/comparison/`, `components/composition/`, `lib/composition/`, `components/shared/`, `shared/chartHelpers.ts`, `shared/trends.ts` |
| `components/data.tsx`      | Funnel, Cohorts, Column, Table, Heatmap, Leaderboard, Goal, SegmentedBar, KeyValues                                | `components/` and `lib/` under `flow/`, `relationships/`, `tables/`, `comparison/`, `metrics/`, `composition/`                                                                                      |
| `components/relations.tsx` | Flow, Scatter and scatter marks                                                                                    | `components/flow/`, `lib/flow/`, `components/relationships/`, `lib/relationships/`                                                                                                                  |
| `components/geo.tsx`       | GeoMap, PointMap and map assets                                                                                    | `components/maps/`, `lib/maps/`, `shared/atlas.ts`                                                                                                                                                  |

The local source copy has Table and Column in `components/data.tsx`, with no
`components/table.tsx`. It also has `components/specialized.tsx`: SmallMultiples and
StatusTimeline live in our `components/trends/` and `lib/trends/`; Distribution and
Dumbbell in `components/comparison/` and `lib/comparison/`; Treemap in
`components/composition/` and `lib/composition/`.

## Copying a fix

Find the component by name. Markup and logic go to `components/<group>/<Name>/`;
schema and description go to `lib/<group>/<Name>/`.

A CSS rule goes to the styles file that owns its class. Rename `--pdk-` to
`--openui-dashboard-` and `pdk-` to `openui-dashboard-`. A changed CSS block changes
its pinned class in `tests/dashboard-library/styleOrder.test.ts`. A changed
description changes the prompt snapshot.
