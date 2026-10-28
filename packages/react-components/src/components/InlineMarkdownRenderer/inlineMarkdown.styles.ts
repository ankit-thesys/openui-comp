import { css } from "goober";
export const rootClass = css`
  display: inline;
  text-align: inherit;
  & .openui-markdown-renderer {
    all: unset;
    display: inline;
    color: inherit;
    font: inherit;
    letter-spacing: inherit;
    text-align: inherit;
  }
  & p,
  & .openui-markdown-renderer p {
    display: inline;
    margin: 0;
    padding: 0;
    text-align: inherit;
  }
  & > * {
    display: inline;
    margin: 0;
    padding: 0;
    text-align: inherit;
  }
`;
