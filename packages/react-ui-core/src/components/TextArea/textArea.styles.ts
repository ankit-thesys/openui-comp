import type { CSSAttribute } from "goober";

export const textAreaStyles = {
  font: 'var(--openui-text-body-default, 400 16px/1.5 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-body-default-letter-spacing, -0.01em)",
  fontVariationSettings: 'var(--openui-font-variation-regular, "wght" 440)',
  boxSizing: "border-box",
  width: "100%",
  border: "1px solid var(--openui-border-interactive, oklch(0.097 0 0 / 0.12))",
  borderRadius: "var(--openui-radius-xl, 12px)",
  padding: "var(--openui-space-s, 8px) var(--openui-space-m, 12px)",
  gap: "var(--openui-space-xs, 6px)",
  backgroundColor: "var(--openui-highlight-subtle, oklch(0.097 0 0 / 0.02))",
  color: "var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1))",
  outline: "none",
  resize: "none",
  transition: "box-shadow 0.16s ease, border-color 0.16s ease, background-color 0.16s ease",
  "&::placeholder": { color: "var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6))" },
  "&:focus": { boxShadow: "0 0 0 2.5px var(--openui-border-default, oklch(0.097 0 0 / 0.06))" },
  "&:focus:not(.openui-textarea-error)": {
    borderColor: "var(--openui-border-interactive-emphasis, oklch(0.097 0 0 / 0.3))",
  },
  "&:disabled": {
    backgroundColor: "var(--openui-sunk, oklch(0.097 0 0 / 0.04))",
    border: "1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06))",
    cursor: "not-allowed",
    color: "var(--openui-text-neutral-tertiary, oklch(0.097 0 0 / 0.2))",
  },
  "&:hover:not(:focus):not(:disabled):not(.openui-textarea-error)": {
    borderColor: "var(--openui-border-interactive, oklch(0.097 0 0 / 0.12))",
  },
  "&:where(.openui-textarea-error)": {
    borderColor: "var(--openui-border-danger-emphasis, oklch(0.577 0.215 27.325 / 1))",
  },
} satisfies CSSAttribute;
