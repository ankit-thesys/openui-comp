// Copied from preview/src/catalog.ts in dashboards-ui-library-src.
import type { ComponentDoc, RenderFixture } from "./catalog";

const card = (inner: string) => `root = Dashboard([Section("", [Row([${inner}])])])`;

export const tablesCatalog: ComponentDoc[] = [
  {
    slug: "table",
    name: "Table & Column",
    group: "Tables",
    summary:
      "A sortable, paged table built from Column children. Thirteen column kinds: text, primary (bold), number, bar (a number with an inline bar), delta (signed change), badge (status), sparkline, chip (a category), date, progress (toward 100%), states (a status dot per period), link and person (a name with an avatar). totals adds a sum or average row, and search takes a SearchFilter’s $variable.",
    components: ["Table", "Column"],
    notes: {
      "Table.columns": "left to right",
      "Table.pageSize": "default 10",
      "Table.totals": "a totals row for Columns that set total",
      "Table.search": "the text to keep matching rows for",
      "Table.groupBy": "a column label; rows group under its values with a count",
      "Column.label": "the header",
      "Column.values": "one per row; arrays for sparklines and states",
      "Column.kind": "how the cells draw; default text",
      "Column.tones": "a badge colour per value",
      "Column.goodWhen": "colours delta cells",
      "Column.total": "only for amounts",
    },
    // The specimen is built by its controls (controls.ts); this program stays as the default.
    variants: [
      {
        title: "Default",
        note: "Tick a column to see its kind; Totals sums spend and signups.",
        program: card(
          String.raw`Card("Campaigns", [Table([Column("Campaign", ["Brand search", "Competitor terms", "LinkedIn ABM", "Retargeting", "Webinar promo", "Product Hunt"], "primary"), Column("Status", ["Active", "Active", "Learning", "Active", "Paused", "Ended"], "badge", null, {"Active": "good", "Learning": "info", "Paused": "warning", "Ended": "neutral"}), Column("Spend", [12400, 18900, 22100, 6200, 4800, 0], "number", "currency", null, null, "sum"), Column("Signups", [612, 401, 188, 290, 140, 820], "bar", "number", null, null, "sum"), Column("CAC", [20.3, 47.1, 117.6, 21.4, 34.3, null], "number", "currency-precise", null, "down"), Column("Δ conv.", [1.2, -0.8, 0.4, 2.1, -1.4, 0], "delta", "percent"), Column("Trend", [[40, 44, 51, 49, 58, 61], [32, 30, 35, 33, 29, 31], [10, 12, 14, 18, 17, 21], [20, 22, 25, 24, 28, 30], [18, 16, 12, 9, 6, 4], [0, 0, 120, 410, 220, 70]], "sparkline")], 10, true)], "full", "Last 30 days")`,
        ),
      },
    ],
  },
  {
    slug: "keyvalues",
    name: "KeyValues",
    group: "Metrics",
    summary:
      "Label/value fact rows with optional change: the quiet way to show account facts, settings, or anything read as a list.",
    components: ["KeyValues"],
    notes: {
      rows: "one fact per row; value is a number or text, and format, previous and goodWhen apply to numbers",
    },
    variants: [
      {
        title: "Default",
        program: card(
          String.raw`Card("Account facts", [KeyValues([KeyValue("Active accounts", 2847, "number", 2701), KeyValue("Average contract", 14400, "currency", 13800), KeyValue("Seats per account", 11.4, "number", 10.9), KeyValue("Net revenue retention", 108.4, "percent", 107.8), KeyValue("Owner", "Revenue team")])], "half", "Workspace · today")`,
        ),
      },
    ],
  },
  {
    slug: "goal",
    name: "Goal",
    group: "Metrics",
    summary:
      'Progress toward a target. pace (0–1) marks how far through the period you are, so the bar reads ahead or behind. goodWhen "down" turns the target into a ceiling. Stack several in one Card.',
    components: ["Goal"],
    notes: {
      previous:
        "where it stood at this point last period: a grey tick on the track while compare is on",
      pace: "0 to 1, how far through the period you are",
      goodWhen: '"down" makes the target a ceiling',
    },
    variants: [
      {
        title: "Default",
        note: "Targets read ahead or behind pace; limits read within or over.",
        program: card(
          String.raw`Card("Q4 targets", [Goal("New ARR", 1840000, 2500000, "currency-compact", 0.62), Goal("Activation rate", 36.2, 40, "percent", 0.62), Goal("p95 query latency", 420, 500, "ms", null, "down"), Goal("Logo churn", 2.3, 2, "percent", null, "down")], "half", "62% through the quarter")`,
        ),
      },
    ],
  },
];

export const tablesFixtures: RenderFixture[] = [
  { name: "Table", program: tablesCatalog[0]!.variants[0]!.program, text: "Brand search" },
  { name: "Column", program: tablesCatalog[0]!.variants[0]!.program, text: "$12,400" },
  { name: "KeyValues", program: tablesCatalog[1]!.variants[0]!.program, text: "Revenue team" },
  { name: "Goal", program: tablesCatalog[2]!.variants[0]!.program, text: "Within limit" },
];
