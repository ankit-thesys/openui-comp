import type { CSSAttribute } from "goober";
export const cardHeaderStyles = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--openui-space-xs, 6px)",
  marginBottom: "var(--openui-space-2xs, 4px)",
  overflowWrap: "break-word",
  "& .openui-header-top": {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  "& .openui-header-top-left": {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "var(--openui-space-xs, 6px)",
    color: "var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1))",
    font: 'var(--openui-text-heading-sm, 600 18px/1.25 "Inter", sans-serif)',
    letterSpacing: "var(--openui-text-heading-sm-letter-spacing, -0.01em)",
  },
  "& .openui-header-top-left-icon": {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "1em",
    width: "1em",
  },
  "& .openui-header-top-right": {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "var(--openui-space-2xs, 4px)",
  },
  "& .openui-header-bottom": {
    color: "var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6))",
    font: 'var(--openui-text-body-default, 400 16px/1.5 "Inter", sans-serif)',
    letterSpacing: "var(--openui-text-body-default-letter-spacing, -0.01em)",
    fontVariationSettings: 'var(--openui-font-variation-regular, "wght" 440)',
  },
} satisfies CSSAttribute;
