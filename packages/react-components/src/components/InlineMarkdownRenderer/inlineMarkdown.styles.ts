import type { StyleCss } from "../../styles/useStyles";

export const names = {
  root: "openui-inline-markdown-renderer",
  content: "openui-inline-markdown-renderer-content",
} as const;

export const inlineMarkdownStyles = (css: StyleCss) => ({
  // The span is inline by default; leave display to callers such as TextBlock's hidden row.
  root: css`
    --_openui-inline-markdown-renderer-root-composite-typography: var(
      --_openui-composite-card-inline,
      0
    );
    text-align: inherit;
  `,
  content: css`
    all: unset;
    display: inline;
    color: inherit;
    font: inherit;
    letter-spacing: inherit;
    text-align: inherit;
    margin: 0;
    padding: 0;
  `,
});
