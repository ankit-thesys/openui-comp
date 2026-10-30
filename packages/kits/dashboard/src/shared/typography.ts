/**
 * openui's type scale as CSS declarations for a goober template:
 *
 *   ${typography("body", "small")}
 *
 * `font` is a shorthand, so it RESETS `font-variation-settings`. The axis is
 * emitted after the shorthand, never before.
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
