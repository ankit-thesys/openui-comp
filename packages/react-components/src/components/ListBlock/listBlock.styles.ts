import { css } from "goober";
export const rootClass = css`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  gap: var(--openui-space-l, 18px);
  &:where(.openui-list-block--small) {
    gap: var(--openui-space-m, 12px);
  }
`;
