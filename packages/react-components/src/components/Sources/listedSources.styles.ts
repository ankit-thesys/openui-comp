import { css, type CSSAttribute } from "goober";
export const listClass = css({
  display: "flex",
  flexDirection: "column",
  gap: "var(--openui-space-m, 12px)",
} satisfies CSSAttribute);
export const headerClass = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--openui-space-s, 8px)",
});
export const titleClass = css({
  color: "var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6))",
  font: 'var(--openui-text-label-default-heavy, 560 16px/1.25 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-label-default-heavy-letter-spacing, -0.01em)",
  fontVariationSettings: 'var(--openui-font-variation-medium, "wght" 560)',
});
export const buttonsClass = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--openui-space-s, 8px)",
});
export const containerClass = css({
  width: "180px !important",
  padding: "var(--openui-space-000, 0)",
  borderRadius: "var(--openui-radius-l, 10px)",
  overflow: "hidden",
  backgroundColor: "transparent !important",
  "&.openui-listed-sources-item-container--has-url:hover": {
    backgroundColor: "var(--openui-highlight-subtle, oklch(0.097 0 0 / 0.02)) !important",
    borderColor: "var(--openui-border-interactive, oklch(0.097 0 0 / 0.12))",
  },
} satisfies CSSAttribute);
