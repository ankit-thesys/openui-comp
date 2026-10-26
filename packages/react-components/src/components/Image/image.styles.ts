import { css } from "goober";
export const imageClass = css`
  display: flex;
  box-sizing: border-box;
  max-width: 100%;
  height: auto;
  overflow: clip;
  border-radius: var(--openui-radius-m, 8px);
  border: 1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06));
  background-color: var(--openui-foreground, oklch(0.994 0 89.876 / 1));
`;
export const fitClass = css`
  object-fit: contain;
  width: 100%;
  height: 100%;
`;
export const fillClass = css`
  object-fit: cover;
  width: 100%;
  height: 100%;
`;
export const errorClass = css`
  visibility: hidden;
`;
