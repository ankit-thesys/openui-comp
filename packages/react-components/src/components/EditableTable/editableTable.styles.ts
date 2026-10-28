import { css } from "goober";
const smallBody = `
  font: var(--openui-text-body-sm, 400 14px/1.5 "Inter", sans-serif);
  letter-spacing: var(--openui-text-body-sm-letter-spacing, -0.01em);
  font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
`;
export const wrapperClass = css`
  border: 1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06));
  border-radius: var(--openui-radius-xl, 12px) var(--openui-radius-xl, 12px) 0 0;
  overflow: hidden;
  position: relative;
`;
export const scrollClass = css`
  overflow: auto;
  scrollbar-width: none;
  ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;
export const controlClass = css`
  position: absolute;
  top: var(--openui-space-s, 8px);
  z-index: 1;
  width: fit-content;
  height: fit-content;
  border-radius: var(--openui-radius-s, 6px);
  background-color: var(--openui-elevated, oklch(0.097 0 0 / 0.08));
  cursor: pointer;
  &.openui-editable-table-scroll-control--disabled {
    cursor: not-allowed;
    display: none;
  }
  &.openui-editable-table-scroll-control--left {
    left: var(--openui-space-s, 8px);
  }
  &.openui-editable-table-scroll-control--right {
    right: var(--openui-space-s, 8px);
  }
`;
export const tableClass = css`
  border-collapse: collapse;
  & .openui-select-trigger {
    ${smallBody}
    width: 100%;
  }
  & thead th {
    text-align: left;
    padding: var(--openui-space-s, 8px) var(--openui-space-m, 12px);
    border-right: 1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06));
    background-color: var(--openui-highlight-subtle, oklch(0.097 0 0 / 0.02));
    color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
    ${smallBody}
    height: 48px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  & thead th:last-child {
    border-right: 0;
  }
  & tbody tr {
    border-bottom: 1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06));
  }
  & tbody tr:last-child {
    border-bottom: 0;
  }
  & tbody td {
    height: 48px;
    padding: 0;
    border-right: 1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06));
    vertical-align: middle;
    white-space: nowrap;
  }
  & tbody td:last-child {
    border-right: 0;
  }
`;
export const headerClass = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--openui-space-s, 8px);
`;
export const headerIconClass = css`
  flex-shrink: 0;
`;
export const changesClass = css`
  display: flex;
  flex-direction: row;
  gap: var(--openui-space-s, 8px);
  padding: var(--openui-space-s, 8px) var(--openui-space-s, 8px) var(--openui-space-s, 8px)
    var(--openui-space-m, 12px);
  justify-content: space-between;
  align-items: center;
  background-color: var(--openui-elevated, oklch(0.097 0 0 / 0.08));
  border-radius: var(--openui-radius-xl, 12px);
  border: 1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06));
  box-shadow: var(
    --openui-shadow-s,
    0 1px 3px -2px oklch(0 0 0 / 0.02),
    0 2px 5px -2px oklch(0 0 0 / 0.04)
  );
`;
export const changesCountClass = css`
  font: var(--openui-text-body-default, 400 16px/1.5 "Inter", sans-serif);
  letter-spacing: var(--openui-text-body-default-letter-spacing, -0.01em);
  font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
`;
export const changesButtonsClass = css`
  display: flex;
  flex-direction: row;
  gap: var(--openui-space-s, 8px);
`;
