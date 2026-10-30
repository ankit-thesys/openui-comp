import { extractCss, glob } from "goober-under-test";
import { css, getComponentStyles, keyframes } from "openui-under-test";

const animation = keyframes`from { opacity: 0.12; } to { opacity: 0.88; }`;
const imported = css`
  color: rgb(13, 27, 39);
  animation: ${animation} 2s linear;
`;

export const sheetFixture = {
  css,
  keyframes,
  getComponentStyles,
  extractCss,
  glob,
  imported,
  animation,
};
(window as Window & { sheetFixture?: typeof sheetFixture }).sheetFixture = sheetFixture;
