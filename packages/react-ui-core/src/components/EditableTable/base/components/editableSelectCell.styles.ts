import { css, type CSSAttribute } from "goober";
export const triggerClass = css({ width: "100%" } satisfies CSSAttribute);
export const itemClass = css({
  font: 'var(--openui-text-body-sm, 400 14px/1.5 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-body-sm-letter-spacing, -0.01em)",
  fontVariationSettings: 'var(--openui-font-variation-regular, "wght" 440)',
} satisfies CSSAttribute);
