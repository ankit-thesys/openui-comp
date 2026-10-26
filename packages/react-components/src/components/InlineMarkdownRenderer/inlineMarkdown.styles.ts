import { css, type CSSAttribute } from "goober";
export const rootClass = css({
  display: "inline",
  textAlign: "inherit",
  "& .openui-markdown-renderer": {
    all: "unset",
    display: "inline",
    color: "inherit",
    font: "inherit",
    letterSpacing: "inherit",
    textAlign: "inherit",
  },
  "& p, & .openui-markdown-renderer p": {
    display: "inline",
    margin: 0,
    padding: 0,
    textAlign: "inherit",
  },
  "& > *": { display: "inline", margin: 0, padding: 0, textAlign: "inherit" },
} satisfies CSSAttribute);
