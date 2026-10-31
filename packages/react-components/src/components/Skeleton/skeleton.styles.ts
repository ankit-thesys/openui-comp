import type { StyleCss } from "../../styles/useStyles";

export const names = {
  root: "openui-skeleton",
  bar: "openui-skeleton-bar",
} as const;

export const skeletonStyles = (css: StyleCss) => ({
  root: css`
    display: flex;
    flex-direction: column;
    gap: var(--openui-space-s, 8px);
  `,
});

export const skeletonBarStyles = (css: StyleCss) => ({
  root: css`
    background-color: var(--openui-elevated, oklch(0.097 0 0 / 0.08));
    border-radius: var(--_openui-skeleton-bar-border-radius, var(--openui-radius-s, 6px));
    height: var(--_openui-skeleton-bar-height);
    width: var(--_openui-skeleton-bar-width);
  `,
});
