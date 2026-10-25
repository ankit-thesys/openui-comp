import { css, type CSSAttribute } from "goober";
const body = {
  font: 'var(--openui-text-body-default, 400 16px/1.5 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-body-default-letter-spacing, -0.01em)",
  fontVariationSettings: 'var(--openui-font-variation-regular, "wght" 440)',
};
const bodyHeavy = {
  font: 'var(--openui-text-body-default-heavy, 560 16px/1.5 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-body-default-heavy-letter-spacing, -0.01em)",
  fontVariationSettings: 'var(--openui-font-variation-medium, "wght" 560)',
};
const bodySmall = {
  ...body,
  font: 'var(--openui-text-body-sm, 400 14px/1.5 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-body-sm-letter-spacing, -0.01em)",
};
const bodySmallHeavy = {
  ...bodyHeavy,
  font: 'var(--openui-text-body-sm-heavy, 560 14px/1.5 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-body-sm-heavy-letter-spacing, -0.01em)",
};
const bodyLarge = {
  ...body,
  font: 'var(--openui-text-body-lg, 400 18px/1.5 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-body-lg-letter-spacing, -0.01em)",
};
const bodyLargeHeavy = {
  ...bodyHeavy,
  font: 'var(--openui-text-body-lg-heavy, 560 18px/1.5 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-body-lg-heavy-letter-spacing, -0.01em)",
};
const number = {
  ...body,
  font: 'var(--openui-text-numbers-default, 400 16px/1.5 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-numbers-default-letter-spacing, -0.01em)",
};
const numberHeavy = {
  ...bodyHeavy,
  font: 'var(--openui-text-numbers-default-heavy, 560 16px/1.5 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-numbers-default-heavy-letter-spacing, -0.01em)",
};
const numberSmall = {
  ...body,
  font: 'var(--openui-text-numbers-sm, 400 14px/1.5 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-numbers-sm-letter-spacing, -0.01em)",
};
const numberSmallHeavy = {
  ...bodyHeavy,
  font: 'var(--openui-text-numbers-sm-heavy, 560 14px/1.5 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-numbers-sm-heavy-letter-spacing, -0.01em)",
};
const numberLarge = {
  ...body,
  font: 'var(--openui-text-numbers-lg, 400 18px/1.5 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-numbers-lg-letter-spacing, -0.01em)",
};
const numberLargeHeavy = {
  ...bodyHeavy,
  font: 'var(--openui-text-numbers-lg-heavy, 560 18px/1.5 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-numbers-lg-heavy-letter-spacing, -0.01em)",
};
const headingXs = {
  font: 'var(--openui-text-heading-xs, 600 16px/1.25 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-heading-xs-letter-spacing, -0.01em)",
};
const headingSmall = {
  font: 'var(--openui-text-heading-sm, 600 18px/1.25 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-heading-sm-letter-spacing, -0.01em)",
};
const headingMedium = {
  font: 'var(--openui-text-heading-md, 600 24px/1.1 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-heading-md-letter-spacing, -0.01em)",
};
const headingLarge = {
  font: 'var(--openui-text-heading-lg, 600 28px/1.1 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-heading-lg-letter-spacing, -0.1px)",
};
const numberTitleMedium = {
  font: 'var(--openui-text-numbers-heading-md, 600 24px/1.1 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-numbers-heading-md-letter-spacing, -0.01em)",
};
const numberTitle = {
  font: 'var(--openui-text-numbers-heading-lg, 600 28px/1.1 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-numbers-heading-lg-letter-spacing, -0.01em)",
};
// Keep :where at the selector end: stock Goober preserves its matching and specificity there.
export const rootClass = css({
  display: "flex",
  flexDirection: "column",
  gap: "var(--openui-space-3xs, 2px)",
  alignItems: "flex-start",
  textAlign: "left",
  "& :where(.openui-text-block__primary)": {
    color: "var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1))",
  },
  "& :where(.openui-text-block__secondary)": {
    color: "var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6))",
  },
  "& :where(.openui-text-block__secondary--positive)": {
    color: "var(--openui-text-success-primary, oklch(0.448 0.108 151.328 / 1))",
  },
  "& :where(.openui-text-block__secondary--negative)": {
    color: "var(--openui-text-danger-primary, oklch(0.505 0.19 27.518 / 1))",
  },
  "& :where(.openui-text-block__tertiary)": { display: "none" },
  "&.openui-text-block--title-text :where(.openui-text-block__primary)": { ...headingMedium },
  "&.openui-text-block--title-text :where(.openui-text-block__secondary)": { ...body },
  "&.openui-text-block--number-title-text :where(.openui-text-block__primary)": {
    ...numberTitleMedium,
  },
  "&.openui-text-block--number-title-text :where(.openui-text-block__secondary)": { ...body },
  "&.openui-text-block--text-subtext :where(.openui-text-block__primary)": { ...body },
  "&.openui-text-block--text-subtext :where(.openui-text-block__secondary)": { ...bodySmall },
  "&:where(.openui-text-block--highlight-text-number-subtext)": { gap: 0 },
  "&.openui-text-block--highlight-text-number-subtext :where(.openui-text-block__primary)": {
    ...bodyHeavy,
  },
  "&.openui-text-block--highlight-text-number-subtext :where(.openui-text-block__secondary)": {
    ...bodySmall,
  },
  "&.openui-text-block--text :where(.openui-text-block__primary)": { ...body },
  "&.openui-text-block--highlight-text :where(.openui-text-block__primary)": { ...bodyHeavy },
  "&.openui-text-block--number :where(.openui-text-block__primary)": { ...numberHeavy },
  "&.openui-text-block--highlight-number :where(.openui-text-block__primary)": {
    ...numberLargeHeavy,
  },

  "&.openui-text-block--title-text:where(.openui-text-block--size-xs), &.openui-text-block--number-title-text:where(.openui-text-block--size-xs)":
    { gap: 0 },
  "&.openui-text-block--size-xs.openui-text-block--title-text :where(.openui-text-block__primary)":
    { ...headingXs },
  "&.openui-text-block--size-xs.openui-text-block--title-text :where(.openui-text-block__secondary)":
    { ...bodySmall },
  "&.openui-text-block--size-xs.openui-text-block--number-title-text :where(.openui-text-block__primary)":
    { ...numberHeavy },
  "&.openui-text-block--size-xs.openui-text-block--number-title-text :where(.openui-text-block__secondary)":
    { ...bodySmall },
  "&.openui-text-block--size-xs.openui-text-block--text :where(.openui-text-block__primary)": {
    ...bodySmall,
  },
  "&.openui-text-block--size-xs.openui-text-block--text.openui-text-block--type-number :where(.openui-text-block__primary)":
    { ...numberSmall },
  "&.openui-text-block--text-subtext:where(.openui-text-block--size-xs), &.openui-text-block--highlight-text-number-subtext:where(.openui-text-block--size-xs)":
    { gap: 0 },
  "&.openui-text-block--size-xs.openui-text-block--text-subtext :where(.openui-text-block__primary)":
    { ...bodySmall },
  "&.openui-text-block--size-xs.openui-text-block--text-subtext.openui-text-block--type-number :where(.openui-text-block__primary)":
    { ...numberSmall },
  "&.openui-text-block--size-xs.openui-text-block--highlight-text-number-subtext :where(.openui-text-block__primary)":
    { ...bodySmallHeavy },
  "&.openui-text-block--size-xs.openui-text-block--highlight-text-number-subtext.openui-text-block--type-number :where(.openui-text-block__primary)":
    { ...numberSmallHeavy },
  "&.openui-text-block--size-xs.openui-text-block--text-subtext :where(.openui-text-block__secondary), &.openui-text-block--size-xs.openui-text-block--highlight-text-number-subtext :where(.openui-text-block__secondary)":
    { ...bodySmall },
  "&.openui-text-block--size-xs.openui-text-block--highlight-text-number-subtext.openui-text-block--type-number :where(.openui-text-block__secondary)":
    { ...numberSmall },
  "&.openui-text-block--size-xs.openui-text-block--number :where(.openui-text-block__primary)": {
    ...numberSmall,
  },
  "&.openui-text-block--size-xs.openui-text-block--highlight-number :where(.openui-text-block__primary)":
    { ...numberSmallHeavy },
  "&.openui-text-block--size-xs.openui-text-block--highlight-text :where(.openui-text-block__primary)":
    { ...bodySmallHeavy },

  "&.openui-text-block--title-text:where(.openui-text-block--size-sm), &.openui-text-block--number-title-text:where(.openui-text-block--size-sm)":
    { gap: "var(--openui-space-3xs, 2px)" },
  "&.openui-text-block--size-sm.openui-text-block--title-text :where(.openui-text-block__primary)":
    { ...headingSmall },
  "&.openui-text-block--size-sm.openui-text-block--title-text :where(.openui-text-block__secondary)":
    { ...body },
  "&.openui-text-block--size-sm.openui-text-block--number-title-text :where(.openui-text-block__primary)":
    { ...numberLargeHeavy },
  "&.openui-text-block--size-sm.openui-text-block--number-title-text :where(.openui-text-block__secondary)":
    { ...body },
  "&.openui-text-block--size-sm.openui-text-block--text :where(.openui-text-block__primary)": {
    ...body,
  },
  "&.openui-text-block--size-sm.openui-text-block--text.openui-text-block--type-number :where(.openui-text-block__primary)":
    { ...number },
  "&.openui-text-block--text-subtext:where(.openui-text-block--size-sm), &.openui-text-block--highlight-text-number-subtext:where(.openui-text-block--size-sm)":
    { gap: 0 },
  "&.openui-text-block--size-sm.openui-text-block--text-subtext :where(.openui-text-block__primary)":
    { ...body },
  "&.openui-text-block--size-sm.openui-text-block--text-subtext.openui-text-block--type-number :where(.openui-text-block__primary)":
    { ...number },
  "&.openui-text-block--size-sm.openui-text-block--highlight-text-number-subtext :where(.openui-text-block__primary)":
    { ...bodyHeavy },
  "&.openui-text-block--size-sm.openui-text-block--highlight-text-number-subtext.openui-text-block--type-number :where(.openui-text-block__primary)":
    { ...numberHeavy },
  "&.openui-text-block--size-sm.openui-text-block--text-subtext :where(.openui-text-block__secondary), &.openui-text-block--size-sm.openui-text-block--highlight-text-number-subtext :where(.openui-text-block__secondary)":
    { ...bodySmall },
  "&.openui-text-block--size-sm.openui-text-block--highlight-text-number-subtext.openui-text-block--type-number :where(.openui-text-block__secondary)":
    { ...numberSmall },
  "&.openui-text-block--size-sm.openui-text-block--number :where(.openui-text-block__primary)": {
    ...numberSmall,
  },
  "&.openui-text-block--size-sm.openui-text-block--highlight-number :where(.openui-text-block__primary)":
    { ...numberHeavy },
  "&.openui-text-block--highlight-text:where(.openui-text-block--size-sm)": { gap: 0 },
  "&.openui-text-block--size-sm.openui-text-block--highlight-text :where(.openui-text-block__secondary)":
    { ...bodySmall },
  "&.openui-text-block--size-sm.openui-text-block--highlight-text :where(.openui-text-block__primary)":
    { ...bodyHeavy },

  "&.openui-text-block--title-text:where(.openui-text-block--size-md), &.openui-text-block--number-title-text:where(.openui-text-block--size-md)":
    { gap: "var(--openui-space-xs, 6px)" },
  "&.openui-text-block--size-md.openui-text-block--title-text :where(.openui-text-block__primary)":
    { ...headingMedium },
  "&.openui-text-block--size-md.openui-text-block--title-text :where(.openui-text-block__secondary)":
    { ...body },
  "&.openui-text-block--size-md.openui-text-block--number-title-text :where(.openui-text-block__primary)":
    { ...numberTitleMedium },
  "&.openui-text-block--size-md.openui-text-block--number-title-text :where(.openui-text-block__secondary)":
    { ...body },
  "&.openui-text-block--text-subtext:where(.openui-text-block--size-md), &.openui-text-block--highlight-text:where(.openui-text-block--size-md), &.openui-text-block--highlight-text-number-subtext:where(.openui-text-block--size-md)":
    { gap: 0 },
  "&.openui-text-block--size-md.openui-text-block--highlight-text :where(.openui-text-block__secondary)":
    { ...body },
  "&.openui-text-block--size-md.openui-text-block--highlight-text :where(.openui-text-block__primary)":
    { ...bodyHeavy },
  "&.openui-text-block--size-md.openui-text-block--text-subtext :where(.openui-text-block__primary)":
    { ...body },
  "&.openui-text-block--size-md.openui-text-block--text-subtext.openui-text-block--type-number :where(.openui-text-block__primary)":
    { ...number },
  "&.openui-text-block--size-md.openui-text-block--highlight-text-number-subtext :where(.openui-text-block__primary)":
    { ...bodyHeavy },
  "&.openui-text-block--size-md.openui-text-block--highlight-text-number-subtext.openui-text-block--type-number :where(.openui-text-block__primary)":
    { ...numberHeavy },
  "&.openui-text-block--size-md.openui-text-block--text-subtext :where(.openui-text-block__secondary), &.openui-text-block--size-md.openui-text-block--highlight-text-number-subtext :where(.openui-text-block__secondary)":
    { ...body },
  "&.openui-text-block--size-md.openui-text-block--text-subtext.openui-text-block--type-number :where(.openui-text-block__secondary)":
    { ...number },
  "&.openui-text-block--size-md.openui-text-block--highlight-text-number-subtext.openui-text-block--type-number :where(.openui-text-block__secondary)":
    { ...number },
  "&.openui-text-block--size-md.openui-text-block--text.openui-text-block--type-number :where(.openui-text-block__primary)":
    { ...number },
  "&.openui-text-block--size-md.openui-text-block--number :where(.openui-text-block__primary)": {
    ...number,
  },
  "&.openui-text-block--size-md.openui-text-block--highlight-number :where(.openui-text-block__primary)":
    { ...numberHeavy },

  "&.openui-text-block--size-lg.openui-text-block--text :where(.openui-text-block__primary)": {
    ...bodyLarge,
  },
  "&.openui-text-block--size-lg.openui-text-block--text.openui-text-block--type-number :where(.openui-text-block__primary)":
    { ...numberLarge },
  "&.openui-text-block--text-subtext:where(.openui-text-block--size-lg), &.openui-text-block--highlight-text:where(.openui-text-block--size-lg), &.openui-text-block--highlight-text-number-subtext:where(.openui-text-block--size-lg)":
    { gap: 0 },
  "&.openui-text-block--size-lg.openui-text-block--highlight-text :where(.openui-text-block__secondary)":
    { ...body },
  "&.openui-text-block--size-lg.openui-text-block--highlight-text :where(.openui-text-block__primary)":
    { ...bodyLargeHeavy },
  "&.openui-text-block--size-lg.openui-text-block--text-subtext :where(.openui-text-block__primary)":
    { ...bodyLarge },
  "&.openui-text-block--size-lg.openui-text-block--text-subtext.openui-text-block--type-number :where(.openui-text-block__primary)":
    { ...numberLarge },
  "&.openui-text-block--size-lg.openui-text-block--highlight-text-number-subtext :where(.openui-text-block__primary)":
    { ...bodyLargeHeavy },
  "&.openui-text-block--size-lg.openui-text-block--highlight-text-number-subtext.openui-text-block--type-number :where(.openui-text-block__primary)":
    { ...numberLargeHeavy },
  "&.openui-text-block--size-lg.openui-text-block--text-subtext :where(.openui-text-block__secondary), &.openui-text-block--size-lg.openui-text-block--highlight-text-number-subtext :where(.openui-text-block__secondary)":
    { ...body },
  "&.openui-text-block--size-lg.openui-text-block--text-subtext.openui-text-block--type-number :where(.openui-text-block__secondary)":
    { ...number },
  "&.openui-text-block--size-lg.openui-text-block--highlight-text-number-subtext.openui-text-block--type-number :where(.openui-text-block__secondary)":
    { ...number },
  "&.openui-text-block--size-lg.openui-text-block--number :where(.openui-text-block__primary)": {
    ...numberLarge,
  },
  "&.openui-text-block--size-lg.openui-text-block--highlight-number :where(.openui-text-block__primary)":
    { ...numberLargeHeavy },
  "&.openui-text-block--title-text:where(.openui-text-block--size-lg), &.openui-text-block--number-title-text:where(.openui-text-block--size-lg)":
    { gap: "var(--openui-space-xs, 6px)" },
  "&.openui-text-block--size-lg.openui-text-block--title-text :where(.openui-text-block__primary)":
    { ...headingLarge },
  "&.openui-text-block--size-lg.openui-text-block--title-text :where(.openui-text-block__secondary)":
    { ...bodyLarge },
  "&.openui-text-block--size-lg.openui-text-block--number-title-text :where(.openui-text-block__primary)":
    { ...numberTitle },
  "&.openui-text-block--size-lg.openui-text-block--number-title-text :where(.openui-text-block__secondary)":
    { ...bodyLarge },
  "&:where(.openui-text-block--align-left)": { alignItems: "flex-start", textAlign: "left" },
  "&:where(.openui-text-block--align-center)": { alignItems: "center", textAlign: "center" },
  "&:where(.openui-text-block--align-right)": { alignItems: "flex-end", textAlign: "right" },
} satisfies CSSAttribute);
