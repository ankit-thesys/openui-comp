import type { StyleCss } from "../../styles/useStyles";

export const names = { root: "openui-form-control" } as const;

export const formControlStyles = (css: StyleCss) => ({
  root: css`
    display: flex;
    flex-direction: column;
    gap: var(--openui-space-s, 8px);
  `,
});
