// PROTOTYPE: a code-split module, imported only after configureStyles() has run.
import { css, keyframes } from "./hookfree-css.mjs";

const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;

export const card = css`
  background: rgb(240, 240, 255);
  border: 2px solid rgb(17, 17, 17);
  padding: 12px;
  animation: ${fadeIn} 200ms ease-out;
`;
