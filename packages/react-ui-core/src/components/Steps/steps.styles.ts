import type { CSSAttribute } from "goober";
export const stepsStyles = {
  minWidth: "280px",
  width: "100%",
  margin: "0 auto",
  "& .openui-steps": { display: "flex", flexDirection: "column" },
} satisfies CSSAttribute;

export const stepItemStyles = {
  display: "flex",
  position: "relative",
  gap: "var(--openui-space-m, 12px)",
  "& .openui-step-connector": { display: "flex", flexDirection: "column", alignItems: "center" },
  "& .openui-step-number": {
    padding: "var(--openui-space-2xs, 4px) 0px var(--openui-space-2xs, 4px) 0px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  "& .openui-step-number-inner": {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    backgroundColor: "var(--openui-elevated, oklch(0.097 0 0 / 0.08))",
    color: "var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6))",
    border: "1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06))",
    boxSizing: "border-box",
    font: 'var(--openui-text-label-sm, 400 14px/1.25 "Inter", sans-serif)',
    letterSpacing: "var(--openui-text-label-sm-letter-spacing, -0.01em)",
    fontVariationSettings: 'var(--openui-font-variation-regular, "wght" 440)',
  },
  "& .openui-connector-line": {
    width: "1px",
    flexGrow: 1,
    zIndex: 1,
    backgroundColor: "var(--openui-sunk, oklch(0.097 0 0 / 0.04))",
  },
  "&:last-child .openui-connector-line": { display: "none" },
  "& .openui-step-content": {
    paddingTop: "var(--openui-space-2xs, 4px)",
    display: "flex",
    flexDirection: "column",
    gap: "var(--openui-space-3xs, 2px)",
    marginBottom: "var(--openui-space-l, 18px)",
  },
  "&:last-child .openui-step-content": { marginBottom: 0 },
  // Legacy typography(title, default) emits no declarations; retain inherited text.
  "& .openui-step-title": {
    color: "var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6))",
  },
  "& .openui-step-details": {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "calc(var(--openui-space-m, 12px) + 2px)",
    font: 'var(--openui-text-body-default, 400 16px/1.5 "Inter", sans-serif)',
    letterSpacing: "var(--openui-text-body-default-letter-spacing, -0.01em)",
    fontVariationSettings: 'var(--openui-font-variation-regular, "wght" 440)',
  },
} satisfies CSSAttribute;
