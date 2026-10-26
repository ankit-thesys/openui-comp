import { css } from "goober";

export const rootClass = css`
  border: 0;
  background: transparent;
  font: var(--openui-text-body-default, 400 16px/1.5 "Inter", sans-serif);
  letter-spacing: var(--openui-text-body-default-letter-spacing, -0.01em);
  font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
  box-sizing: border-box;
  padding: var(--openui-space-s, 8px) var(--openui-space-000, 0);
  border-bottom: 1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06));
  background-color: transparent;
  gap: var(--openui-space-s, 8px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
  cursor: pointer;
  text-align: left;
  &:last-child {
    border-bottom: none;
  }
`;

// Preserve the legacy declaration; browsers ignore the nonstandard `size` property.
export const iconClass = css`
  size: 16px;
`;

export const textClass = css`
  flex: 1;
  white-space: break-spaces;
  word-break: break-word;
  max-width: 100%;
  text-align: left;
  color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
`;
