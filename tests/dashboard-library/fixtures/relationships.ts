import type { ComponentDoc, RenderFixture } from "./catalog";

export const card = (inner: string) => `root = Dashboard([Section("", [Row([${inner}])])])`;

const ACCOUNTS = [
  ["Acme", 84, 48000, 1200, "Enterprise"],
  ["Globex", 61, 39000, 860, "Enterprise"],
  ["Hooli", 90, 52000, 1480, "Enterprise"],
  ["Initech", 72, 21000, 420, "Business"],
  ["Umbrella", 44, 16500, 310, "Business"],
  ["Stark", 38, 9800, 120, "Team"],
  ["Wayne", 52, 12400, 160, "Team"],
] as const;
export const accountPoints = () => {
  const column = (index: number) => JSON.stringify(ACCOUNTS.map((row) => row[index]));
  return `${column(0)}, ${column(1)}, ${column(2)}`;
};
export const accountSizes = JSON.stringify(ACCOUNTS.map((row) => row[3]));
export const accountGroups = JSON.stringify(ACCOUNTS.map((row) => row[4]));

export const ACTIVITY = String.raw`["Mon", "Mon", "Mon", "Mon", "Mon", "Mon", "Mon", "Mon", "Tue", "Tue", "Tue", "Tue", "Tue", "Tue", "Tue", "Tue", "Wed", "Wed", "Wed", "Wed", "Wed", "Wed", "Wed", "Wed", "Thu", "Thu", "Thu", "Thu", "Thu", "Thu", "Thu", "Thu", "Fri", "Fri", "Fri", "Fri", "Fri", "Fri", "Fri", "Fri", "Sat", "Sat", "Sat", "Sat", "Sat", "Sat", "Sat", "Sat", "Sun", "Sun", "Sun", "Sun", "Sun", "Sun", "Sun", "Sun"], ["12a", "3a", "6a", "9a", "12p", "3p", "6p", "9p", "12a", "3a", "6a", "9a", "12p", "3p", "6p", "9p", "12a", "3a", "6a", "9a", "12p", "3p", "6p", "9p", "12a", "3a", "6a", "9a", "12p", "3p", "6p", "9p", "12a", "3a", "6a", "9a", "12p", "3p", "6p", "9p", "12a", "3a", "6a", "9a", "12p", "3p", "6p", "9p", "12a", "3a", "6a", "9a", "12p", "3p", "6p", "9p"], [12, 8, 31, 120, 142, 128, 74, 30, 11, 7, 33, 126, 151, 133, 79, 33, 13, 9, 35, 131, 149, 136, 81, 31, 12, 8, 32, 124, 147, 130, 77, 32, 10, 7, 28, 109, 121, 98, 55, 27, 9, 6, 12, 34, 52, 49, 41, 26, 8, 6, 10, 29, 44, 43, 39, 25], "compact"`;

