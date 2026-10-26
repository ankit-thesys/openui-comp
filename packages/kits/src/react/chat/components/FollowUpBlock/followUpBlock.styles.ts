import { css } from "goober";

export const rootClass = css`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
`;

export const headerClass = css`
  color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
  border-bottom: 1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06));
  padding-top: var(--openui-space-s, 8px);
  padding-bottom: var(--openui-space-s, 8px);
  margin-bottom: var(--openui-space-m, 12px);
`;
