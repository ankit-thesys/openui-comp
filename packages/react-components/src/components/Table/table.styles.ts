import { css } from "goober";
const smallBody = `
  font: var(--openui-text-body-sm, 400 14px/1.5 "Inter", sans-serif);
  letter-spacing: var(--openui-text-body-sm-letter-spacing, -0.01em);
  font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
`;
const padding = `
  padding-top: var(--openui-space-m, 12px);
  padding-bottom: var(--openui-space-m, 12px);
  padding-left: var(--openui-space-m, 12px);
  padding-right: var(--openui-space-m, 12px);
  color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
`;
export const containerClass = css`
  position: relative;
  width: 100%;
  overflow: auto;
  border: 1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06));
  border-radius: var(--openui-radius-2xl, 14px);
`;
export const tableClass = css`
  ${smallBody}
  width: 100%;
  caption-side: bottom;
  border-collapse: collapse;
`;
export const footerClass = css`
  border-top: 1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06));
  & > tr:last-child {
    border-bottom: 0;
  }
`;
export const headClass = css`
  ${padding}
  border-bottom: 1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06));
  & .openui-table-head-label {
    ${smallBody}
    color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
    display: inline-flex;
    flex-grow: 1;
    justify-content: left;
  }
  & .openui-table-head-content {
    display: flex;
    align-items: center;
    gap: var(--openui-space-2xs, 4px);
  }
  & .openui-table-head-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
  }
`;
export const rowClass = css`
  &:nth-child(even) {
    background-color: var(--openui-highlight-subtle, oklch(0.097 0 0 / 0.02));
  }
  border-bottom: 1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06));
  &:last-child {
    border-bottom: 0;
  }
`;
export const cellClass = css`
  ${padding}
  white-space: nowrap;
`;
export const alignmentClass = css`
  &:where(.openui-table-align-left) {
    text-align: left;
    justify-content: flex-start;
  }
  &:where(.openui-table-align-right) {
    text-align: right;
    justify-content: flex-end;
    & .openui-table-head-label {
      justify-content: flex-end;
    }
  }
  &:where(.openui-table-align-center) {
    text-align: center;
    justify-content: center;
    & .openui-table-head-label {
      justify-content: center;
    }
  }
`;
