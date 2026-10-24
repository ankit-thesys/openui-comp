import type { CSSAttribute } from "goober";

// Light fallbacks keep standalone controls styled without importing the theme tables.
export const inputStyles = {
  font: 'var(--openui-text-body-default, 400 16px/1.5 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-body-default-letter-spacing, -0.01em)",
  fontVariationSettings: 'var(--openui-font-variation-regular, "wght" 440)',
  border: "1px solid var(--openui-border-interactive, oklch(0.097 0 0 / 0.12))",
  borderRadius: "var(--openui-radius-l, 10px)",
  boxSizing: "border-box",
  width: "100%",
  gap: "var(--openui-space-xs, 6px)",
  backgroundColor: "var(--openui-highlight-subtle, oklch(0.097 0 0 / 0.02))",
  color: "var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1))",
  transition: "box-shadow 0.16s ease, border-color 0.16s ease, background-color 0.16s ease",
  "&.openui-input-small": {
    borderRadius: "calc(var(--openui-radius-m, 8px) - 1px)",
    padding: "calc(var(--openui-space-2xs, 4px) - 1px) var(--openui-space-s, 8px)",
  },
  "&.openui-input-medium": {
    borderRadius: "var(--openui-radius-m, 8px)",
    padding: "calc(var(--openui-space-xs, 6px) - 1px) calc(var(--openui-space-m, 12px) - 1px)",
  },
  "&.openui-input-large": {
    padding: "calc(var(--openui-space-s, 8px) - 1px) var(--openui-space-m, 12px)",
  },
  "&::placeholder": { color: "var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6))" },
  "&:focus": {
    outline: "none",
    boxShadow: "0 0 0 2.5px var(--openui-border-default, oklch(0.097 0 0 / 0.06))",
  },
  "&:focus:not(.openui-input-error)": {
    borderColor: "var(--openui-border-interactive-emphasis, oklch(0.097 0 0 / 0.3))",
  },
  "&:disabled": {
    backgroundColor: "var(--openui-sunk, oklch(0.097 0 0 / 0.04))",
    border: "1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06))",
    cursor: "not-allowed",
    color: "var(--openui-text-neutral-tertiary, oklch(0.097 0 0 / 0.2))",
  },
  "&:hover:not(:focus):not(:disabled):not(.openui-input-error)": {
    borderColor: "var(--openui-border-interactive, oklch(0.097 0 0 / 0.12))",
  },
  // Match the original error-class specificity so disabled borders retain priority.
  "&:where(.openui-input-error)": {
    borderColor: "var(--openui-border-danger-emphasis, oklch(0.577 0.215 27.325 / 1))",
    boxShadow: "0 0 0 2.5px var(--openui-border-danger, oklch(0.577 0.215 27.325 / 0.08))",
  },
  "&:focus:where(.openui-input-error)": {
    borderColor: "var(--openui-border-danger-emphasis, oklch(0.577 0.215 27.325 / 1))",
    boxShadow: "0 0 0 2.5px var(--openui-border-danger, oklch(0.577 0.215 27.325 / 0.08))",
  },
} satisfies CSSAttribute;
