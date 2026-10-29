import type { StyleCss } from "../../styles/useStyles";

export const names = {
  root: "openui-inline-markdown-renderer",
  content: "openui-inline-markdown-renderer-content",
  // No rule of its own: the composed renderer's `typography` modifier carries the look.
  typography: {
    inherit: "openui-inline-markdown-renderer--typography-inherit",
  },
} as const;

export const inlineMarkdownStyles = (css: StyleCss) => ({
  // The span is inline by default; leave display to callers such as TextBlock's hidden row.
  root: css`
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
