import type { CSSAttribute } from "goober";
const body = {
  font: 'var(--openui-text-body-default, 400 16px/1.5 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-body-default-letter-spacing, -0.01em)",
  fontVariationSettings: 'var(--openui-font-variation-regular, "wght" 440)',
};
export const componentStyles = {
  boxSizing: "border-box",
  display: "flex",
  alignItems: "flex-start",
  gap: "var(--openui-space-s, 8px)",
  maxWidth: "100%",
  width: "100%",
  overflow: "hidden",
  padding: "var(--openui-space-3xs, 2px) var(--openui-space-000, 0px)",
  "& .openui-switch-item-root": {
    position: "relative",
    display: "inline-block",
    flexShrink: 0,
    height: "16px",
    width: "24px",
    marginTop: "var(--openui-space-2xs, 4px)",
    cursor: "pointer",
    borderRadius: "var(--openui-radius-full, 9999px)",
    padding: "var(--openui-space-3xs, 2px)",
    border: "1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06))",
    backgroundColor: "var(--openui-sunk, oklch(0.097 0 0 / 0.04))",
    transitionProperty: "background-color",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    transitionDuration: "150ms",
    '&:hover:not([data-disabled], [data-state="checked"])': {
      border: "1px solid var(--openui-border-interactive, oklch(0.097 0 0 / 0.12))",
    },
    '&[data-state="checked"]': {
      backgroundColor: "var(--openui-interactive-accent-default, oklch(0.546 0.215 262.881 / 1))",
      border: "1px solid var(--openui-border-accent, oklch(0.546 0.215 262.881 / 0.08))",
    },
    "&[data-disabled]": { opacity: 0.5, cursor: "not-allowed" },
  },
  "& .openui-switch-item-thumb": {
    position: "absolute",
    display: "block",
    height: "10px",
    width: "10px",
    borderRadius: "var(--openui-radius-full, 9999px)",
    border: "none",
    backgroundColor: "var(--openui-foreground, oklch(0.994 0 89.876 / 1))",
    transform: "translateY(-50%) translateX(0px)",
    transitionProperty: "transform",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    transitionDuration: "150ms",
    boxShadow:
      "var(--openui-shadow-s, 0 1px 3px -2px oklch(0 0 0 / 0.02), 0 2px 5px -2px oklch(0 0 0 / 0.04))",
    '&[data-state="checked"]': {
      transform: "translateY(-50%) translateX(8px)",
      borderColor: "var(--openui-border-interactive, oklch(0.097 0 0 / 0.12))",
    },
  },
  "& .openui-switch-item-label": {
    ...body,
    flex: 1,
    color: "var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1))",
    "&:disabled": { color: "var(--openui-text-neutral-tertiary, oklch(0.097 0 0 / 0.2))" },
  },
  "& .openui-switch-item-description": {
    ...body,
    color: "var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6))",
  },
} satisfies CSSAttribute;
