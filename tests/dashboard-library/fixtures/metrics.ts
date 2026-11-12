// Copied from preview/src/catalog.ts in dashboards-ui-library-src.
import type { ComponentDoc, RenderFixture } from "./catalog";

const card = (inner: string) => `root = Dashboard([Section("", [Row([${inner}])])])`;
export const KPI_SET = [
  String.raw`Kpi("Revenue", 412600, "currency-compact", 398200, "up", null, Trend([356, 368, 384, 398, 412], [342, 351, 362, 375, 398]))`,
  String.raw`Kpi("Orders", 38400, "compact", 36200)`,
  String.raw`Kpi("Average order", 73.9, "currency", 73.2)`,
  String.raw`Kpi("Conversion", 3.1, "percent", 2.9)`,
  String.raw`Kpi("Return rate", 6.8, "percent", 7.4, "down")`,
  String.raw`Kpi("Sessions", 1240000, "compact", 1180000)`,
  String.raw`Kpi("Repeat rate", 31.2, "percent", 29.8)`,
  String.raw`Kpi("Stockouts", 3.2, "percent", 3.0, "down")`,
];
export const kpis = (n: number) =>
  `root = Dashboard([Section("", [Kpis([${KPI_SET.slice(0, n).join(", ")}])])])`;

export const metricCatalog: ComponentDoc[] = [
  {
    slug: "kpis",
    name: "Kpis & Kpi",
    group: "Metrics",
    summary:
      "The strip of headline tiles that lays itself out: up to six in a row, balanced rows when narrower (five becomes 3 + 2, never 4 + 1), and past six, compact items. A tile’s value is a number with its change, or a short text such as a status with a tone dot. A number tile can carry one small chart: a sparkline, progress to a target, a split of its total, or a status strip; pass it as a Trend, Progress, Split or States child. Don’t size the tiles, just list them.",
    components: ["Kpis", "Kpi"],
    notes: {
      "Kpis.items": "one or more tiles; past six they turn compact",
      "Kpi.value": "a number, or a short text such as a status, plan or version",
      "Kpi.format": "numbers only",
      "Kpi.previous": "draws the change; numbers only",
      "Kpi.goodWhen": "which direction of change reads green",
      "Kpi.hint": "a short line under the tile",
      "Kpi.chart":
        "one of Trend(values, previous?), Progress(target), Split(labels, values) or States(states)",
      "Kpi.tone": "text values only: the state dot after the word",
    },
    // The specimen is built by its controls (controls.ts); this program stays as the default.
    variants: [{ title: "Default", program: kpis(4) }],
  },
  {
    slug: "stat",
    name: "Stat",
    group: "Metrics",
    summary:
      "The headline number at the top of a Card, with change vs previous. A number that needs a chart beside it is a Card with a Stat, not a Kpi.",
    components: ["Stat"],
    notes: {
      previous: "draws the change",
      goodWhen: "which direction of change reads green",
      label: 'a short label read inline after the number, e.g. "This week"',
    },
    // The specimen is built by its controls (controls.ts); this program stays as the default.
    variants: [
      {
        title: "Default",
        program: card(
          String.raw`Card("Weekly active users", [Stat(18420, "compact", 17210, null, "This week"), TimeSeries(["Sep 28", "Oct 5", "Oct 12", "Oct 19", "Oct 26", "Nov 2"], [Series("WAU", [16.1, 16.8, 17.2, 17.8, 18.1, 18.4])], "line", {type: "compact", suffix: "K"})], "half", "Unique users · weekly")`,
        ),
      },
    ],
  },
];

// The Stat catalog includes a TimeSeries. Preserve that entry above verbatim;
// render its Stat alone until the trends ticket provides TimeSeries and Series.
export const metricFixtures: RenderFixture[] = [
  ...[
    { name: "Progress", chart: "Progress(100)" },
    { name: "Split", chart: 'Split(["Online", "Stores"], [60, 40])' },
    { name: "States", chart: 'States(["good", "warning", "bad", null])' },
  ].map(({ name, chart }) => ({
    name: `Kpi with ${name}`,
    program: `root = Dashboard([Section("", [Kpis([Kpi("Capacity", 60, "number", null, null, null, ${chart})])])])`,
    text: "Capacity",
  })),
  { name: "Kpis", program: metricCatalog[0]!.variants[0]!.program, text: "$412.6K" },
  {
    name: "Kpi",
    program: `root = Dashboard([Section("", [Kpis([${KPI_SET[0]}])])])`,
    text: "$412.6K",
  },
  {
    name: "Stat",
    program: metricCatalog[1]!.variants[0]!.program.replace(
      ', TimeSeries(["Sep 28", "Oct 5", "Oct 12", "Oct 19", "Oct 26", "Nov 2"], [Series("WAU", [16.1, 16.8, 17.2, 17.8, 18.1, 18.4])], "line", {type: "compact", suffix: "K"})',
      "",
    ),
    text: "18.4K",
  },
];

export const metricsProgram = `root = Dashboard([
  Section("", [Kpis([
    Kpi("Revenue", 412600, "currency-compact", 398200, "up", "Last 30 days", Trend([356, 368, 384, 398, 412], [342, 351, 362, 375, 398])),
    Kpi("Latency", 238, "ms", 280, "down"),
    Kpi("Errors", 3.1, "percent", 2.9, "down"),
    Kpi("Capacity", 60, "percent", 55, "neutral")
  ])]),
  Section("Activity", [Row([Card("Weekly active users", [Stat(18420, "compact", 17210, "up", "This week")], "full")])])
])`;
