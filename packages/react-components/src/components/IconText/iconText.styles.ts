import { css } from "goober";
export const rootClass = "openui-icon-text-root";
export const layoutClasses = {
  vertical: "openui-icon-text-layout-vertical",
  horizontal: "openui-icon-text-layout-horizontal",
};
export const contentClass = "openui-icon-text-content";

const stylesheetScope = css`
  :where(&:root) {
    .openui-icon-text-root {
      display: flex;
      gap: var(--openui-space-m, 12px);
    }
    .openui-icon-text-layout-vertical {
      flex-direction: column;
      align-items: flex-start;
    }
    .openui-icon-text-layout-horizontal {
      flex-direction: row;
      align-items: flex-start;
      .openui-icon-tag {
        margin-top: var(--openui-space-3xs, 2px);
      }
      .openui-text-block__primary {
        font: var(--openui-text-body-sm-heavy, 560 14px/1.5 "Inter", sans-serif);
        letter-spacing: var(--openui-text-body-sm-heavy-letter-spacing, -0.01em);
        font-variation-settings: var(--openui-font-variation-medium, "wght" 560);
      }
    }
    .openui-icon-text-content {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}
