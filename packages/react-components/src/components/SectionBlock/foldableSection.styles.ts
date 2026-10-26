import type { CSSAttribute } from "goober";
export const rootStyles = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--openui-space-l, 18px)",
  "&.openui-foldable-section": { boxSizing: "border-box", padding: 0, margin: 0, width: "100%" },
} satisfies CSSAttribute;
export const itemStyles = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "var(--openui-space-l, 18px)",
} satisfies CSSAttribute;
export const headerStyles = {
  display: "flex",
  marginBlockStart: 0,
  marginBlockEnd: 0,
  marginInlineStart: 0,
  marginInlineEnd: 0,
} satisfies CSSAttribute;
export const triggerStyles = {
  backgroundColor: "transparent",
  border: "none",
  padding: "var(--openui-space-m, 12px) 0 var(--openui-space-xs, 6px) 0",
  width: "100%",
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  color: "var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1))",
  cursor: "pointer",
  "& .openui-foldable-section-trigger-content-wrapper": {
    display: "flex",
    flexDirection: "column",
    gap: "var(--openui-space-l, 18px)",
    alignItems: "start",
    justifyContent: "center",
    width: "100%",
  },
  "& .openui-foldable-section-trigger-content-separator": {
    margin: "var(--openui-space-3xs, 2px)",
  },
  "& .openui-foldable-section-trigger-content-icon-button-wrapper": {
    display: "flex",
    alignItems: "center",
    justifyContent: "start",
    gap: "var(--openui-space-s, 8px)",
    width: "100%",
  },
  "& .openui-foldable-section-trigger-content-icon-button": { flexShrink: 0 },
  "& .openui-foldable-section-trigger-content-icon-button-icon": {
    transition: "transform 300ms cubic-bezier(0.87, 0, 0.13, 1)",
  },
  '&[data-state="open"] .openui-foldable-section-trigger-content-icon-button-icon': {
    transform: "rotate(90deg)",
  },
  "& .openui-foldable-section-trigger-content-text": {
    font: 'var(--openui-text-heading-sm, 600 18px/1.25 "Inter", sans-serif)',
    letterSpacing: "var(--openui-text-heading-sm-letter-spacing, -0.01em)",
    flexGrow: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "start",
    padding: 0,
    margin: 0,
  },
} satisfies CSSAttribute;
export const contentStyles = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "var(--openui-space-xl, 24px)",
  padding: "0 0 0 28px",
  '&[data-state="open"]': { height: "fit-content" },
  '&[data-state="closed"]': { height: 0 },
} satisfies CSSAttribute;
