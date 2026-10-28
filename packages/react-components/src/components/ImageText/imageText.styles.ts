import { css } from "goober";
export const rootClass = "openui-image-text-root";
export const imageContainerClass = "openui-image-text-image-container";
export const imageClass = "openui-image-text-image";
export const layoutClasses = {
  vertical: "openui-image-text-layout-vertical",
  horizontal: "openui-image-text-layout-horizontal",
};
export const contentClass = "openui-image-text-content";

const stylesheetScope = css`
  :where(&:root) {
    .openui-image-text-root {
      min-width: var(--_openui-snippet-card-min-width, auto);
      width: var(--_openui-snippet-card-text-width, auto);
      overflow: var(--_openui-snippet-card-overflow, visible);
      display: flex;
      gap: var(--openui-space-m, 12px);
    }
    .openui-image-text-image-container {
      position: relative;
      width: calc(var(--openui-space-2xl, 36px) + var(--openui-space-2xs, 4px));
      height: calc(var(--openui-space-2xl, 36px) + var(--openui-space-2xs, 4px));
      border-radius: var(--openui-radius-m, 8px);
      overflow: hidden;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--openui-sunk, oklch(0.097 0 0 / 0.04));
    }
    .openui-image-text-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .openui-image-text-layout-vertical {
      flex-direction: column;
      align-items: flex-start;
    }
    .openui-image-text-layout-horizontal {
      flex-direction: row;
      align-items: center;
      .openui-text-block-primary {
        font: var(--openui-text-body-sm-heavy, 560 14px/1.5 "Inter", sans-serif);
        letter-spacing: var(--openui-text-body-sm-heavy-letter-spacing, -0.01em);
        font-variation-settings: var(--openui-font-variation-medium, "wght" 560);
      }
      .openui-image-text__content {
        padding-top: var(--openui-space-3xs, 2px);
      }
    }
    .openui-image-text-content {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}
