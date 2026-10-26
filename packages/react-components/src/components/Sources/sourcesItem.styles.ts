import { css } from "goober";
export const itemClass = css`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--openui-space-2xs, 4px);
  padding: var(--openui-space-s, 8px);
  height: 100%;
  &.openui-listed-source-item--has-url {
    cursor: pointer;
  }
`;
export const headerClass = css`
  display: flex;
  align-items: flex-start;
  gap: var(--openui-space-s, 8px);
`;
export const nameClass = css`
  color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
  font: var(--openui-text-label-sm, 400 14px/1.25 "Inter", sans-serif);
  letter-spacing: var(--openui-text-label-sm-letter-spacing, -0.01em);
  font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
`;
export const titleClass = css`
  color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
  font: var(--openui-text-body-sm, 400 14px/1.5 "Inter", sans-serif);
  letter-spacing: var(--openui-text-body-sm-letter-spacing, -0.01em);
  font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
`;
export const logoClass = css`
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06));
  border-radius: var(--openui-radius-s, 6px);
  box-sizing: border-box;
  overflow: hidden;
`;