export const relationshipsCatalog: ComponentDoc[] = [
  {
    slug: "scatter",
    name: "Scatter",
    group: "Relationships",
    summary:
      "Two measures per item, optionally sized by a third and split into up to eight groups; past eight, the smallest fold into Other. Up to ten points label themselves directly.",
    components: ["Scatter"],
    notes: {
      labels: "one per point, alongside xs and ys",
      sizes: "scales each dot",
      groups: "colours up to 8, the rest fold into Other",
      xLabel: "the x axis name",
      yLabel: "the y axis name",
      xFormat: "how x values read, on the axis and in the tooltip",
      yFormat: "how y values read, on the axis and in the tooltip",
      references: 'axis "x" draws a vertical line',
      sizeLabel: 'names what size measures, in the size key and tooltip; default "Size"',
      quadrants:
        "four corner names: top left, top right, bottom left, bottom right; shown with an x and a y reference",
    },
    // The specimen is built by its controls (controls.ts); this program stays as the default.
    variants: [
      {
        title: "Sized",
        program: card(
          String.raw`Card("Accounts by usage and spend", [Scatter(${accountPoints()}, "Weekly active %", "ACV", "percent", "currency-compact", ${accountSizes})], "full", "Sized by seats")`,
        ),
      },
    ],
  },
  {
    slug: "cohorts",
    name: "Cohorts",
    group: "Relationships",
    summary:
      "The retention grid: each cell is the share of its cohort still active in its period, null for periods not reached. Colour scales over the non-trivial cells so period 0 doesn’t flatten the ramp.",
    components: ["Cohorts"],
    notes: {
      showValues:
        "opens the header’s Show switch on view instead of None, so the cells print from the start",
      view: '"percent" (default) or "people" (Count): what the cells print when showValues is on',
      cohorts: "row labels",
      sizes: "people in each cohort, repeated per cell",
      periods: '"W0", "W1", …',
      values: "one value per cell, null for periods not reached",
      format: "default percent",
    },
    variants: [
      {
        title: "Default",
        program: card(
          String.raw`Card("Weekly retention", [Cohorts(["Aug 10", "Aug 10", "Aug 10", "Aug 10", "Aug 10", "Aug 10", "Aug 17", "Aug 17", "Aug 17", "Aug 17", "Aug 17", "Aug 17", "Aug 24", "Aug 24", "Aug 24", "Aug 24", "Aug 24", "Aug 24", "Aug 31", "Aug 31", "Aug 31", "Aug 31", "Aug 31", "Aug 31", "Sep 7", "Sep 7", "Sep 7", "Sep 7", "Sep 7", "Sep 7", "Sep 14", "Sep 14", "Sep 14", "Sep 14", "Sep 14", "Sep 14"], ["W0", "W1", "W2", "W3", "W4", "W5", "W0", "W1", "W2", "W3", "W4", "W5", "W0", "W1", "W2", "W3", "W4", "W5", "W0", "W1", "W2", "W3", "W4", "W5", "W0", "W1", "W2", "W3", "W4", "W5", "W0", "W1", "W2", "W3", "W4", "W5"], [100, 42.2, 33.7, 30.1, 27.9, 25.9, 100, 42.1, 34.5, 30.8, 27.7, null, 100, 42.8, 35.1, 30.6, null, null, 100, 43.4, 34.9, null, null, null, 100, 43.3, null, null, null, null, 100, null, null, null, null, null], [690, 690, 690, 690, 690, 690, 705, 705, 705, 705, 705, 705, 722, 722, 722, 722, 722, 722, 735, 735, 735, 735, 735, 735, 748, 748, 748, 748, 748, 748, 731, 731, 731, 731, 731, 731])], "full", "Active share per cohort")`,
        ),
      },
      {
        title: "Monthly",
        program: card(
          String.raw`Card("Monthly retention", [Cohorts(["Jun", "Jun", "Jun", "Jun", "Jun", "Jun", "Jul", "Jul", "Jul", "Jul", "Jul", "Jul", "Aug", "Aug", "Aug", "Aug", "Aug", "Aug", "Sep", "Sep", "Sep", "Sep", "Sep", "Sep", "Oct", "Oct", "Oct", "Oct", "Oct", "Oct", "Nov", "Nov", "Nov", "Nov", "Nov", "Nov"], ["M0", "M1", "M2", "M3", "M4", "M5", "M0", "M1", "M2", "M3", "M4", "M5", "M0", "M1", "M2", "M3", "M4", "M5", "M0", "M1", "M2", "M3", "M4", "M5", "M0", "M1", "M2", "M3", "M4", "M5", "M0", "M1", "M2", "M3", "M4", "M5"], [100, 61.2, 52.4, 48.1, 45.6, 44.0, 100, 62.8, 53.9, 49.2, 46.7, null, 100, 63.1, 54.6, 50.3, null, null, 100, 64.4, 55.2, null, null, null, 100, 65.0, null, null, null, null, 100, null, null, null, null, null], [2840, 2840, 2840, 2840, 2840, 2840, 2910, 2910, 2910, 2910, 2910, 2910, 3020, 3020, 3020, 3020, 3020, 3020, 3110, 3110, 3110, 3110, 3110, 3110, 3180, 3180, 3180, 3180, 3180, 3180, 3240, 3240, 3240, 3240, 3240, 3240])], "full", "Active share per cohort")`,
        ),
      },
    ],
  },
  {
    slug: "heatmap",
    name: "Heatmap",
    group: "Relationships",
    summary:
      "Magnitude across two categorical axes; weekday by hour is the classic. A Show switch in the header prints the cells as a count or a share, or nothing.",
    components: ["Heatmap"],
    notes: {
      rows: "the row label per cell",
      columns: "the column axis",
      values: "values[r][c], null for no data",
      showValues:
        "opens the header’s Show switch on view instead of None, so the cells print from the start",
      midpoint: "a two-pole scale around this value, e.g. 0 for change",
      view: '"count" (default), "total" or "row": the reading the grid colours by, and prints once showValues is on',
    },
    // The specimen is built by its controls (controls.ts); this program stays as the default.
    variants: [
      {
        title: "Default",
        program: card(
          String.raw`Card("Activity by hour", [Heatmap(${ACTIVITY})], "full", "Sessions · local time")`,
        ),
      },
    ],
  },
];

export const relationshipsFixtures: RenderFixture[] = [
  { name: "Scatter", program: relationshipsCatalog[0]!.variants[0]!.program, text: "Acme" },
  { name: "Cohorts", program: relationshipsCatalog[1]!.variants[0]!.program, text: "All cohorts" },
  {
    name: "Cohorts monthly",
    program: relationshipsCatalog[1]!.variants[1]!.program,
    text: "Monthly retention",
  },
  {
    name: "Heatmap",
    program: relationshipsCatalog[2]!.variants[0]!.program,
    text: "Activity by hour",
  },
];
