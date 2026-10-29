import type { StyleCss } from "../../styles/useStyles";

export const names = { root: "openui-source-favicon-image" } as const;

export const sourceFaviconImageStyles = (css: StyleCss) => ({
  root: css`
    object-fit: cover;
    display: flex;
  `,
});
