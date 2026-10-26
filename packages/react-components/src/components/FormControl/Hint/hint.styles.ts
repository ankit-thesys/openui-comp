import type { CSSAttribute } from "goober";
export const hintStyles = {
  boxSizing: "border-box",
  font: 'var(--openui-text-body-sm, 400 14px/1.5 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-body-sm-letter-spacing, -0.01em)",
  fontVariationSettings: 'var(--openui-font-variation-regular, "wght" 440)',
  color: "var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6))",
  display: "flex",
  alignItems: "center",
  gap: "var(--openui-space-xs, 6px)",
  "&.openui-hint-error": {
    color: "var(--openui-text-danger-primary, oklch(0.505 0.19 27.518 / 1))",
  },
} satisfies CSSAttribute;
