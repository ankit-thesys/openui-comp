import { css, type CSSAttribute } from "goober";
const bodySmall = {
  font: 'var(--openui-text-body-sm, 400 14px/1.5 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-body-sm-letter-spacing, -0.01em)",
  fontVariationSettings: 'var(--openui-font-variation-regular, "wght" 440)',
};
const centered = {
  position: "absolute",
  width: "calc(100% - var(--openui-space-m, 12px) * 2)",
  left: "var(--openui-space-m, 12px)",
  top: "50%",
  transform: "translateY(-50%)",
} satisfies CSSAttribute;
const ellipsis = { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
export const cellClass = css({
  position: "relative",
  width: "100%",
  height: "100%",
  padding: "var(--openui-space-s, 8px) var(--openui-space-m, 12px)",
  color: "var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1))",
  ...bodySmall,
} satisfies CSSAttribute);
export const inputClass = css({
  height: "100%",
  width: "100%",
  padding: 0,
  backgroundColor: "transparent",
  outline: "none",
  appearance: "textfield",
  "&::-webkit-inner-spin-button, &::-webkit-outer-spin-button": { appearance: "none" },
} satisfies CSSAttribute);
export const textClass = css({ ...centered, ...ellipsis, ...bodySmall } satisfies CSSAttribute);
export const numberClass = css({
  ...centered,
  ...ellipsis,
  textAlign: "right",
  font: 'var(--openui-text-numbers-sm, 400 14px/1.5 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-numbers-sm-letter-spacing, -0.01em)",
  fontVariationSettings: 'var(--openui-font-variation-regular, "wght" 440)',
} satisfies CSSAttribute);
export const urlClass = css({
  display: "block",
  flex: "1 1 auto",
  minWidth: 0,
  ...ellipsis,
  ...bodySmall,
  "&:hover": { textDecoration: "underline" },
} satisfies CSSAttribute);
export const urlContainerClass = css({
  display: "flex",
  alignItems: "center",
  gap: "var(--openui-space-s, 8px)",
  ...centered,
} satisfies CSSAttribute);
export const urlIconClass = css({
  flexShrink: 0,
  color: "var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6))",
} satisfies CSSAttribute);
export const warningClass = css({
  flexShrink: 0,
  color: "var(--openui-text-danger-primary, oklch(0.505 0.19 27.518 / 1))",
  display: "none",
} satisfies CSSAttribute);
export const horizontalOutlineClass = css({
  position: "absolute",
  left: 0,
  width: "100%",
  height: "0px",
  backgroundColor: "var(--openui-border-interactive-selected, oklch(0.097 0 0 / 1))",
  "&:where(.openui-editable-table-cell-outline-top-selected), &:where(.openui-editable-table-cell-outline-bottom-selected)":
    { height: "1px" },
  "&:where(.openui-editable-table-cell-outline-top-editing), &:where(.openui-editable-table-cell-outline-bottom-editing)":
    { height: "1.5px" },
  "&:where(.openui-editable-table-cell-outline-top)": { top: 0 },
  "&:where(.openui-editable-table-cell-outline-bottom)": { bottom: 0 },
} satisfies CSSAttribute);
export const verticalOutlineClass = css({
  position: "absolute",
  top: 0,
  width: "0px",
  height: "100%",
  backgroundColor: "var(--openui-border-interactive-selected, oklch(0.097 0 0 / 1))",
  "&:where(.openui-editable-table-cell-outline-left-selected), &:where(.openui-editable-table-cell-outline-right-selected)":
    { width: "1px" },
  "&:where(.openui-editable-table-cell-outline-left-editing), &:where(.openui-editable-table-cell-outline-right-editing)":
    { width: "1.5px" },
  "&:where(.openui-editable-table-cell-outline-left)": { left: 0 },
  "&:where(.openui-editable-table-cell-outline-right)": { right: 0 },
} satisfies CSSAttribute);
