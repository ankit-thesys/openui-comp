import { library } from "@openuidev/dashboard-library";
import { createParser } from "@openuidev/react-lang";

/** His complete registration list (dashboards-ui-library/src/library.ts). */
export const HIS_COMPONENTS = [
  "Dashboard",
  "FilterBar",
  "PeriodPicker",
  "DateRangeFilter",
  "MultiSelectFilter",
  "SearchFilter",
  "ChipFilter",
  "SelectFilter",
  "CompareToggle",
  "Section",
  "Row",
  "Kpis",
  "Kpi",
  "Card",
  "Stat",
  "TimeSeries",
  "Series",
  "Reference",
  "Marker",
  "SmallMultiples",
  "Bars",
  "Dumbbell",
  "Distribution",
  "Donut",
  "SegmentedBar",
  "Treemap",
  "Waterfall",
  "Intervals",
  "StatusTimeline",
  "Flow",
  "Scatter",
  "GeoMap",
  "PointMap",
  "Funnel",
  "Cohorts",
  "Heatmap",
  "Table",
  "Column",
  "Leaderboard",
  "Goal",
  "KeyValues",
];

/** Read materialized nodes, so a mention in source that the parser drops cannot count. */
export function catalogComponents(program: string): Set<string> {
  const result = createParser(library.toJSONSchema(), "Dashboard").parse(program);
  if (
    !result.root ||
    result.meta.errors.length ||
    result.meta.incomplete ||
    result.meta.unresolved.length
  ) {
    throw new Error(`Invalid catalog fixture: ${JSON.stringify(result.meta)}`);
  }
  const names = new Set<string>();
  function visit(value: unknown) {
    if (!value || typeof value !== "object") return;
    if ("typeName" in value && typeof value.typeName === "string") names.add(value.typeName);
    for (const child of Object.values(value)) visit(child);
  }
  visit(result.root);
  return names;
}
