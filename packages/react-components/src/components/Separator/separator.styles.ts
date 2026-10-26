import type { CSSAttribute } from "goober";
export const separatorStyles = {
  backgroundColor: "var(--openui-border-default, oklch(0.097 0 0 / 0.06))",
  '&[data-orientation="horizontal"]': { height: "1px", width: "100%" },
  '&[data-orientation="vertical"]': { width: "1px", height: "100%" },
} satisfies CSSAttribute;
