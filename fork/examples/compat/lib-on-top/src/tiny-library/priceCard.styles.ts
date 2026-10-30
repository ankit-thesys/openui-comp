import { css, keyframes } from "@openuidev/react-components";
export const pulse = keyframes`from { outline-offset: 1px; } to { outline-offset: 2px; }`;
export const priceCard = css`
  background-color: rgb(42, 63, 84);
  padding: 23px;
  animation: ${pulse} 1ms linear;
`;
