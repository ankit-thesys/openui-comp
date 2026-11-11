// Copied from preview/src/catalog.ts in dashboards-ui-library-src.
import type { ComponentDoc, RenderFixture } from "./catalog";
import { metricCatalog } from "./metrics";

export const card = (inner: string) => `root = Dashboard([Section("", [Row([${inner}])])])`;
export const W = `w = ["Aug 10", "Aug 17", "Aug 24", "Aug 31", "Sep 7", "Sep 14", "Sep 21", "Sep 28", "Oct 5", "Oct 12", "Oct 19", "Oct 26"]`;

const REGIONS = String.raw`[Series("North East", [420, 440, 432, 431, 457, 469, 459, 468, 495, 498, 490, 509]), Series("South East", [369, 373, 367, 385, 407, 405, 404, 429, 445, 440, 448, 475]), Series("Midwest", [308, 298, 299, 316, 317, 307, 315, 330, 326, 319, 333, 343]), Series("South West", [261, 261, 278, 293, 292, 298, 319, 330, 328, 341, 363, 370]), Series("Mountain", [137, 143, 155, 159, 160, 171, 182, 185, 189, 203, 213, 215]), Series("Pacific NW", [175, 185, 190, 185, 187, 198, 199, 195, 201, 211, 209, 207]), Series("California", [516, 539, 527, 514, 536, 550, 532, 530, 556, 559, 539, 549]), Series("Texas", [387, 398, 392, 408, 435, 439, 437, 462, 485, 484, 491, 521])]`;

const SERVICES = String.raw`["API", "Web app", "Search", "Payments", "Webhooks"], [["up", "up", "up", "up", "up", "up", "up", "degraded", "up", "up", "up", "up", "up", "up", "up", "up", "degraded", "up", "up", "up", "up", "up", "up", "up", "up", "degraded", "up", "up", "up", "up"], ["up", "up", "up", "up", "up", "up", "up", "up", "degraded", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "degraded", "up", "up", "up", "up", "up", "up"], ["up", "up", "up", "up", "up", "up", "up", "up", "up", "degraded", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "degraded"], ["", "", "", "up", "up", "up", "up", "degraded", "up", "up", "up", "up", "up", "up", "up", "up", "down", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up"], ["up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "up", "degraded", "up", "up", "up"]], ["Oct 1", "Oct 2", "Oct 3", "Oct 4", "Oct 5", "Oct 6", "Oct 7", "Oct 8", "Oct 9", "Oct 10", "Oct 11", "Oct 12", "Oct 13", "Oct 14", "Oct 15", "Oct 16", "Oct 17", "Oct 18", "Oct 19", "Oct 20", "Oct 21", "Oct 22", "Oct 23", "Oct 24", "Oct 25", "Oct 26", "Oct 27", "Oct 28", "Oct 29", "Oct 30"]`;

export const trendsCatalog: ComponentDoc[] = [
  {
    slug: "timeseries",
    name: "TimeSeries",
    group: "Trends",
    summary:
      "A metric over time. Line (default) for rates, area for volumes (stacked when the parts make a whole) and bars for counts per period. One unit per chart; mix marks only within the same unit.",
    components: ["TimeSeries"],
    notes: {
      labels: "the time axis",
      series: "one per line, area or set of bars",
      type: "default line",
      stacked: '"percent" shows each part’s share',
      references: "target or SLO lines",
      goodWhen: "colours tooltip deltas",
      markers: "events on the time axis",
      curve: "default smooth; step for values that change in steps",
      forecastFrom: "the first projected label; dashed and shaded from there",
    },
    // The specimen is built by its controls (controls.ts); this one program stays as the type's default.
    variants: [
      {
        title: "Line",
        program: card(
          String.raw`Card("Conversion rate", [TimeSeries(["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"], [Series("Trial → paid", [15.1, 15.9, 16.4, 17.1, 17.9, 18.4], [14.0, 14.6, 15.0, 15.2, 15.8, 16.1])], "line", "percent")], "full", "Monthly")`,
        ),
      },
    ],
  },
  {
    slug: "smallmultiples",
    name: "SmallMultiples",
    group: "Trends",
    summary:
      "A grid of small charts, one per series, all on one shared scale: the answer when lines would tangle or there are more than 8 series of the same measure.",
    components: ["SmallMultiples"],
    notes: {
      labels: "the shared time axis",
      series: "one panel each",
      type: "default area",
      columns: "fix the grid; default fits panels of about 180px",
    },
    variantsLabel: "Type",
    variants: [
      {
        title: "Line",
        program: String.raw`${W}
root = Dashboard([Section("", [Row([Card("Signups by region", [SmallMultiples(w, ${REGIONS}, "line", "number")], "full", "Weekly")])])])`,
      },
      {
        title: "Area",
        program: String.raw`${W}
root = Dashboard([Section("", [Row([Card("Signups by region", [SmallMultiples(w, ${REGIONS}, "area", "number")], "full", "Weekly")])])])`,
      },
    ],
  },
  {
    slug: "statustimeline",
    name: "StatusTimeline",
    group: "Trends",
    summary:
      "Up, degraded or down per service over time, one strip per row, with uptime on the right. Status colours, each named in the legend.",
    components: ["StatusTimeline"],
    notes: {
      labels: "services",
      states: '"up", "degraded", "down" or "" per period',
      periods: "labels the cells",
    },
    variants: [
      {
        title: "Default",
        program: card(
          String.raw`Card("Service status", [StatusTimeline(${SERVICES})], "full", "Daily · last 30 days")`,
        ),
      },
    ],
  },
];
export const trendsFixtures: RenderFixture[] = trendsCatalog.flatMap((entry) =>
  entry.variants.map((variant) => ({
    name: `${entry.name} ${variant.title}`,
    program: variant.program,
    text:
      entry.name === "TimeSeries"
        ? "18.4%"
        : entry.name === "SmallMultiples"
          ? "North East"
          : "Uptime",
  })),
);
trendsFixtures.push({
  name: "Stat with TimeSeries",
  program: metricCatalog[1]!.variants[0]!.program,
  text: "18.4K",
});

// Additional specimens for the rendering paths selected by the catalog's controls.
export const timeSeriesProgram = (
  type = "line",
  stacked: boolean | "percent" = false,
  forecast = false,
) =>
  card(
    `Card("Revenue", [TimeSeries(["Jun", "Jul", "Aug", "Sep"], [Series("Sales", [10, 20, 30, 40], [8, 16, 24, 32]), Series("Services", [5, 10, 15, 20], [4, 8, 12, 16])], "${type}", "currency", ${JSON.stringify(stacked)}, [Reference("Target", 25)], "up", [Marker("Launch", "Jul")], "linear", ${forecast ? '"Aug"' : "null"})], "full")`,
  );
for (const [name, type, stacked, forecast] of [
  ["Area", "area", false, false],
  ["Stacked", "area", true, false],
  ["Percent stacked", "area", "percent", false],
  ["Forecast", "line", false, true],
  ["Bars", "bar", false, false],
] as const) {
  trendsFixtures.push({ name, program: timeSeriesProgram(type, stacked, forecast), text: "Sales" });
}
