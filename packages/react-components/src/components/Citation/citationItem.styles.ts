import { css, type CSSAttribute } from "goober";
export const itemClass = css({
  display: "flex",
  alignItems: "center",
  gap: "var(--openui-space-s, 8px)",
  border: "none",
  padding:
    "var(--openui-space-xs, 6px) var(--openui-space-s, 8px) var(--openui-space-xs, 6px) var(--openui-space-xs, 6px)",
  borderRadius: "var(--openui-radius-m, 8px)",
  backgroundColor: "transparent",
  transition: "background-color 0.2s ease-in-out",
  textAlign: "left",
  width: "100%",
  maxWidth: "348px",
  font: 'var(--openui-text-label-sm, 400 14px/1.25 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-label-sm-letter-spacing, -0.01em)",
  fontVariationSettings: 'var(--openui-font-variation-regular, "wght" 440)',
  "@media (max-width: 800px)": { maxWidth: "320px" },
  "&.openui-citation-item--has-url": {
    cursor: "pointer",
    "&:hover": { backgroundColor: "var(--openui-sunk, oklch(0.097 0 0 / 0.04))" },
  },
} satisfies CSSAttribute);
export const logoClass = css({
  flexShrink: 0,
  width: "24px",
  height: "24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06))",
  borderRadius: "var(--openui-radius-s, 6px)",
  color: "var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6))",
  overflow: "hidden",
} satisfies CSSAttribute);
export const contentClass = css({
  display: "flex",
  flexGrow: 1,
  alignItems: "baseline",
  gap: "var(--openui-space-s, 8px)",
  minWidth: 0,
} satisfies CSSAttribute);
export const titleClass = css({
  color: "var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1))",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
} satisfies CSSAttribute);
export const sourceClass = css({
  color: "var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6))",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
} satisfies CSSAttribute);
