import { css } from "goober";
export const rootClass = "openui-icon-tag-root";
export const sizeClasses = {
  xs: "openui-icon-tag-size-xs",
  s: "openui-icon-tag-size-s",
  m: "openui-icon-tag-size-m",
  l: "openui-icon-tag-size-l",
  xl: "openui-icon-tag-size-xl",
};
export const variantClasses = {
  neutral: "openui-icon-tag-variant-neutral",
  info: "openui-icon-tag-variant-info",
  success: "openui-icon-tag-variant-success",
  warning: "openui-icon-tag-variant-warning",
  danger: "openui-icon-tag-variant-danger",
  inverted: "openui-icon-tag-variant-inverted",
};

const stylesheetScope = css`
  :where(&:root) {
    .openui-icon-tag-root {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      flex-shrink: 0;
    }
    .openui-icon-tag-size-xs {
      width: 20px;
      height: 20px;
      border-radius: var(--openui-radius-xs, 4px);
      svg {
        width: 12px;
        height: 12px;
      }
    }
    .openui-icon-tag-size-s {
      width: 24px;
      height: 24px;
      border-radius: var(--openui-radius-s, 6px);
      svg {
        width: 14px;
        height: 14px;
      }
    }
    .openui-icon-tag-size-m {
      width: 32px;
      height: 32px;
      border-radius: var(--openui-radius-s, 6px);
      svg {
        width: 14px;
        height: 14px;
      }
    }
    .openui-icon-tag-size-l {
      width: 36px;
      height: 36px;
      border-radius: var(--openui-radius-m, 8px);
      svg {
        width: 16px;
        height: 16px;
      }
    }
    .openui-icon-tag-size-xl {
      width: 40px;
      height: 40px;
      border-radius: var(--openui-radius-m, 8px);
      svg {
        width: 16px;
        height: 16px;
      }
    }
    .openui-icon-tag-variant-neutral {
      background-color: var(--openui-highlight, oklch(0.097 0 0 / 0.04));
      color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
    }
    .openui-icon-tag-variant-info {
      background-color: var(--openui-info-background, oklch(0.623 0.188 259.815 / 0.12));
      color: var(--openui-text-info-primary, oklch(0.424 0.181 265.638 / 1));
    }
    .openui-icon-tag-variant-success {
      background-color: var(--openui-success-background, oklch(0.627 0.17 149.214 / 0.12));
      color: var(--openui-text-success-primary, oklch(0.448 0.108 151.328 / 1));
    }
    .openui-icon-tag-variant-warning {
      background-color: var(--openui-alert-background, oklch(0.795 0.162 86.047 / 0.16));
      color: var(--openui-text-alert-primary, oklch(0.476 0.103 61.907 / 1));
    }
    .openui-icon-tag-variant-danger {
      background-color: var(--openui-danger-background, oklch(0.577 0.215 27.325 / 0.12));
      color: var(--openui-text-danger-primary, oklch(0.505 0.19 27.518 / 1));
    }
    .openui-icon-tag-variant-inverted {
      background-color: var(--openui-inverted-background, oklch(0.097 0 0 / 1));
      color: var(--openui-background, oklch(0.97 0 89.876 / 1));
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}
