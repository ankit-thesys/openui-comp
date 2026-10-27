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
export const containerClass = "openui-table-container-styled";
export const tableClass = "openui-table-table";
export const footerClass = "openui-table-footer-styled";
export const headClass = "openui-table-head-styled";
export const rowClass = "openui-table-row-styled";
export const cellClass = "openui-table-cell-styled";
export const alignmentClass = "openui-table-alignment";

const stylesheetScope = css`
  :where(&:root) {
    .openui-table-container-styled {
      position: relative;
      width: 100%;
      overflow: auto;
      border: 1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06));
      border-radius: var(--openui-radius-2xl, 14px);
    }
    .openui-table-table {
      ${smallBody}
      width: 100%;
      caption-side: bottom;
      border-collapse: collapse;
    }
    .openui-table-footer-styled {
      border-top: 1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06));
      & > tr:last-child {
        border-bottom: 0;
      }
    }
    .openui-table-head-styled {
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
    }
    .openui-table-row-styled {
      &:nth-child(even) {
        background-color: var(--openui-highlight-subtle, oklch(0.097 0 0 / 0.02));
      }
      border-bottom: 1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06));
      &:last-child {
        border-bottom: 0;
      }
    }
    .openui-table-cell-styled {
      ${padding}
      white-space: nowrap;
    }
    .openui-table-alignment {
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
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}
