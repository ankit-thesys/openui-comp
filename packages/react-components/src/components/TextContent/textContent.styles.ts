import { css } from "goober";
export const rootClass = "openui-text-content-root";
export const variantClasses = {
  sunk: "openui-text-content-variant-sunk",
  card: "openui-text-content-variant-card",
  clear: "openui-text-content-variant-clear",
};

const stylesheetScope = css`
  :where(&:root) {
    .openui-text-content-root {
      box-sizing: border-box;
      color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
      font: var(--openui-text-body-default, 400 16px/1.5 "Inter", sans-serif);
      letter-spacing: var(--openui-text-body-default-letter-spacing, -0.01em);
      font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
      border: 1px solid;
    }
    .openui-text-content-variant-sunk {
      padding: var(--openui-space-m, 12px);
      background: var(--openui-sunk, oklch(0.097 0 0 / 0.04));
      border-radius: var(--openui-radius-m, 8px);
      border-color: var(--openui-border-default, oklch(0.097 0 0 / 0.06));
    }
    .openui-text-content-variant-card {
      padding: var(--openui-space-m, 12px);
      border-radius: var(--openui-radius-m, 8px);
      border-color: var(--openui-border-default, oklch(0.097 0 0 / 0.06));
    }
    .openui-text-content-variant-clear {
      border-color: transparent;
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}
