// Copied from preview/src/catalog.ts in dashboards-ui-library-src.
import type { ComponentDoc, RenderFixture } from "./catalog";
const card = (inner: string) => `root = Dashboard([Section("", [Row([${inner}])])])`;
const PRODUCTS = String.raw`["Alpine parka", "Puffer vest", "Rain shell", "Trail runner", "Chelsea boot", "Court sneaker", "Selvedge jean", "Relaxed jean", "Merino crew", "Cable cardigan", "Rib beanie", "Canvas tote", "Leather belt"], [912000, 241000, 188000, 534000, 392000, 210000, 418000, 166000, 281000, 143000, 59000, 87000, 64000]`;
const PRODUCT_GROUPS = String.raw`["Outerwear", "Outerwear", "Outerwear", "Footwear", "Footwear", "Footwear", "Denim", "Denim", "Knits", "Knits", "Knits", "Accessories", "Accessories"]`;
export const compositionCatalog: ComponentDoc[] = [
  {
    slug: "donut",
    name: "Donut",
    group: "Composition",
    summary:
      "Part of a whole with the total as the headline, up to eight parts; past eight, the smallest fold into a grey Other. For a compact strip of the same parts, use SegmentedBar.",
    components: ["Donut"],
    notes: {
      previous:
        "last period’s values, same order; with compare on, each part’s change in share shows in its tooltip, in points",
      labels: "up to eight; past that the smallest fold into a grey Other",
      centerLabel: "under the total",
    },
    // The specimen is built by its controls (controls.ts); this program stays as the default.
    variants: [
      {
        title: "Default",
        program: card(
          String.raw`Card("Revenue by channel", [Donut(["Direct", "Organic search", "Paid search", "Referral", "Email", "Social"], [184, 152, 118, 74, 61, 43], {type: "currency", suffix: "K"}, "Revenue")], "half", "Last 30 days")`,
        ),
      },
    ],
  },
  {
    slug: "segmentedbar",
    name: "SegmentedBar",
    group: "Composition",
    summary:
      "Part of a whole as one proportional bar with a legend of values and shares, up to eight parts before folding into Other.",
    components: ["SegmentedBar"],
    notes: {
      previous:
        "last period’s values, same order; with compare on, each part’s change in share shows in its tooltip, in points",
      labels: "up to eight; more fold into Other",
    },
    variants: [
      {
        title: "Default",
        program: card(
          String.raw`Card("Revenue by channel", [SegmentedBar(["Direct", "Organic search", "Paid search", "Referral", "Email", "Social"], [184, 152, 118, 74, 61, 43], {type: "currency", suffix: "K"})], "full", "Last 30 days")`,
        ),
      },
    ],
  },
  {
    slug: "waterfall",
    name: "Waterfall",
    group: "Composition",
    summary:
      "How a total moved: the first value is the starting total, the rest are signed changes, and the end total is computed. The axis zooms to where the total moves so changes stay readable.",
    components: ["Waterfall"],
    notes: {
      values: "the first is the start, the rest signed changes",
      endLabel: 'default "End"',
      goodWhen: '"down" for costs, so increases read red',
      subtotals: "labels drawn as the running total so far",
    },
    variantsLabel: "Good when",
    variants: [
      {
        title: "Higher",
        program: card(
          String.raw`Card("MRR bridge", [Waterfall(["Start", "New", "Expansion", "Contraction", "Churn"], [398200, 18400, 9100, -3800, -9300], "currency-compact", "End")], "full", "October")`,
        ),
      },
      {
        title: "Lower",
        note: "For costs, a decrease is the good outcome.",
        program: card(
          String.raw`Card("Cloud cost bridge", [Waterfall(["September", "Compute", "Storage", "Reserved savings", "Egress"], [184000, 22400, 6100, -18800, 3200], "currency-compact", "October", "down")], "full", "Cloud cost · October")`,
        ),
      },
      {
        title: "Neutral",
        note: "goodWhen neutral: changes in and out are neither good nor bad, so they share one grey.",
        program: card(
          String.raw`Card("Inventory bridge", [Waterfall(["Start", "Received", "Sold", "Returned", "Written off"], [12400, 3800, -4200, 600, -300], {type: "number", suffix: " units"}, "End", "neutral")], "full", "Units · October")`,
        ),
      },
    ],
  },
  {
    slug: "flow",
    name: "Flow",
    group: "Flow",
    summary:
      'A Sankey of a quantity moving between stages. Entry nodes take categorical colours, later steps the primary hue, and nodes named "Dropped", "Exited" or "Churned" draw grey. Keep to about four columns and fifteen nodes.',
    components: ["Flow"],
    notes: {
      from: "the source per link",
      to: "the destination per link",
      values: "the quantity per link",
      previous:
        "one per link adds each link’s and step’s change to the tooltips while compare is on",
    },
    variantsLabel: "Shape",
    variants: [
      {
        title: "Two stages",
        note: "Where each source ends up: the most common flow.",
        program: card(
          String.raw`Card("Channel outcomes", [Flow(["Organic search", "Organic search", "Paid social", "Paid social", "Direct", "Direct", "Referral", "Referral"], ["Signed up", "Exited", "Signed up", "Exited", "Signed up", "Exited", "Signed up", "Exited"], [2400, 11900, 900, 8600, 1500, 5100, 700, 1800], "compact")], "full", "Sessions · last 30 days")`,
        ),
      },
      {
        title: "Journey",
        program: card(
          String.raw`Card("Visitor journey", [Flow(["Organic search", "Organic search", "Paid social", "Paid social", "Direct", "Direct", "Pricing", "Pricing", "Docs", "Docs", "Signed up", "Signed up"], ["Pricing", "Docs", "Pricing", "Exited", "Pricing", "Docs", "Signed up", "Exited", "Signed up", "Exited", "Activated", "Dropped"], [8200, 6100, 5400, 4100, 3900, 2700, 6900, 10600, 3100, 5700, 5200, 4800], "compact")], "full", "Sessions · last 30 days")`,
        ),
      },
    ],
  },
  {
    slug: "funnel",
    name: "Funnel",
    group: "Flow",
    summary:
      "Ordered conversion steps scaled to the first, with step-to-step conversion and drop-off spelled out between bars. Start at the first meaningful step, not raw traffic; show traffic as a Kpi instead.",
    components: ["Funnel"],
    notes: {
      previous: "markers when compare is on",
      shape: '"bars" (default) or "funnel", a drawn funnel that falls back to bars when narrow',
      segments: "one Series per plan or channel, a value per step",
      basis: '"step" (default) or "start": which reading the switch opens on',
    },
    // The specimen is built by its controls (controls.ts); this program stays as the default.
    variants: [
      {
        title: "Default",
        program: card(
          String.raw`Card("Signup funnel", [Funnel(["Signup started", "Email verified", "Workspace created", "First project", "Invited teammate"], [14736, 11347, 8964, 5916, 2410], null, [13950, 10520, 8120, 5210, 2050])], "full", "Signups · last 30 days")`,
        ),
      },
    ],
  },
  {
    slug: "treemap",
    name: "Treemap",
    group: "Composition",
    summary:
      "Part to whole with many parts, or a hierarchy: area is size. Grouped, colour follows the parent; flat, one hue.",
    components: ["Treemap"],
    notes: {
      previous:
        "last period’s values, same order; with compare on, each item’s change in share shows in its tooltip, in points",
      values: "area is size",
      groups: "a parent per item; colour follows it",
    },
    variantsLabel: "Layout",
    variants: [
      {
        title: "Flat",
        program: card(
          String.raw`Card("Revenue by product", [Treemap(${PRODUCTS}, "currency-compact")], "full", "Last 30 days")`,
        ),
      },
      {
        title: "Grouped",
        program: card(
          String.raw`Card("Revenue by product", [Treemap(${PRODUCTS}, "currency-compact", null, ${PRODUCT_GROUPS})], "full", "By category · last 30 days")`,
        ),
      },
    ],
  },
];

export const compositionFixtures: RenderFixture[] = compositionCatalog.flatMap((entry) =>
  entry.variants.map((variant) => ({
    name: `${entry.name}: ${variant.title}`,
    program: variant.program,
    text: (
      {
        Donut: "$632K",
        SegmentedBar: "Direct",
        Waterfall: "Total",
        Flow: "Organic search",
        Funnel: "Signup started",
        Treemap: "Alpine parka",
      } as Record<string, string>
    )[entry.name]!,
  })),
);
