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
  "& .openui-checkbox-item-root": {
    display: "inline-flex",
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    width: "16px",
    height: "16px",
    borderRadius: "var(--openui-radius-xs, 4px)",
    border: "1px solid var(--openui-border-interactive, oklch(0.097 0 0 / 0.12))",
    cursor: "pointer",
    marginTop: "var(--openui-space-2xs, 4px)",
    backgroundColor: "transparent",
    '&[data-state="checked"]': {
      backgroundColor: "var(--openui-interactive-accent-default, oklch(0.546 0.215 262.881 / 1))",
      color: "var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1))",
    },
    '&:hover:not(:disabled):not([data-state="checked"])': {
      borderColor: "var(--openui-border-interactive, oklch(0.097 0 0 / 0.12))",
      backgroundColor: "var(--openui-sunk, oklch(0.097 0 0 / 0.04))",
      color: "var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6))",
    },
    "&:disabled": {
      cursor: "not-allowed",
      color: "var(--openui-text-neutral-tertiary, oklch(0.097 0 0 / 0.2))",
    },
  },
  "& .openui-checkbox-item-indicator": {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--openui-text-accent-primary, oklch(0.994 0 89.876 / 1))",
  },
  "& .openui-checkbox-item-content": { display: "flex", flexDirection: "column", minWidth: 0 },
  "& .openui-checkbox-item-label": {
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
  "& .openui-checkbox-item-description": {
    ...body,
    color: "var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6))",
    overflowWrap: "anywhere",
  },
} satisfies CSSAttribute;
