import { css } from "goober";
export const itemClass = css`
  display: flex;
  align-items: center;
  gap: var(--openui-space-s, 8px);
  border: none;
  padding: var(--openui-space-xs, 6px) var(--openui-space-s, 8px) var(--openui-space-xs, 6px)
    var(--openui-space-xs, 6px);
  border-radius: var(--openui-radius-m, 8px);
  background-color: transparent;
  transition: background-color 0.2s ease-in-out;
  text-align: left;
  width: 100%;
  max-width: 348px;
  font: var(--openui-text-label-sm, 400 14px/1.25 "Inter", sans-serif);
  letter-spacing: var(--openui-text-label-sm-letter-spacing, -0.01em);
  font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
  @media (max-width: 800px) {
    max-width: 320px;
  }
  &.openui-citation-item--has-url {
    cursor: pointer;
    &:hover {
      background-color: var(--openui-sunk, oklch(0.097 0 0 / 0.04));
    }
  }
`;
export const logoClass = css`
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06));
  border-radius: var(--openui-radius-s, 6px);
  color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
  overflow: hidden;
`;
export const contentClass = css`
  display: flex;
  flex-grow: 1;
  align-items: baseline;
  gap: var(--openui-space-s, 8px);
  min-width: 0;
`;
export const titleClass = css`
  color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
export const sourceClass = css`
  color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
