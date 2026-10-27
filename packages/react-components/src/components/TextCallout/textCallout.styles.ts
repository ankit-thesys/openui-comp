import { css } from "goober";
export const rootClass = "openui-text-callout-root";
export const variantClasses = {
  neutral: "openui-text-callout-variant-neutral",
  info: "openui-text-callout-variant-info",
  warning: "openui-text-callout-variant-warning",
  success: "openui-text-callout-variant-success",
  danger: "openui-text-callout-variant-danger",
};
export const contentClass = "openui-text-callout-content-styled";
export const titleClass = "openui-text-callout-title";
export const descriptionClass = "openui-text-callout-description";

const stylesheetScope = css`
  :where(&:root) {
    .openui-text-callout-root {
      width: 100%;
      display: flex;
      flex-direction: row;
      gap: var(--openui-space-xs, 6px);
      padding: 0 16px 0 16px;
      box-sizing: border-box;
    }
    .openui-text-callout-variant-neutral {
      border-left: 2px solid var(--openui-border-interactive-selected, oklch(0.097 0 0 / 1));
      color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
      & .openui-text-callout-content-title {
        color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
      }
    }
    .openui-text-callout-variant-info {
      border-left: 2px solid var(--openui-border-info-emphasis, oklch(0.546 0.215 262.881 / 1));
      color: var(--openui-text-info-primary, oklch(0.424 0.181 265.638 / 1));
    }
    .openui-text-callout-variant-warning {
      border-left: 2px solid var(--openui-border-alert-emphasis, oklch(0.681 0.142 75.834 / 1));
      color: var(--openui-text-alert-primary, oklch(0.476 0.103 61.907 / 1));
    }
    .openui-text-callout-variant-success {
      border-left: 2px solid var(--openui-border-success-emphasis, oklch(0.627 0.17 149.214 / 1));
      color: var(--openui-text-success-primary, oklch(0.448 0.108 151.328 / 1));
    }
    .openui-text-callout-variant-danger {
      border-left: 2px solid var(--openui-border-danger-emphasis, oklch(0.577 0.215 27.325 / 1));
      color: var(--openui-text-danger-primary, oklch(0.505 0.19 27.518 / 1));
    }
    .openui-text-callout-content-styled {
      display: flex;
      flex-direction: column;
    }
    .openui-text-callout-title {
      font: var(--openui-text-body-default-heavy, 560 16px/1.5 "Inter", sans-serif);
      letter-spacing: var(--openui-text-body-default-heavy-letter-spacing, -0.01em);
      font-variation-settings: var(--openui-font-variation-medium, "wght" 560);
    }
    .openui-text-callout-description {
      font: var(--openui-text-body-default, 400 16px/1.5 "Inter", sans-serif);
      letter-spacing: var(--openui-text-body-default-letter-spacing, -0.01em);
      font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
      color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}
