import { css, type CSSAttribute } from "goober";
const smallBody = {
  font: 'var(--openui-text-body-sm, 400 14px/1.5 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-body-sm-letter-spacing, -0.01em)",
  fontVariationSettings: 'var(--openui-font-variation-regular, "wght" 440)',
};
export const wrapperClass = css({
  border: "1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06))",
  borderRadius: "var(--openui-radius-xl, 12px) var(--openui-radius-xl, 12px) 0 0",
  overflow: "hidden",
  position: "relative",
} satisfies CSSAttribute);
export const scrollClass = css({
  overflow: "auto",
  scrollbarWidth: "none",
  msOverflowStyle: "none",
  "&::-webkit-scrollbar": { display: "none" },
} satisfies CSSAttribute);
export const controlClass = css({
  position: "absolute",
  top: "var(--openui-space-s, 8px)",
  zIndex: 1,
  width: "fit-content",
  height: "fit-content",
  borderRadius: "var(--openui-radius-s, 6px)",
  backgroundColor: "var(--openui-elevated, oklch(0.097 0 0 / 0.08))",
  cursor: "pointer",
  "&.openui-editable-table-scroll-control--disabled": { cursor: "not-allowed", display: "none" },
  "&.openui-editable-table-scroll-control--left": { left: "var(--openui-space-s, 8px)" },
  "&.openui-editable-table-scroll-control--right": { right: "var(--openui-space-s, 8px)" },
} satisfies CSSAttribute);
export const tableClass = css({
  borderCollapse: "collapse",
  "& .openui-select-trigger": { ...smallBody, width: "100%" },
  "& thead th": {
    textAlign: "left",
    padding: "var(--openui-space-s, 8px) var(--openui-space-m, 12px)",
    borderRight: "1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06))",
    backgroundColor: "var(--openui-highlight-subtle, oklch(0.097 0 0 / 0.02))",
    color: "var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6))",
    ...smallBody,
    height: "48px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  "& thead th:last-child": { borderRight: 0 },
  "& tbody tr": { borderBottom: "1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06))" },
  "& tbody tr:last-child": { borderBottom: 0 },
  "& tbody td": {
    height: "48px",
    padding: 0,
    borderRight: "1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06))",
    verticalAlign: "middle",
    whiteSpace: "nowrap",
  },
  "& tbody td:last-child": { borderRight: 0 },
} satisfies CSSAttribute);
export const headerClass = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--openui-space-s, 8px)",
} satisfies CSSAttribute);
export const headerIconClass = css({ flexShrink: 0 } satisfies CSSAttribute);
export const changesClass = css({
  display: "flex",
  flexDirection: "row",
  gap: "var(--openui-space-s, 8px)",
  padding:
    "var(--openui-space-s, 8px) var(--openui-space-s, 8px) var(--openui-space-s, 8px) var(--openui-space-m, 12px)",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "var(--openui-elevated, oklch(0.097 0 0 / 0.08))",
  borderRadius: "var(--openui-radius-xl, 12px)",
  border: "1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06))",
  boxShadow:
    "var(--openui-shadow-s, 0 1px 3px -2px oklch(0 0 0 / 0.02), 0 2px 5px -2px oklch(0 0 0 / 0.04))",
} satisfies CSSAttribute);
export const changesCountClass = css({
  font: 'var(--openui-text-body-default, 400 16px/1.5 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-body-default-letter-spacing, -0.01em)",
  fontVariationSettings: 'var(--openui-font-variation-regular, "wght" 440)',
} satisfies CSSAttribute);
export const changesButtonsClass = css({
  display: "flex",
  flexDirection: "row",
  gap: "var(--openui-space-s, 8px)",
} satisfies CSSAttribute);
