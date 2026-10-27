import { css } from "goober";
export const wrapperClass = "openui-table-scrollable-table-wrapper";
export const scrollContainerClass = "openui-table-scrollable-table-scroll-container";
export const controlClass = "openui-table-scrollable-table-control";

const stylesheetScope = css`
  :where(&:root) {
    .openui-table-scrollable-table-wrapper {
      position: relative;
      width: 100%;
      outline: none;
    }
    .openui-table-scrollable-table-scroll-container {
      overflow: auto;
      scrollbar-width: none;
      ms-overflow-style: none;
      &::-webkit-scrollbar {
        display: none;
      }
    }
    .openui-table-scrollable-table-control {
      position: absolute;
      top: var(--openui-space-s, 8px);
      z-index: 2;
      width: fit-content;
      height: fit-content;
      border-radius: var(--openui-radius-s, 6px);
      background-color: var(--openui-foreground, oklch(0.994 0 89.876 / 1));
      &:where(.openui-scrollable-table-control-left) {
        left: var(--openui-space-s, 8px);
      }
      &:where(.openui-scrollable-table-control-right) {
        right: var(--openui-space-s, 8px);
      }
      &:where(.openui-scrollable-table-control-disabled) {
        display: none;
      }
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}
