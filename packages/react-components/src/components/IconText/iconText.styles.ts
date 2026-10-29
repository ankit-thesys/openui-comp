import type { StyleCss } from "../../styles/useStyles";
export const names = {
  root: "openui-icon-text",
  content: "openui-icon-text-content",
  layout: {
    horizontal: "openui-icon-text--layout-horizontal",
    vertical: "openui-icon-text--layout-vertical",
  },
  bold: { true: "openui-icon-text--bold" },
  iconVariant: {
    neutral: "openui-icon-text--icon-variant-neutral",
    info: "openui-icon-text--icon-variant-info",
    success: "openui-icon-text--icon-variant-success",
    warning: "openui-icon-text--icon-variant-warning",
    danger: "openui-icon-text--icon-variant-danger",
    inverted: "openui-icon-text--icon-variant-inverted",
    filled: "openui-icon-text--icon-variant-filled",
    soft: "openui-icon-text--icon-variant-soft",
  },
} as const;
export const iconTextStyles = (css: StyleCss) => ({
  root: css`
    display: flex;
    gap: var(--openui-space-m, 12px);
  `,
  content: css`
    display: flex;
    flex-direction: column;
    min-width: 0;
  `,
  layout: {
    horizontal: css`
      flex-direction: row;
      align-items: flex-start;
      --_openui-icon-tag-margin-top: var(--openui-space-3xs, 2px);
    `,
    vertical: css`
      flex-direction: column;
      align-items: flex-start;
      --_openui-icon-tag-margin-top: 0px;
    `,
  },
});
