import type { CSSAttribute } from "goober";
import { keyframes } from "goober";
const body = {
  font: 'var(--openui-text-body-default, 400 16px/1.5 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-body-default-letter-spacing, -0.01em)",
  fontVariationSettings: 'var(--openui-font-variation-regular, "wght" 440)',
};
const down = keyframes({
  from: { height: 0 },
  to: { height: "var(--radix-accordion-content-height)" },
});
const up = keyframes({
  from: { height: "var(--radix-accordion-content-height)" },
  to: { height: 0 },
});
export const accordionStyles = {
  boxSizing: "border-box",
  borderRadius: "var(--openui-radius-2xl, 14px)",
  border: "1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06))",
  padding: "calc(var(--openui-space-m, 12px) + 2px)",
  paddingBottom: 0,
  "&.openui-accordion-clear": {
    border: "1px solid transparent",
    boxShadow: "none",
    padding: 0,
    "& .openui-accordion-trigger": {
      boxShadow: "none",
      paddingLeft: 0,
      paddingRight: 0,
      paddingTop: "var(--openui-space-l, 18px)",
      paddingBottom: "var(--openui-space-l, 18px)",
    },
    "& .openui-accordion-item:first-child .openui-accordion-trigger": { paddingTop: 0 },
    "& .openui-accordion-item:last-child": {
      borderBottomLeftRadius: "0px",
      borderBottomRightRadius: "0px",
      borderBottom: "1px solid transparent",
    },
    "& .openui-accordion-content-wrapper": {
      padding: 0,
      paddingBottom: "var(--openui-space-l, 18px)",
      gap: "var(--openui-space-m, 12px)",
    },
  },
  "&.openui-accordion-card": {
    "& .openui-accordion-content-wrapper": {
      padding: 0,
      paddingBottom: "var(--openui-space-m, 12px)",
      gap: "var(--openui-space-l, 18px)",
    },
    "& .openui-accordion-item:last-child .openui-accordion-trigger": { borderBottom: "none" },
    "& .openui-accordion-item:last-child": {
      borderBottomLeftRadius: "0px",
      borderBottomRightRadius: "0px",
      borderBottom: "none",
    },
  },
  "&.openui-accordion-sunk": {
    backgroundColor: "var(--openui-highlight-subtle, oklch(0.097 0 0 / 0.02))",
    "& .openui-accordion-content-wrapper": {
      padding: 0,
      paddingBottom: "var(--openui-space-m, 12px)",
      gap: "var(--openui-space-l, 18px)",
    },
    "& .openui-accordion-item:last-child .openui-accordion-trigger": { borderBottom: "none" },
  },
  "& .openui-accordion-item": {
    boxSizing: "border-box",
    overflow: "hidden",
    borderBottom: "1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06))",
    "&:first-child": {
      marginTop: 0,
      borderTopLeftRadius: "4px",
      borderTopRightRadius: "4px",
      "& .openui-accordion-trigger": { paddingTop: 0 },
    },
    "&:last-child": {
      borderBottomLeftRadius: "4px",
      borderBottomRightRadius: "4px",
      borderBottom: "none",
    },
    "&:focus-within": { position: "relative", zIndex: 1 },
  },
  "& .openui-accordion-header": {
    display: "flex",
    marginBlockStart: 0,
    marginBlockEnd: 0,
    marginInlineStart: 0,
    marginInlineEnd: 0,
  },
  // Preserve the legacy trigger specificity against host disabled-button rules.
  "& :where(.openui-accordion-trigger)": {
    border: "none",
    boxSizing: "border-box",
    ...body,
    backgroundColor: "transparent",
    padding: "var(--openui-space-l, 18px) 0",
    width: "100%",
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    color: "var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1))",
    cursor: "pointer",
    '&[data-state="open"] .openui-accordion-trigger-icon': { transform: "rotate(180deg)" },
  },
  "& .openui-accordion-trigger-content": {
    display: "flex",
    alignItems: "center",
    color: "var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1))",
    gap: "var(--openui-space-xs, 6px)",
  },
  "& .openui-accordion-trigger-content-icon": {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "16px",
    width: "16px",
  },
  "& .openui-accordion-trigger-icon": {
    color: "var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1))",
    height: "16px",
    width: "16px",
    transition: "transform 300ms cubic-bezier(0.87, 0, 0.13, 1)",
  },
  "& .openui-accordion-content": {
    overflow: "hidden",
    color: "var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1))",
    ...body,
    '&[data-state="open"]': { animation: `${down} 300ms cubic-bezier(0.87, 0, 0.13, 1)` },
    '&[data-state="closed"]': { animation: `${up} 300ms cubic-bezier(0.87, 0, 0.13, 1)` },
  },
  "& .openui-accordion-content-wrapper": {
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    padding: 0,
    gap: "var(--openui-space-l, 18px)",
  },
} satisfies CSSAttribute;
