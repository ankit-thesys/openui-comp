import { css } from "goober";
export const rootClass = "openui-tag-root";
export const iconClass = "openui-tag-icon-styled";
export const textClass = "openui-tag-text-styled";
export const sizeClasses = {
  sm: "openui-tag-size-sm",
  md: "openui-tag-size-md",
  lg: "openui-tag-size-lg",
};
export const variantClasses = {
  neutral: "openui-tag-variant-neutral",
  info: "openui-tag-variant-info",
  success: "openui-tag-variant-success",
  warning: "openui-tag-variant-warning",
  danger: "openui-tag-variant-danger",
};

const stylesheetScope = css`
  :where(&:root) {
    .openui-tag-root {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      overflow: hidden;
      max-width: 100%;
      gap: var(--openui-space-2xs, 4px);
      font: var(--openui-text-label-sm, 400 14px/1.25 "Inter", sans-serif);
      letter-spacing: var(--openui-text-label-sm-letter-spacing, -0.01em);
      font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
    }
    .openui-tag-icon-styled {
      display: flex;
      align-items: center;
      & svg {
        stroke-width: 2.5;
        width: 14px;
        height: 14px;
      }
    }
    .openui-tag-text-styled {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .openui-tag-size-sm {
      padding: var(--openui-space-2xs, 4px) var(--openui-space-xs, 6px);
      border-radius: var(--openui-radius-s, 6px);
      height: 24px;
    }
    .openui-tag-size-md {
      padding: var(--openui-space-xs, 6px) var(--openui-space-s, 8px);
      border-radius: var(--openui-radius-s, 6px);
      gap: var(--openui-space-xs, 6px);
      height: 32px;
    }
    .openui-tag-size-lg {
      padding: var(--openui-space-s, 8px) var(--openui-space-m, 12px);
      border-radius: var(--openui-radius-m, 8px);
      gap: var(--openui-space-xs, 6px);
      height: 36px;
    }
    .openui-tag-variant-neutral {
      background-color: var(--openui-sunk, oklch(0.097 0 0 / 0.04));
      color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
    }
    .openui-tag-variant-info {
      background-color: var(--openui-info-background, oklch(0.623 0.188 259.815 / 0.12));
      color: var(--openui-text-info-primary, oklch(0.424 0.181 265.638 / 1));
    }
    .openui-tag-variant-success {
      background-color: var(--openui-success-background, oklch(0.627 0.17 149.214 / 0.12));
      color: var(--openui-text-success-primary, oklch(0.448 0.108 151.328 / 1));
    }
    .openui-tag-variant-warning {
      background-color: var(--openui-alert-background, oklch(0.795 0.162 86.047 / 0.16));
      color: var(--openui-text-alert-primary, oklch(0.476 0.103 61.907 / 1));
    }
    .openui-tag-variant-danger {
      background-color: var(--openui-danger-background, oklch(0.577 0.215 27.325 / 0.12));
      color: var(--openui-text-danger-primary, oklch(0.505 0.19 27.518 / 1));
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}
