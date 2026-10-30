import { css, keyframes } from "openui-under-test";

export const animation = keyframes`from { opacity: 0.21; } to { opacity: 0.79; }`;
export const lazy = css`
  animation: ${animation} 3s linear;
  color: rgb(31, 53, 75);
`;
