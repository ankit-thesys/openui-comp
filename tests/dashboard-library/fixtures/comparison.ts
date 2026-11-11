// Copied from preview/src/catalog.ts in dashboards-ui-library-src.
import type { ComponentDoc, RenderFixture } from "./catalog";
const card = (inner: string) => `root = Dashboard([Section("", [Row([${inner}])])])`;
export const PIPELINE = String.raw`["Qualified", "Discovery", "Proposal", "Negotiation", "Closed won"], [Series("Pipeline", [2400000, 1650000, 980000, 610000, 412000])], "currency-compact"`;
export const SOURCES = String.raw`["Organic search", "Direct", "Paid search", "Referral", "Social", "Email"], [8420, 6130, 3980, 2210, 1490, 870], "number", [7980, 6240, 3510, 2050, 1610, 790]`;
export const comparisonCatalog: ComponentDoc[] = [
  {
    slug: "bars",
    name: "Bars",
    group: "Comparison",
    summary:
      'Values across categories. Horizontal (default) suits long labels and rankings; vertical suits short labels and ordered buckets such as deal sizes. For one measure over time, use TimeSeries with type "bar" instead. Horizontal single-series bars print their value at the bar’s end.',
    components: ["Bars"],
    notes: {
      labels: "the categories",
      series: "one Series per measure; several group side by side, or stack",
      orientation: "default horizontal",
      stacked: '"percent" shows each part’s share',
      goodWhen: "colours the change in the tooltip when series carry previous",
      references: "e.g. a 1.0x break-even",
      diverging: "[above, below] labels; colours one series by sign around zero",
    },
    // The specimen is built by its controls (controls.ts); this program stays as the default.
    variants: [
      {
        title: "Horizontal",
        program: card(
          String.raw`Card("Pipeline by stage", [Bars(${PIPELINE})], "full", "Open pipeline value")`,
        ),
      },
    ],
  },
  {
    slug: "leaderboard",
    name: "Leaderboard",
    group: "Comparison",
    summary:
      "A ranked list with inline bars and change vs previous: top channels, pages, campaigns. Sorted for you; a long list scrolls inside the card.",
    components: ["Leaderboard"],
    notes: {
      previous: "draws the change",
      limit: "keep only the top N; by default every item shows, scrolling inside the card",
    },
    // The specimen is built by its controls (controls.ts); this program stays as the default.
    variants: [
      {
        title: "Default",
        program: card(
          String.raw`Card("Top sources", [Leaderboard(${SOURCES})], "half", "Visitors · last 30 days")`,
        ),
      },
    ],
  },
  {
    slug: "dumbbell",
    name: "Dumbbell",
    group: "Comparison",
    summary:
      "Two values per category joined by a line (before and after) so you see who moved and how far. Reads better than paired bars past a handful of categories.",
    components: ["Dumbbell"],
    notes: {
      beforeLabel: "names the first point",
      afterLabel: "names the second",
      goodWhen:
        'colours the line by which way it moved: default "up"; "down" when a fall is good; "neutral" compares two groups in the series colour',
    },
    variants: [
      {
        title: "Default",
        program: card(
          String.raw`Card("Win rate by segment", [Dumbbell(["Enterprise", "Mid-market", "SMB", "Self-serve", "Partners", "Public sector"], [24.1, 27.8, 31.2, 18.4, 22.0, 15.6], [27.4, 26.1, 35.0, 21.9, 28.3, 14.2], "percent", "Last quarter", "This quarter")], "full", "Last quarter to this quarter")`,
        ),
      },
    ],
  },
  {
    slug: "distribution",
    name: "Distribution",
    group: "Comparison",
    summary:
      "Spread, not just the average: a box plot per category: whiskers min to max, box the middle 50%, line the median.",
    components: ["Distribution"],
    notes: {
      mins: "whisker bottoms",
      q1s: "box bottoms",
      medians: "the line in the box",
      q3s: "box tops",
      maxes: "whisker tops",
    },
    // One example: Distribution has no visual options, so tabs would only swap data.
    variants: [
      {
        title: "Default",
        program: card(
          String.raw`Card("Response time by endpoint", [Distribution(["/search", "/checkout", "/login", "/feed", "/orders", "/profile", "/cart", "/reports"], [12, 40, 8, 20, 18, 9, 15, 64], [38, 120, 22, 55, 46, 24, 41, 180], [62, 180, 35, 90, 71, 38, 66, 290], [110, 260, 51, 150, 118, 61, 104, 470], [480, 920, 210, 620, 540, 260, 410, 1480], "ms")], "full", "Last 24 hours")`,
        ),
      },
    ],
  },
  {
    slug: "intervals",
    name: "Intervals",
    group: "Comparison",
    summary:
      "Estimates with confidence intervals, a forest plot. An interval clear of the baseline is a clear effect: green when better, red when worse, by goodWhen. Intervals that cross it stay grey.",
    components: ["Intervals"],
    notes: {
      estimates: "the point estimate per label",
      lows: "interval bottoms",
      highs: "interval tops",
      baseline: "default 0",
      baselineLabel: 'default "No effect"; named in a chip on the baseline',
      goodWhen: 'which side of the baseline is better; default "up"',
    },
    // The specimen is built by its controls (controls.ts); this program stays as the default.
    variants: [
      {
        title: "Default",
        program: card(
          String.raw`Card("Experiment lift", [Intervals(["Checkout express", "Pricing page v3", "Onboarding tips", "Annual nudge", "Shorter signup form", "Referral reward"], [6.8, 1.2, 3.9, -3.4, 9.7, 12.3], [3.1, -1.5, 0.4, -5.9, 5.2, 4.0], [10.5, 3.9, 7.4, -0.9, 14.2, 20.6], "percent")], "full", "Conversion lift · 95% CI")`,
        ),
      },
    ],
  },
];
export const comparisonFixtures: RenderFixture[] = comparisonCatalog.map((entry, i) => ({
  name: entry.name,
  program: entry.variants[0]!.program,
  text: ["Pipeline", "Organic search", "Enterprise", "/search", "Checkout express"][i]!,
}));
