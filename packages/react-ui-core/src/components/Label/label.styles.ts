import type { CSSAttribute } from "goober";
export const labelStyles = {
  boxSizing: "border-box",
  font: 'var(--openui-text-body-default, 400 16px/1.5 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-body-default-letter-spacing, -0.01em)",
  fontVariationSettings: 'var(--openui-font-variation-regular, "wght" 440)',
  color: "var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1))",
  "&.openui-label-disabled": {
    color: "var(--openui-text-neutral-tertiary, oklch(0.097 0 0 / 0.2))",
    cursor: "not-allowed",
  },
  "& .openui-label-required-asterisk": { marginLeft: "var(--openui-space-3xs, 2px)" },
} satisfies CSSAttribute;
