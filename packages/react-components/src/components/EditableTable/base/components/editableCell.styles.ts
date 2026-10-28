import { css } from "goober";
const bodySmall = `
  font: var(--openui-text-body-sm, 400 14px/1.5 "Inter", sans-serif);
  letter-spacing: var(--openui-text-body-sm-letter-spacing, -0.01em);
  font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
`;
const centered = `
  position: absolute;
  width: calc(100% - var(--openui-space-m, 12px) * 2);
  left: var(--openui-space-m, 12px);
  top: 50%;
  transform: translateY(-50%);
`;
const ellipsis = `
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
export const cellClass = css`
  position: relative;
  width: 100%;
  height: 100%;
  padding: var(--openui-space-s, 8px) var(--openui-space-m, 12px);
  color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
  ${bodySmall}
`;
export const inputClass = css`
  height: 100%;
  width: 100%;
  padding: 0;
  background-color: transparent;
  outline: none;
  appearance: textfield;
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    appearance: none;
  }
`;
export const textClass = css`
  ${centered}
  ${ellipsis}
  ${bodySmall}
`;
export const numberClass = css`
  ${centered}
  ${ellipsis}
  text-align: right;
  font: var(--openui-text-numbers-sm, 400 14px/1.5 "Inter", sans-serif);
  letter-spacing: var(--openui-text-numbers-sm-letter-spacing, -0.01em);
  font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
`;
export const urlClass = css`
  display: block;
  flex: 1 1 auto;
  min-width: 0;
  ${ellipsis}
  ${bodySmall}
  &:hover {
    text-decoration: underline;
  }
`;
export const urlContainerClass = css`
  display: flex;
  align-items: center;
  gap: var(--openui-space-s, 8px);
  ${centered}
`;
export const urlIconClass = css`
  flex-shrink: 0;
  color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
`;
export const warningClass = css`
  flex-shrink: 0;
  color: var(--openui-text-danger-primary, oklch(0.505 0.19 27.518 / 1));
  display: none;
`;
export const horizontalOutlineClass = css`
  position: absolute;
  left: 0;
  width: 100%;
  height: 0px;
  background-color: var(--openui-border-interactive-selected, oklch(0.097 0 0 / 1));
  &:where(.openui-editable-table-cell-outline-top-selected),
  &:where(.openui-editable-table-cell-outline-bottom-selected) {
    height: 1px;
  }
  &:where(.openui-editable-table-cell-outline-top-editing),
  &:where(.openui-editable-table-cell-outline-bottom-editing) {
    height: 1.5px;
  }
  &:where(.openui-editable-table-cell-outline-top) {
    top: 0;
  }
  &:where(.openui-editable-table-cell-outline-bottom) {
    bottom: 0;
  }
`;
export const verticalOutlineClass = css`
  position: absolute;
  top: 0;
  width: 0px;
  height: 100%;
  background-color: var(--openui-border-interactive-selected, oklch(0.097 0 0 / 1));
  &:where(.openui-editable-table-cell-outline-left-selected),
  &:where(.openui-editable-table-cell-outline-right-selected) {
    width: 1px;
  }
  &:where(.openui-editable-table-cell-outline-left-editing),
  &:where(.openui-editable-table-cell-outline-right-editing) {
    width: 1.5px;
  }
  &:where(.openui-editable-table-cell-outline-left) {
    left: 0;
  }
  &:where(.openui-editable-table-cell-outline-right) {
    right: 0;
  }
`;
