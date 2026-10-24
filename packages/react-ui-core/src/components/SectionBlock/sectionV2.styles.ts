import type { CSSAttribute } from "goober";
export const sectionStyles = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "center",
  gap: "var(--openui-space-xl, 24px)",
  marginTop: "var(--openui-space-m, 12px)",
  "& .openui-section-v2-wrapper": {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    width: "100%",
    gap: "var(--openui-space-xl, 24px)",
  },
  "& .openui-section-v2-header": {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: "var(--openui-space-s, 8px)",
    marginBottom: "var(--openui-space-2xs, 4px)",
  },
  "& .openui-section-v2-header-trigger": {
    font: 'var(--openui-text-heading-sm, 600 18px/1.25 "Inter", sans-serif)',
    letterSpacing: "var(--openui-text-heading-sm-letter-spacing, -0.01em)",
    color: "var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1))",
  },
  "& .openui-section-v2-content": {
    width: "100%",
    gap: "var(--openui-space-xl, 24px)",
    display: "flex",
    flexDirection: "column",
  },
} satisfies CSSAttribute;
