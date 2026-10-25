import { css, type CSSAttribute } from "goober";
export const itemClass = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "var(--openui-space-2xs, 4px)",
  padding: "var(--openui-space-s, 8px)",
  height: "100%",
  "&.openui-listed-source-item--has-url": { cursor: "pointer" },
} satisfies CSSAttribute);
export const headerClass = css({
  display: "flex",
  alignItems: "flex-start",
  gap: "var(--openui-space-s, 8px)",
});
export const nameClass = css({
  color: "var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1))",
  font: 'var(--openui-text-label-sm, 400 14px/1.25 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-label-sm-letter-spacing, -0.01em)",
  fontVariationSettings: 'var(--openui-font-variation-regular, "wght" 440)',
});
export const titleClass = css({
  color: "var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6))",
  font: 'var(--openui-text-body-sm, 400 14px/1.5 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-body-sm-letter-spacing, -0.01em)",
  fontVariationSettings: 'var(--openui-font-variation-regular, "wght" 440)',
});
export const logoClass = css({
  flexShrink: 0,
  width: "20px",
  height: "20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06))",
  borderRadius: "var(--openui-radius-s, 6px)",
  boxSizing: "border-box",
  overflow: "hidden",
} satisfies CSSAttribute);
