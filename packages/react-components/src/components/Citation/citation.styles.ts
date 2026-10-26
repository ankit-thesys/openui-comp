import { css, keyframes, type CSSAttribute } from "goober";
const down = keyframes({
  from: { opacity: 0, transform: "translateY(-2px)" },
  to: { opacity: 1, transform: "translateY(0)" },
});
const up = keyframes({
  from: { opacity: 0, transform: "translateY(2px)" },
  to: { opacity: 1, transform: "translateY(0)" },
});
const left = keyframes({
  from: { opacity: 0, transform: "translateX(2px)" },
  to: { opacity: 1, transform: "translateX(0)" },
});
const right = keyframes({
  from: { opacity: 0, transform: "translateX(-2px)" },
  to: { opacity: 1, transform: "translateX(0)" },
});
export const containerClass = css({ position: "relative", display: "inline-flex" });
export const triggerClass = css({
  height: "20px",
  width: "20px",
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "var(--openui-space-3xs, 2px)",
  backgroundColor: "var(--openui-highlight-strong, oklch(0.097 0 0 / 0.08))",
  marginLeft: "var(--openui-space-3xs, 2px)",
  border: "none",
  borderRadius: "var(--openui-radius-xs, 4px)",
  cursor: "pointer",
  transition: "all 0.2s ease-in-out",
  "& svg": { color: "var(--openui-text-neutral-tertiary, oklch(0.097 0 0 / 0.2))" },
  '&:hover svg,&[data-state="delayed-open"] svg,&[data-state="instant-open"] svg': {
    color: "var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1))",
  },
  "&:active": { backgroundColor: "var(--openui-highlight-strong, oklch(0.097 0 0 / 0.08))" },
  "&:focus-visible": {
    outline: "2px solid var(--openui-border-interactive, oklch(0.097 0 0 / 0.12))",
    outlineOffset: "2px",
  },
} satisfies CSSAttribute);
export const tooltipClass = css({
  backgroundColor: "var(--openui-foreground, oklch(0.994 0 89.876 / 1))",
  border: "1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06))",
  borderRadius: "var(--openui-radius-xl, 12px)",
  boxShadow:
    "var(--openui-shadow-s, 0 1px 3px -2px oklch(0 0 0 / 0.02), 0 2px 5px -2px oklch(0 0 0 / 0.04))",
  whiteSpace: "nowrap",
  color: "var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1))",
  zIndex: 1000,
  pointerEvents: "all",
  overflow: "hidden",
  '&[data-state="delayed-open"]': {
    '&[data-side="top"]': { animation: `${down} 0.2s ease-in-out` },
    '&[data-side="bottom"]': { animation: `${up} 0.2s ease-in-out` },
    '&[data-side="right"]': { animation: `${left} 0.2s ease-in-out` },
    '&[data-side="left"]': { animation: `${right} 0.2s ease-in-out` },
  },
} satisfies CSSAttribute);
export const tooltipContentClass = css({
  padding: "var(--openui-space-xs, 6px)",
  display: "flex",
  flexDirection: "column",
  gap: "var(--openui-space-2xs, 4px)",
  overflowY: "auto",
  maxHeight: "min(50vh)",
  scrollbarWidth: "thin",
  scrollbarColor: "var(--openui-border-default, oklch(0.097 0 0 / 0.06)) transparent",
  "&::-webkit-scrollbar": { width: "6px" },
  "&::-webkit-scrollbar-track": { background: "transparent" },
  "&::-webkit-scrollbar-thumb": {
    background: "var(--openui-border-default, oklch(0.097 0 0 / 0.06))",
    borderRadius: "var(--openui-radius-full, 9999px)",
  },
} satisfies CSSAttribute);
