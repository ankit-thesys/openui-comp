/**
 * The two Sass typography mixins, as functions that return CSS declarations
 * for a goober template.
 *
 *   ${typography("body", "small")}        // openui's shorthand scale
 *   ${dashboardTypography("metric", "lg") // the dashboard-only gap
 *
 * `font` is a shorthand, so it RESETS `font-variation-settings`. Both helpers
 * emit the axis after the shorthand, never before.
 */

/** [token suffix, Inter "wght" axis] — a null axis means the weight is fixed. */
const OPENUI_SCALE = {
  body: {
    default: ["body-default", "regular"],
    heavy: ["body-default-heavy", "medium"],
    small: ["body-sm", "regular"],
    "small-heavy": ["body-sm-heavy", "medium"],
    large: ["body-lg", "regular"],
    "large-heavy": ["body-lg-heavy", "medium"],
    link: ["body-default", "regular"],
    medium: ["body-default", "regular"],
  },
  label: {
    default: ["label-default", "regular"],
    heavy: ["label-default-heavy", "medium"],
    large: ["label-lg", "regular"],
    "large-heavy": ["label-lg-heavy", "medium"],
    medium: ["label-default", "regular"],
    "medium-heavy": ["label-default-heavy", "medium"],
    small: ["label-sm", "regular"],
    "small-heavy": ["label-sm-heavy", "medium"],
    "extra-small": ["label-xs", "regular"],
    "extra-small-heavy": ["label-xs-heavy", "medium"],
  },
  heading: {
    xl: ["heading-xl", null],
    large: ["heading-lg", null],
    medium: ["heading-md", null],
    small: ["heading-sm", null],
    "extra-small": ["heading-xs", null],
  },
  number: {
    large: ["numbers-lg", "regular"],
    "large-heavy": ["numbers-lg-heavy", "medium"],
    heavy: ["numbers-default-heavy", "medium"],
    default: ["numbers-default", "regular"],
    small: ["numbers-sm", "regular"],
    "small-heavy": ["numbers-sm-heavy", "medium"],
    "extra-small": ["numbers-xs", "regular"],
    "extra-small-heavy": ["numbers-xs-heavy", "medium"],
    heading: ["numbers-heading-lg", null],
    "heading-small": ["numbers-heading-sm", null],
    "heading-medium": ["numbers-heading-md", null],
    title: ["numbers-heading-lg", null],
    "title-medium": ["numbers-heading-md", null],
    "heading-large": ["numbers-heading-lg", null],
    "heading-xl": ["numbers-heading-xl", null],
  },
  code: {
    default: ["code-default", null],
    heavy: ["code-default-heavy", null],
    small: ["code-sm", null],
    "small-heavy": ["code-sm-heavy", null],
  },
} as const satisfies Record<string, Record<string, readonly [string, "regular" | "medium" | null]>>;

type Scale = typeof OPENUI_SCALE;

/** openui's shorthand type scale — `font`, `letter-spacing` and the weight axis. */
export function typography<R extends keyof Scale>(role: R, variant: keyof Scale[R]): string {
  const [token, axis] = OPENUI_SCALE[role][variant] as readonly [string, string | null];
  return [
    `font: var(--openui-text-${token});`,
    `letter-spacing: var(--openui-text-${token}-letter-spacing);`,
    axis ? `font-variation-settings: var(--openui-font-variation-${axis});` : "",
  ]
    .filter(Boolean)
    .join("\n  ");
}

/**
 * Dashboard-private roles, for the combinations openui's scale cannot express:
 * its `-heavy` tier stops at weight 500 while dashboard cards need 600/700.
 * Reach for `typography()` whenever openui already covers the combination.
 *
 * The values live in `DashboardThemeProvider`, not here, so they stay themeable
 * at runtime. Deliberately no `letter-spacing` companion: every dashboard
 * letter-spacing token is 0 and the rules these replace set none, so pairing one
 * in would newly force `0` over an inherited `normal`.
 */
const DASHBOARD_SCALE = {
  metric: { default: "metric", sm: "metric-sm", lg: "metric-lg" },
  highlight: { default: "highlight" },
  "table-header": { default: "table-header" },
} as const satisfies Record<string, Record<string, string>>;

type DashboardScale = typeof DASHBOARD_SCALE;

export function dashboardTypography<R extends keyof DashboardScale>(
  role: R,
  variant: keyof DashboardScale[R] = "default" as keyof DashboardScale[R],
): string {
  return `font: var(--c1-dashboard-font-${DASHBOARD_SCALE[role][variant] as string});`;
}
