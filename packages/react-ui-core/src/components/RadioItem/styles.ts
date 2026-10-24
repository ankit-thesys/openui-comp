import type { CSSAttribute } from "goober";
const body = {
  font: 'var(--openui-text-body-default, 400 16px/1.5 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-body-default-letter-spacing, -0.01em)",
  fontVariationSettings: 'var(--openui-font-variation-regular, "wght" 440)',
};
export const componentStyles = {
  display: "flex",
  alignItems: "flex-start",
  gap: "var(--openui-space-s, 8px)",
  padding: "var(--openui-space-3xs, 2px) var(--openui-space-000, 0px)",
  width: "100%",
  maxWidth: "100%",
  overflow: "hidden",
  cursor: "pointer",
  "&:disabled": { cursor: "not-allowed" },
  "& .openui-radio-item-root": {
    boxSizing: "border-box",
    flexShrink: 0,
    borderRadius: "var(--openui-radius-full, 9999px)",
    border: "none",
    height: "16px",
    width: "16px",
    cursor: "pointer",
    backgroundColor: "transparent",
    marginTop: "var(--openui-space-2xs, 4px)",
    "&[data-state]": { position: "relative" },
    "&:disabled": { opacity: 0.5, cursor: "not-allowed" },
  },
  "& .openui-radio-item-svg": {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
  },
  '& .openui-radio-item-root[data-state="unchecked"] .openui-radio-item-svg-path': {
    fill: "var(--openui-foreground, oklch(0.994 0 89.876 / 1))",
  },
  '& .openui-radio-item-root[data-state="unchecked"] .openui-radio-item-root:enabled:hover .openui-radio-item-svg-path':
    { fill: "var(--openui-foreground, oklch(0.994 0 89.876 / 1))" },
  '& .openui-radio-item-root[data-state="checked"] .openui-radio-item-svg-path': {
    fill: "var(--openui-interactive-accent-default, oklch(0.546 0.215 262.881 / 1))",
  },
  '& .openui-radio-item-root[data-state="unchecked"] .openui-radio-item-svg-border': {
    stroke: "var(--openui-border-interactive, oklch(0.097 0 0 / 0.12))",
  },
  '& .openui-radio-item-root[data-state="checked"] .openui-radio-item-svg-border': {
    stroke: "var(--openui-border-accent, oklch(0.546 0.215 262.881 / 0.08))",
  },
  '& .openui-radio-item-root[data-state="checked"] .openui-radio-item-svg-inner': {
    fill: "var(--openui-foreground, oklch(0.994 0 89.876 / 1))",
  },
  '& .openui-radio-item-root[data-state="unchecked"] .openui-radio-item-svg-inner': {
    fill: "var(--openui-foreground, oklch(0.994 0 89.876 / 1))",
  },
  '& .openui-radio-item-root[data-state="unchecked"]:enabled:hover .openui-radio-item-svg-inner': {
    fill: "var(--openui-border-interactive, oklch(0.097 0 0 / 0.12))",
  },
  "& .openui-radio-item-content": { display: "flex", flexDirection: "column", minWidth: 0 },
  "& .openui-radio-item-label": {
    ...body,
    flex: 1,
    color: "var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1))",
    cursor: "pointer",
    overflowWrap: "anywhere",
    "&:disabled": {
      color: "var(--openui-text-neutral-tertiary, oklch(0.097 0 0 / 0.2))",
      cursor: "not-allowed",
    },
  },
  "& .openui-radio-item-description": {
    ...body,
    color: "var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6))",
    overflowWrap: "anywhere",
  },
} satisfies CSSAttribute;
