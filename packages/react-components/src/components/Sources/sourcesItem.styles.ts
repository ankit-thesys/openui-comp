import { css } from "goober";
export const itemClass = "openui-sources-item-item";
export const headerClass = "openui-sources-item-header";
export const nameClass = "openui-sources-item-name";
export const titleClass = "openui-sources-item-title";
export const logoClass = "openui-sources-item-logo";

const stylesheetScope = css`
  :where(&:root) {
    .openui-sources-item-item {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--openui-space-2xs, 4px);
      padding: var(--openui-space-s, 8px);
      height: 100%;
      &.openui-listed-source-item--has-url {
        cursor: pointer;
      }
    }
    .openui-sources-item-header {
      display: flex;
      align-items: flex-start;
      gap: var(--openui-space-s, 8px);
    }
    .openui-sources-item-name {
      color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
      font: var(--openui-text-label-sm, 400 14px/1.25 "Inter", sans-serif);
      letter-spacing: var(--openui-text-label-sm-letter-spacing, -0.01em);
      font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
    }
    .openui-sources-item-title {
      color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
      font: var(--openui-text-body-sm, 400 14px/1.5 "Inter", sans-serif);
      letter-spacing: var(--openui-text-body-sm-letter-spacing, -0.01em);
      font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
    }
    .openui-sources-item-logo {
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
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}
