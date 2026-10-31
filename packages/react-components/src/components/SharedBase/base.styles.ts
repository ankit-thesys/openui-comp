import type { StyleCss } from "../../styles/useStyles";

export const names = { root: "openui-border-box" } as const;

// Explicit opt-in preserves the three roots' existing applicability. Register through
// useStyles at render, so SSR and cssLayer use the same flat rule as other factories.
export const baseStyles = (css: StyleCss) => ({
  root: css`
    box-sizing: border-box;
  `,
});
