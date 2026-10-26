import { css, type CSSAttribute } from "goober";
export const wrapperClass = css({
  position: "relative",
  width: "100%",
  outline: "none",
} satisfies CSSAttribute);
export const scrollContainerClass = css({
  overflow: "auto",
  scrollbarWidth: "none",
  msOverflowStyle: "none",
  "&::-webkit-scrollbar": { display: "none" },
} satisfies CSSAttribute);
export const controlClass = css({
  position: "absolute",
  top: "var(--openui-space-s, 8px)",
  zIndex: 2,
  width: "fit-content",
  height: "fit-content",
  borderRadius: "var(--openui-radius-s, 6px)",
  backgroundColor: "var(--openui-foreground, oklch(0.994 0 89.876 / 1))",
  "&:where(.openui-scrollable-table-control-left)": { left: "var(--openui-space-s, 8px)" },
  "&:where(.openui-scrollable-table-control-right)": { right: "var(--openui-space-s, 8px)" },
  "&:where(.openui-scrollable-table-control-disabled)": { display: "none" },
} satisfies CSSAttribute);
