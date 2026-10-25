import type { CSSAttribute } from "goober";

// Concrete declarations shared by the existing chart-base SCSS mixins.
export const cartesianContainer = {
  width: "100%",
  position: "relative",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
} satisfies CSSAttribute;
export const cartesianContainerInner = {
  display: "flex",
  width: "100%",
  flex: 1,
  minHeight: 0,
} satisfies CSSAttribute;
export const cartesianYAxisContainer = { flexShrink: 0 } satisfies CSSAttribute;
export const cartesianMainContainer = {
  flex: 1,
  minWidth: 0,
  overflowX: "auto",
  overflowY: "hidden",
  "&::-webkit-scrollbar": { display: "none" },
  scrollbarWidth: "none",
  msOverflowStyle: "none",
} satisfies CSSAttribute;
export const centeredContainer = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "100%",
  position: "relative",
} satisfies CSSAttribute;
export const centeredSvgWrapper = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
} satisfies CSSAttribute;
export const gridLine = {
  stroke: "var(--openui-border-default, oklch(0.097 0 0 / 0.06))",
  strokeDasharray: "3 3",
} satisfies CSSAttribute;
export const zeroGridLine = { strokeDasharray: "none" } satisfies CSSAttribute;
export const activeDotOuter = {
  fill: "var(--openui-foreground, oklch(0.994 0 89.876 / 1))",
  stroke: "var(--openui-border-default, oklch(0.097 0 0 / 0.06))",
  strokeWidth: 1,
} satisfies CSSAttribute;
export const activeDotInner = { stroke: "none" } satisfies CSSAttribute;
export const crosshairLine = {
  stroke: "var(--openui-border-default, oklch(0.097 0 0 / 0.06))",
  strokeWidth: 1,
  strokeDasharray: "4 4",
} satisfies CSSAttribute;
