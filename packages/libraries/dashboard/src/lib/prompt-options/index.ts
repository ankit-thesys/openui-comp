import type { ComponentGroup, PromptOptions } from "@openuidev/react-lang";
import { FORMAT_PRESETS } from "../../shared/format";
import { WIDTHS } from "../../shared/schema";
import { isRegistered } from "../defineComponents";
import { examples } from "./examples";

/**
 * His prompt groups and notes (library.ts), written out in full once. A group shows only the
 * components registered so far and is left out while it has none, and a note that names
 * components not registered yet waits for them. Once every group ticket has landed the prompt
 * is his, word for word, and no group ticket needs to edit this file.
 */
type Note = string | { text: string; needs: string[] } | (() => string | null);

type PromptGroup = { name: string; components: string[]; notes: Note[] };

const all = (names: string[]) => names.every(isRegistered);

/** "Give previous-period values wherever they exist (…)": lists only components that exist. */
function previousValuesNote() {
  const takers = ["Kpi", "Stat", "Series", "Funnel", "Leaderboard", "GeoMap"].filter(isRegistered);
  const toggle = isRegistered("CompareToggle") ? " and add a CompareToggle" : "";
  return `Give previous-period values wherever they exist (${takers.join(", ")})${toggle}.`;
}

/** Story order: his text once trends and tables exist; until then, without them. */
function storyOrderNote() {
  const tail = all(["TimeSeries", "Table"])
    ? "then trends, then breakdowns, then detail tables"
    : "then Rows of Cards";
  return `Story order: a lead Section with one Kpis strip of 3–6 headline numbers, ${tail}. Don't size Kpis: the strip lays them out. A number that needs a chart beside it is a Card with a Stat.`;
}

const PROMPT_GROUPS: PromptGroup[] = [
  {
    name: "Structure",
    components: ["Dashboard", "Section", "Row", "Card"],
    notes: [
      `Shared argument types: Format = ${FORMAT_PRESETS.map((preset) => `"${preset}"`).join(" | ")}, or {type, currency?, decimals?, prefix?, suffix?} to override, e.g. {type: "number", suffix: " seats"}. Width = ${WIDTHS.map((width) => `"${width}"`).join(" | ")}. GoodWhen = "up" | "down" | "neutral": which direction of change is good news.`,
      'Numbers are raw with a Format; never formatted strings like "$1.2K" or "12%". percent values are already percentages (18.4 = 18.4%); ratio is for fractions; duration is seconds, ms milliseconds, days days. A Kpi\'s text value is for words (a plan, a status, a version), never a number.',
      {
        text: 'Live data tools return { columns, rows, truncated }, rows being objects keyed by column. Read one column across all rows with a pluck: r = Query(...) then TimeSeries(r.rows.day, [Series("Events", r.rows.events)]). Ask a query for exactly the rows and columns a card shows.',
        needs: ["TimeSeries", "Series"],
      },
      'To skip an optional argument before one you need, pass null: Kpi("Signups", 2227, "number", null, null, "Last 30 days").',
      storyOrderNote,
      "Rows hold Cards only; their widths add up to a full row.",
      {
        text: "Charts are grouped below by the question they answer: Trends (over time), Comparison (across categories), Composition (part of a whole), Flow (between stages), Relationships (two measures or axes), Maps (by place). Pick the group by the question, then the chart. One unit per chart (no dual axes); split different units into separate charts.",
        needs: ["TimeSeries", "Bars", "Donut", "Funnel", "Scatter", "GeoMap"],
      },
    ],
  },
  {
    name: "Filters",
    components: [
      "FilterBar",
      "PeriodPicker",
      "DateRangeFilter",
      "ChipFilter",
      "SelectFilter",
      "MultiSelectFilter",
      "SearchFilter",
      "CompareToggle",
    ],
    notes: [
      "One FilterBar first, for dashboard-wide filters only: date filter first, then segments several cards read (plan, region), then CompareToggle, and SearchFilter last.",
      "A switch that changes only one card, such as what it's broken down by (channel or referring domain; device, browser or OS) or which metric it plots, belongs in that Card's controls, not the FilterBar. Its $variable feeds only that card's Query or data.",
      'A filter must change what is shown, but only cards whose numbers depend on it read it; point-in-time or cross-segment cards can ignore it. Declare $period = "30d" and pass $period to the filter. With live data, pass the $variable into the data tool\'s arguments so the Query reloads when it changes. With data written into the program, key values by option: data[$period].mrr (nest keys for two filters: data[$period][$channel].signups).',
    ],
  },
  {
    name: "Metrics",
    components: ["Kpis", "Kpi", "Stat", "KeyValues", "Goal"],
    notes: [
      previousValuesNote,
      'Set goodWhen "down" for metrics where lower is better: costs, CAC, churn, latency, errors.',
    ],
  },
  {
    name: "Tables",
    components: ["Table", "Column"],
    notes: ["Table for several measures per row; Columns pick how each cell draws."],
  },
  // Charts are grouped by the question they answer, the same groups as the library's pages.
  {
    name: "Trends",
    components: ["TimeSeries", "Series", "Reference", "Marker", "SmallMultiples", "StatusTimeline"],
    notes: [
      'How a measure moves over time → TimeSeries (events → markers; share over time → stacked "percent"; projections → forecastFrom). Many series of one measure → SmallMultiples. Up, degraded or down per service over time → StatusTimeline.',
    ],
  },
  {
    name: "Comparison",
    components: ["Bars", "Leaderboard", "Dumbbell", "Distribution", "Intervals"],
    notes: [
      "Values across categories → Bars (variance around zero → diverging). A ranked top-N list to read → Leaderboard. Before → after per category → Dumbbell. Spread of values → Distribution. Estimates with uncertainty → Intervals.",
    ],
  },
  {
    name: "Composition",
    components: ["Donut", "SegmentedBar", "Treemap", "Waterfall"],
    notes: [
      "Part of a whole → Donut when the total is the headline, SegmentedBar for a compact strip; both take up to 8 parts. Treemap for many or nested parts. How a total moved → Waterfall.",
    ],
  },
  {
    name: "Flow",
    components: ["Funnel", "Flow"],
    notes: [
      "Ordered conversion steps → Funnel; start it at the first meaningful step (signup started), not raw traffic, and show traffic as a Kpi. Paths between stages → Flow.",
    ],
  },
  {
    name: "Relationships",
    components: ["Scatter", "Heatmap", "Cohorts"],
    notes: [
      "Two measures per item → Scatter. Magnitude across two categorical axes → Heatmap. Retention by cohort → Cohorts.",
    ],
  },
  {
    name: "Maps",
    components: ["GeoMap", "PointMap"],
    notes: ["By country or US state → GeoMap. At places such as stores or cities → PointMap."],
  },
];

