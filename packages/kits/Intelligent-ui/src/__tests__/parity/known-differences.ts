import type { Difference } from "./compare.ts";

/**
 * Every way the kit is known to differ from the source app. A difference no rule explains fails the
 * tests. `needsFix` is what still looks wrong; `accepted` is on purpose or harmless, with the reason.
 */
export type Rule = {
  id: string;
  summary: string;
  match: (difference: Difference) => boolean;
};

const is = (difference: Difference, kind: string, source: unknown, kit: unknown) =>
  difference.kind === kind && difference.source === source && difference.kit === kit;

const isOneOf = (difference: Difference, kinds: string[], pairs: [unknown, unknown][]) =>
  kinds.includes(difference.kind) && pairs.some(([source, kit]) => difference.source === source && difference.kit === kit);

/** Pages made taller or shorter by a chart, since charts have their own rule. */
const CHART_PAGES = /^(primitives|savings|clt|web-analytics|roadtrip|drones|dash-sales|dash-support|chart|example-dashboard|gdp|monty)$/;

export const needsFix: Rule[] = [
  {
    id: "chart-size",
    summary: "Charts are a different size from the source, which changes the height of the page around them",
    match: (d) =>
      ["chart-height", "chart-width", "chart-scrolls"].includes(d.kind) ||
      (d.kind === "page-height" && CHART_PAGES.test(d.program)),
  },
  {
    id: "chart-currency",
    summary: "Chart values lose their currency: an axis shows 2.5K, not $2.5K",
    match: (d) => d.kind === "chart-no-currency",
  },
  {
    id: "table-header",
    summary:
      "Table headers are grey and regular with no fill; the source's are ink and semibold on a tint. Tables are also shorter at phone width",
    match: (d) =>
      (d.kind === "page-height" && d.mode === "light-390" && /^(table|bicycle|garden)$/.test(d.program)) ||
      is(d, "text-size", 13, 14) ||
      is(d, "text-weight", 560, 400) ||
      isOneOf(d, ["text-color"], [["030303", "03030399"], ["fafafa", "fafafa99"]]),
  },
  {
    id: "label-size",
    summary: "Label is 16px and regular, from react-components; the source's is 14px and semibold",
    match: (d) => is(d, "text-size", 14, 16),
  },
  {
    id: "input-fill",
    summary: "Input, Select and TextArea have a grey fill and are 4px shorter, from react-components; the source's are white",
    match: (d) =>
      (d.kind === "page-height" && /^(bill|inputs)$/.test(d.program)) ||
      isOneOf(d, ["control-fill"], [["fdfdfd", "00000005"], ["171717", "ffffff05"]]) ||
      isOneOf(d, ["control-border"], [["0000001a", "0000000f"], ["f5f5f51a", "ffffff0f"]]) ||
      (d.kind === "control-size" && /^textbox\|Anything else/.test(d.subject)),
  },
  {
    id: "icon-button-fill",
    summary: "An outline IconButton has no fill, and a Carousel's arrow is plainer and sits further out",
    match: (d) =>
      isOneOf(d, ["control-fill"], [["fdfdfd", null], ["fefefeb3", null], ["171717", null], ["1c1c1eb3", null]]) ||
      (d.kind === "control-border" && /^button\|Next/.test(d.subject)),
  },
  {
    id: "bare-host",
    summary:
      "On a page with no CSS reset, boxes inside a card spill about 16px past it: the kit relies on the host's box-sizing: border-box",
    match: (d) =>
      d.mode === "plain-1280" && ["control-size", "control-text-color", "media-size", "page-height"].includes(d.kind),
  },
  {
    id: "dark-ink",
    summary:
      "In dark mode the kit's neutrals ignore a ThemeProvider below the page root: ink is #ececec, not the provider's #fafafa",
    match: (d) =>
      isOneOf(
        d,
        ["text-color", "control-text-color", "control-fill", "control-border"],
        [["fafafa", "ececec"], ["ffffff14", "f2f2f214"], ["ffffff0a", "e6e6e60a"]],
      ),
  },
];

export const accepted: Rule[] = [
  {
    id: "native-checkbox",
    summary: "The source draws native checkboxes, whose box isn't in their CSS, so only the kit reports one",
    match: (d) =>
      d.subject.startsWith("checkbox|") && ["control-fill", "control-border", "control-radius"].includes(d.kind),
  },
  {
    id: "card-radios",
    summary: "The source hides a native radio inside a card, and react-components makes the card itself the radio",
    match: (d) => ["control-extra", "use-extra"].includes(d.kind) && d.program === "compare-phones",
  },
  {
    id: "date-picker",
    summary: "DatePicker is react-components': a button with a calendar and a written date, not a native date field",
    match: (d) =>
      (["control-missing", "use-missing"].includes(d.kind) && d.subject === "date|Start date") ||
      (d.kind === "text-extra" && d.program === "inputs" && ["Oct", "24,", "2026"].includes(d.subject)),
  },
  {
    id: "map-vector-tiles",
    summary:
      "The source's map line gets an oklch colour MapLibre can't parse, so it falls back to raster tiles. The kit keeps the vector map",
    match: (d) =>
      /^(map|route|roadtrip)$/.test(d.program) &&
      (["text-missing", "text-extra"].includes(d.kind) ||
        (d.kind === "control-extra" && d.subject.startsWith("link|")) ||
        d.kind === "use-result" ||
        d.kind === "use-state"),
  },
  {
    id: "popover-name",
    summary: "The Popover's trigger has an accessible name in the kit, and none in the source",
    match: (d) =>
      d.program === "primitives" &&
      ["control-missing", "control-extra", "use-missing", "use-extra"].includes(d.kind) &&
      /^button\|(Show details)?$/.test(d.subject),
  },
];

export const ruleFor = (difference: Difference) =>
  [...needsFix, ...accepted].find((rule) => rule.match(difference));

/** These follow from what's above: a taller element moves everything below it. They get a budget, not a rule. */
export const isFollowOn = (difference: Difference) =>
  difference.kind.startsWith("surface-") || difference.kind.endsWith("-position");

/** Where a map's pins sit depends on how far its camera has moved, so their boxes and positions say nothing. */
export const isMapMotion = (difference: Difference) =>
  /^(map|route|roadtrip)$/.test(difference.program) && isFollowOn(difference);
