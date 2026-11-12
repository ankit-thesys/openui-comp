/**
 * Deterministic fixture inputs for the #19 baseline harness.
 *
 * Every value here is a literal. Nothing derives from `Date.now()`, `Math.random()`
 * or the host locale, so the consumer and the tests render identically on any
 * machine and in any run order. `formatSingleDate`/`formatDateRange` in the
 * legacy DatePicker use date-fns `format(d, "MMM d, yyyy")`, which is
 * locale-independent for this pattern, so the expected strings below are stable.
 */

/** Fixed "today" for the calendar fixtures: Thursday 14 March 2024, local midnight. */
export const FIXED_DATE = new Date(2024, 2, 14);
export const FIXED_DATE_LABEL = "Mar 14, 2024";

/** A second date in the same visible month, used for range selection. */
export const FIXED_RANGE_END = new Date(2024, 2, 20);
export const FIXED_RANGE_END_LABEL = "Mar 20, 2024";
export const FIXED_RANGE_LABEL = `${FIXED_DATE_LABEL} - ${FIXED_RANGE_END_LABEL}`;

/** Placeholders the legacy DatePicker trigger shows with no selection. */
export const DATE_PLACEHOLDER_SINGLE = "Select a date";
export const DATE_PLACEHOLDER_RANGE = "Select a range";

export const CHECKBOX_ITEMS = [
  { value: "email", label: "Email digest", description: "A weekly summary." },
  { value: "sms", label: "SMS alerts", description: "Only for outages." },
  { value: "push", label: "Push notifications", description: "Disabled in this fixture." },
] as const;

export const RADIO_ITEMS = [
  { value: "standard", label: "Standard", description: "Arrives in 5 days." },
  { value: "express", label: "Express", description: "Arrives in 2 days." },
  { value: "overnight", label: "Overnight", description: "Arrives tomorrow." },
] as const;

export const SWITCH_ITEMS = [
  { value: "analytics", label: "Usage analytics", description: "Anonymous only." },
  { value: "beta", label: "Beta features", description: "May change without notice." },
] as const;

export const TOGGLE_ITEMS = [
  { value: "list", label: "List" },
  { value: "grid", label: "Grid" },
  { value: "table", label: "Table" },
] as const;

export const SELECT_ITEMS = [
  { value: "eur", label: "Euro" },
  { value: "gbp", label: "Pound sterling" },
  { value: "jpy", label: "Japanese yen" },
] as const;

export const CHIPS_ITEMS = [
  { value: "typescript", label: "TypeScript" },
  { value: "rust", label: "Rust" },
  { value: "elixir", label: "Elixir", disabled: true },
] as const;

export const OPTION_CARD_ITEMS = [
  { value: "starter", title: "Starter", subtitle: "Up to 3 seats" },
  { value: "team", title: "Team", subtitle: "Up to 25 seats" },
  { value: "enterprise", title: "Enterprise", subtitle: "Unlimited", disabled: true },
] as const;

/**
 * Slider fixture numbers. 0/1000/100 is chosen deliberately: the legacy
 * `formatNumber` switches to `Intl.NumberFormat` compact notation at >= 1000,
 * so `max` renders as "1k" while `min` renders as "0". That boundary is part of
 * the observed baseline, not an accident of the fixture.
 */
export const SLIDER_MIN = 0;
export const SLIDER_MAX = 1000;
export const SLIDER_STEP = 100;
export const SLIDER_DEFAULT = [200];
export const SLIDER_RANGE_DEFAULT = [200, 600];
