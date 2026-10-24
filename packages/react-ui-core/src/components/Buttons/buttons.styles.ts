import type { CSSAttribute } from "goober";
export const buttonsStyles = {
  display: "flex",
  width: "100%",
  gap: "var(--openui-space-m, 12px)",
  boxSizing: "border-box",
  "&.openui-buttons-horizontal": { flexDirection: "row", flexWrap: "wrap" },
  "&.openui-buttons-vertical": { flexDirection: "column" },
} satisfies CSSAttribute;
