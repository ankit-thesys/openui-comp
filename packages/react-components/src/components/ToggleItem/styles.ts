import type { CSSAttribute } from "goober";
export const componentStyles = {
  boxSizing: "border-box",
  font: 'var(--openui-text-body-default, 400 16px/1.5 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-body-default-letter-spacing, -0.01em)",
  fontVariationSettings: 'var(--openui-font-variation-regular, "wght" 440)',
  padding: "var(--openui-space-m, 12px)",
  borderRadius: "var(--openui-radius-m, 8px)",
  border: "1px solid transparent",
  cursor: "pointer",
  transition: "all 0.2s ease",
  display: "flex",
  gap: "var(--openui-space-2xs, 4px)",
  alignItems: "center",
  backgroundColor: "var(--openui-foreground, oklch(0.994 0 89.876 / 1))",
  color: "var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1))",
  borderColor: "var(--openui-border-default, oklch(0.097 0 0 / 0.06))",
  "&:hover": { backgroundColor: "var(--openui-sunk, oklch(0.097 0 0 / 0.04))" },
  "&:disabled": {
    color: "var(--openui-text-neutral-tertiary, oklch(0.097 0 0 / 0.2))",
    borderColor: "var(--openui-border-default, oklch(0.097 0 0 / 0.06))",
    cursor: "not-allowed",
  },
  '&[data-state="on"]': {
    backgroundColor: "var(--openui-interactive-accent-default, oklch(0.546 0.215 262.881 / 1))",
    color: "var(--openui-text-accent-primary, oklch(0.994 0 89.876 / 1))",
    "&:hover": {
      backgroundColor: "var(--openui-interactive-accent-hover, oklch(0.546 0.215 262.881 / 0.8))",
    },
    "&:disabled": { opacity: 0.5, cursor: "not-allowed" },
  },
} satisfies CSSAttribute;
