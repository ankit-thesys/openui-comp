import { css } from "goober";
export const listClass = "openui-sources-listed-sources-list";
export const headerClass = "openui-sources-listed-sources-header";
export const titleClass = "openui-sources-listed-sources-title";
export const buttonsClass = "openui-sources-listed-sources-buttons";
export const containerClass = "openui-sources-listed-sources-container";

const stylesheetScope = css`
  :where(&:root) {
    .openui-sources-listed-sources-list {
      display: flex;
      flex-direction: column;
      gap: var(--openui-space-m, 12px);
    }
    .openui-sources-listed-sources-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--openui-space-s, 8px);
    }
    .openui-sources-listed-sources-title {
      color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
      font: var(--openui-text-label-default-heavy, 560 16px/1.25 "Inter", sans-serif);
      letter-spacing: var(--openui-text-label-default-heavy-letter-spacing, -0.01em);
      font-variation-settings: var(--openui-font-variation-medium, "wght" 560);
    }
    .openui-sources-listed-sources-buttons {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--openui-space-s, 8px);
    }
    .openui-sources-listed-sources-container {
      width: 180px !important;
      padding: var(--openui-space-000, 0);
      border-radius: var(--openui-radius-l, 10px);
      overflow: hidden;
      background-color: transparent !important;
      &.openui-listed-sources-item-container--has-url:hover {
        background-color: var(--openui-highlight-subtle, oklch(0.097 0 0 / 0.02)) !important;
        border-color: var(--openui-border-interactive, oklch(0.097 0 0 / 0.12));
      }
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}