function noteText(note: Note): string | null {
  if (typeof note === "string") return note;
  if (typeof note === "function") return note();
  return all(note.needs) ? note.text : null;
}

/**
 * Rules for generating a dashboard, beyond the notes on each component group. The base
 * openui-lang prompt is written for any library and names components this one doesn't have
 * (Button, Select, forms); these rules say what a dashboard is made of instead, and cover the
 * mistakes that make a card come out empty.
 */
export const additionalRules: string[] = [
  "Dashboard holds an optional FilterBar first, then Sections. A Section holds Kpis strips and Rows. A Row holds Cards. Every chart, map, Table, Stat, Goal and KeyValues goes inside a Card's content, never straight into a Row or a Section.",
  "Use only the components listed under Component Signatures. This library has no Button, Select, SelectItem, Input, Form, FormControl, Tabs or text and markdown blocks, whatever other sections of these instructions mention. A choice the reader makes is a filter: PeriodPicker, DateRangeFilter, ChipFilter, SelectFilter, MultiSelectFilter, SearchFilter or CompareToggle. Words that explain a number go in a Card's subtitle or a Section's description.",
  "A dashboard only shows data. Never write a Mutation, a form or a refresh button.",
  "Arrays that go together have the same length and order: labels with values, a Series' values with its previous, every Column of one Table. Never write null for a value a component requires, such as a KeyValues row's value: leave that row or item out.",
  "Previous values are the same measure for the period before, in the same unit. When you don't have them, leave them out: never repeat the current values or invent a change.",
  "Without a data tool, write realistic, professional data into the program, and use only PeriodPicker, ChipFilter, SelectFilter and CompareToggle as filters. Give the data an entry for every option value, the default included, and read each number the filter changes from it: data[$period].revenue. DateRangeFilter and MultiSelectFilter need a data tool, because written values can't follow a free date range or several choices at once. SearchFilter only searches a Table: pass its $variable as that Table's search.",
  "With a data tool, load every number with Query. Pass each filter's $variable in the arguments of every Query it should change. Give each Query the default {rows: []}, never made-up numbers, and read its columns with a pluck: sales.rows.revenue. Sum or count rows with the built-in functions for headline numbers: @Sum(sales.rows.revenue).",
  'A Goal needs a target above 0. For a limit of zero, such as critical bugs or failed checks, show the count as a Kpi with goodWhen "down".',
  "Write the statements in this order: root, $variables, Queries, the FilterBar and Sections, then written-in data last.",
];

export { examples } from "./examples";

/**
 * Prompt options for the dashboard library: pass to `library.prompt(promptOptions)`, or spread
 * `examples` and `additionalRules` into your own options beside your own preamble.
 */
export const promptOptions: PromptOptions = {
  preamble: "You are generating an openui-lang dashboard.",
  examples,
  additionalRules,
  bindings: true,
};

/** The prompt groups for the components registered so far. */
export function promptGroups(): ComponentGroup[] {
  return PROMPT_GROUPS.flatMap((group) => {
    const components = group.components.filter(isRegistered);
    if (!components.length) return [];
    const notes = group.notes.map(noteText).filter((note): note is string => note !== null);
    return [{ name: group.name, components, notes }];
  });
}
