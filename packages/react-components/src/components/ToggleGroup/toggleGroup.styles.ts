import type { StyleCss } from "../../styles/useStyles";

export const names = { root: "openui-toggle-group" } as const;

export const toggleGroupStyles = (css: StyleCss) => ({
  root: css`
    display: flex;
    width: 100%;
    gap: var(--openui-space-m, 12px);
    box-sizing: border-box;
    flex-direction: row;
    flex-wrap: wrap;
  `,
});
