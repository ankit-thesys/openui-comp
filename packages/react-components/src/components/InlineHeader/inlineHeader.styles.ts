import { css } from "goober";
export const rootClass = "openui-inline-header-root";
export const headingClass = "openui-inline-header-heading-styled";
export const descriptionClass = "openui-inline-header-description-styled";

const stylesheetScope = css`
  :where(&:root) {
    .openui-inline-header-root {
      display: flex;
      flex-direction: column;
      gap: var(--openui-space-3xs, 2px);
      align-items: flex-start;
    }
    .openui-inline-header-heading-styled {
      display: flex;
      align-items: center;
      gap: var(--openui-space-xs, 6px);
      color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
      font: var(--openui-text-body-default-heavy, 560 16px/1.5 "Inter", sans-serif);
      letter-spacing: var(--openui-text-body-default-heavy-letter-spacing, -0.01em);
      font-variation-settings: var(--openui-font-variation-medium, "wght" 560);
    }
    .openui-inline-header-description-styled {
      color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
      font: var(--openui-text-body-default, 400 16px/1.5 "Inter", sans-serif);
      letter-spacing: var(--openui-text-body-default-letter-spacing, -0.01em);
      font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}
