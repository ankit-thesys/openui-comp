// PROTOTYPE: stands in for a library component module. Its rules register at import time,
// before the app has called configureStyles().
import { css } from "./hookfree-css.mjs";

export const button = css`
  background: rgb(17, 17, 17);
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  &:hover {
    background: rgb(51, 51, 51);
  }
`;
