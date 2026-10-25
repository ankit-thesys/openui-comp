import { css, type CSSAttribute } from "goober";
export const rootClass = css({
  display: "flex",
  flexDirection: "column",
  gap: "var(--openui-space-3xs, 2px)",
  alignItems: "flex-start",
} satisfies CSSAttribute);
export const headingClass = css({
  display: "flex",
  alignItems: "center",
  gap: "var(--openui-space-xs, 6px)",
  color: "var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1))",
  font: 'var(--openui-text-body-default-heavy, 560 16px/1.5 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-body-default-heavy-letter-spacing, -0.01em)",
  fontVariationSettings: 'var(--openui-font-variation-medium, "wght" 560)',
} satisfies CSSAttribute);
export const descriptionClass = css({
  color: "var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6))",
  font: 'var(--openui-text-body-default, 400 16px/1.5 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-body-default-letter-spacing, -0.01em)",
  fontVariationSettings: 'var(--openui-font-variation-regular, "wght" 440)',
} satisfies CSSAttribute);
