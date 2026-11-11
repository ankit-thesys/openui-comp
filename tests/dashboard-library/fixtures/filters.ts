// Copied from preview/src/catalog.ts in dashboards-ui-library-src.
import type { ComponentDoc, RenderFixture } from "./catalog";
export const filterCatalog: ComponentDoc[] = [
  {
    slug: "filterbar",
    name: "FilterBar",
    group: "Filters",
    summary:
      "The sticky row of dashboard-wide filters, first in the Dashboard. Order: the date filter, then segments several cards read. CompareToggle and SearchFilter sit together on the right, Search last. A switch that changes one card belongs in that Card’s controls instead.",
    components: ["FilterBar"],
    notes: {
      filters:
        "dashboard-wide only; the left side keeps the order written, Compare then Search go on the right",
    },
    variants: [
      {
        title: "Default",
        program: String.raw`$period = "30d"
$plan = "all"
$compare = "off"
root = Dashboard([FilterBar([PeriodPicker("period", [{value: "7d", label: "7D"}, {value: "30d", label: "30D"}, {value: "90d", label: "90D"}], $period), ChipFilter("plan", [{value: "all", label: "All plans"}, {value: "team", label: "Team"}, {value: "ent", label: "Enterprise"}], $plan, "Plan"), CompareToggle("Previous period", false, [{value: "prev", label: "Previous period"}, {value: "yoy", label: "Last year"}], "compare", $compare)])])`,
      },
    ],
  },
  {
    slug: "periodpicker",
    name: "PeriodPicker",
    group: "Filters",
    summary:
      "A segmented control for a few date presets. Its $variable keys written-in data, or feeds query arguments with live data. For longer preset lists or custom ranges, use DateRangeFilter.",
    components: ["PeriodPicker"],
    notes: {
      name: "the state variable it owns",
      options: 'the presets, e.g. {value: "7d", label: "7D"}',
      value: "the $variable it writes",
    },
    variantsLabel: "Options",
    variants: [
      {
        title: "2 options",
        program: String.raw`$period = "mtd"
root = Dashboard([FilterBar([PeriodPicker("period", [{value: "mtd", label: "Month to date"}, {value: "qtd", label: "Quarter to date"}], $period)])])`,
      },
      {
        title: "3 options",
        program: String.raw`$period = "30d"
root = Dashboard([FilterBar([PeriodPicker("period", [{value: "7d", label: "7D"}, {value: "30d", label: "30D"}, {value: "90d", label: "90D"}], $period)])])`,
      },
      {
        title: "5 options",
        program: String.raw`$period = "30d"
root = Dashboard([FilterBar([PeriodPicker("period", [{value: "7d", label: "7D"}, {value: "30d", label: "30D"}, {value: "90d", label: "90D"}, {value: "12m", label: "12M"}, {value: "ytd", label: "YTD"}], $period)])])`,
      },
    ],
  },
  {
    slug: "daterangefilter",
    name: "DateRangeFilter",
    group: "Filters",
    summary:
      'A dropdown with date presets plus a custom from–to range. The value is a preset key or "2026-10-01..2026-10-31". Meant for live data, where the $variable goes into query arguments; with written-in data, prefer PeriodPicker.',
    components: ["DateRangeFilter"],
    notes: {
      name: "the state variable it owns",
      value: 'a preset key or "2026-10-01..2026-10-31"',
      presets: "default 7d, 30d, 90d, 12m, ytd",
      label: "shown before the value",
    },
    variants: [
      {
        title: "Default",
        program: String.raw`$range = "30d"
root = Dashboard([FilterBar([DateRangeFilter("range", $range, null, "Period")])])`,
      },
    ],
  },
  {
    slug: "chipfilter",
    name: "ChipFilter",
    group: "Filters",
    summary:
      "Pills for two to six segments; one is always selected. Lives in the FilterBar for a dashboard-wide segment, or in a Card’s controls to switch that card’s breakdown.",
    components: ["ChipFilter"],
    notes: {
      name: "the state variable it owns",
      options: "2 to 6 segments",
      value: "the $variable it writes",
      label: "leave out inside Card controls",
    },
    variants: [
      {
        title: "Default",
        program: String.raw`$plan = "all"
root = Dashboard([FilterBar([ChipFilter("plan", [{value: "all", label: "All plans"}, {value: "team", label: "Team"}, {value: "business", label: "Business"}, {value: "ent", label: "Enterprise"}], $plan, "Plan")])])`,
      },
    ],
  },
  {
    slug: "select",
    name: "SelectFilter & MultiSelectFilter",
    group: "Filters",
    summary:
      "A dropdown for a longer list of values: the ChipFilter alternative once options stop fitting as pills. Single (SelectFilter) picks one value; multiple (MultiSelectFilter) picks several, where an empty array means all and suits live data that feeds query arguments.",
    components: ["SelectFilter", "MultiSelectFilter"],
    notes: {
      "SelectFilter.name": "the state variable it owns",
      "SelectFilter.label": "prefixes the value in the control",
      "SelectFilter.options":
        "the choices, {value, label}; the first is chosen until the $variable says otherwise",
      "SelectFilter.value": "the one chosen value",
      "MultiSelectFilter.name": "the state variable it owns",
      "MultiSelectFilter.label": "prefixes the value in the control",
      "MultiSelectFilter.options":
        "the choices, {value, label}; all show ticked while none is chosen",
      "MultiSelectFilter.value": "the chosen values; [] means all",
    },
    variantsLabel: "Selection",
    variants: [
      {
        title: "Single",
        program: String.raw`$region = "all"
root = Dashboard([FilterBar([SelectFilter("region", "Region", [{value: "all", label: "All"}, {value: "na", label: "North America"}, {value: "eu", label: "Europe"}, {value: "apac", label: "APAC"}, {value: "latam", label: "LATAM"}], $region)])])`,
      },
      {
        title: "Multiple",
        program: String.raw`$channels = []
root = Dashboard([FilterBar([MultiSelectFilter("channels", "Channel", [{value: "search", label: "Paid search"}, {value: "social", label: "Paid social"}, {value: "email", label: "Email"}, {value: "referral", label: "Referral"}, {value: "organic", label: "Organic"}], $channels)])])`,
      },
    ],
  },
  {
    slug: "searchfilter",
    name: "SearchFilter",
    group: "Filters",
    summary:
      "A free-text search box. Pass its $variable to Table(…, search) to filter rows across every text column.",
    components: ["SearchFilter"],
    notes: {
      name: "the state variable it owns",
      placeholder: "shown while empty",
      value: "pass it to Table(…, search)",
    },
    variants: [
      {
        title: "With table",
        note: 'Type "li" to narrow the rows.',
        program: String.raw`$q = ""
root = Dashboard([FilterBar([SearchFilter("q", "Search campaigns", $q)]), Section("", [Row([Card("Campaigns", [Table([Column("Campaign", ["Brand search", "Competitor terms", "LinkedIn ABM", "Retargeting", "Webinar promo", "Product Hunt"], "primary"), Column("Spend", [12400, 18900, 22100, 6200, 4800, 0], "number", "currency"), Column("Signups", [612, 401, 188, 290, 140, 820], "number")], 10, null, $q)], "full", "Last 30 days")])])])`,
      },
    ],
  },
  {
    slug: "comparetoggle",
    name: "CompareToggle",
    group: "Filters",
    summary:
      "A Compare dropdown: None, or one of the comparisons the program offers. The choice overlays that data on every chart that carries it (dashed lines, ghost bars, funnel markers, KPI sparkline overlays) and names it in legends and deltas. Key each chart’s previous data by the $variable so every choice shows its own data.",
    components: ["CompareToggle"],
    notes: {
      label: 'the single choice when there are no options; default "Previous period"',
      defaultOn: "start on the first choice instead of None",
      options: "short comparisons: Previous period, Last year, Plan",
      name: 'the state variable; "off" when None is chosen',
      value: "bind it, then key previous data: prev[$compare]",
    },
    variants: [
      {
        title: "Default",
        note: "None, or one of the comparisons; with several, charts key their previous data by $compare.",
        program: String.raw`$compare = "off"
root = Dashboard([FilterBar([CompareToggle("Previous period", false, [{value: "prev", label: "Previous period"}, {value: "yoy", label: "Last year"}, {value: "y2", label: "2 years ago"}, {value: "plan", label: "Plan"}], "compare", $compare)])])`,
      },
    ],
  },
];

export const filtersFixtures: RenderFixture[] = filterCatalog.flatMap((entry) =>
  entry.variants.map((variant) => ({
    name: `${entry.name}: ${variant.title}`,
    program:
      entry.name === "SearchFilter"
        ? `$q = ""\nroot = Dashboard([FilterBar([SearchFilter("q", "Search campaigns", $q)]), Section("", [Row([Card("Campaigns", [Stat(6)])])])])`
        : variant.program,
    text:
      entry.name === "SearchFilter"
        ? "Campaigns"
        : entry.name === "PeriodPicker" && variant.title === "2 options"
          ? "Month to date"
          : entry.name === "PeriodPicker" || entry.name === "FilterBar"
            ? "30D"
            : entry.name === "ChipFilter"
              ? "All plans"
              : entry.name === "DateRangeFilter"
                ? "Last 30 days"
                : entry.name === "CompareToggle"
                  ? "Compare"
                  : variant.title === "Multiple"
                    ? "Channel:"
                    : "Region:",
  })),
);
