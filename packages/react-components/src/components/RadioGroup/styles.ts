import type { CSSAttribute } from "goober";
export const componentStyles = {
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  gap: "var(--openui-space-xs, 6px)",
  border: "1px solid",
  borderRadius: "var(--openui-radius-xl, 12px)",
  "&.openui-radio-group-clear": {
    borderColor: "transparent",
    backgroundColor: "transparent",
    padding: "var(--openui-space-000, 0px)",
  },
  "&.openui-radio-group-card": {
    borderColor: "var(--openui-border-default, oklch(0.097 0 0 / 0.06))",
    padding: "var(--openui-space-m, 12px)",
  },
  "&.openui-radio-group-sunk": {
    borderColor: "var(--openui-border-default, oklch(0.097 0 0 / 0.06))",
    backgroundColor: "var(--openui-sunk, oklch(0.097 0 0 / 0.04))",
    padding: "var(--openui-space-m, 12px)",
  },
} satisfies CSSAttribute;
