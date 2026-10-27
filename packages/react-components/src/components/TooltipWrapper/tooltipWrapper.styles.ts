import { css, keyframes } from "goober";
// Existing shared slide/fade definitions, owned locally until another extracted family needs them.
const up = keyframes`
  from {
    opacity: 0;
    transform: translateY(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;
const right = keyframes`
  from {
    opacity: 0;
    transform: translateX(-2px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;
const down = keyframes`
  from {
    opacity: 0;
    transform: translateY(-2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;
const left = keyframes`
  from {
    opacity: 0;
    transform: translateX(2px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;
const smallBody = `
  font: var(--openui-text-body-sm, 400 14px/1.5 "Inter", sans-serif);
  letter-spacing: var(--openui-text-body-sm-letter-spacing, -0.01em);
  font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
`;
export const bodyClass = "openui-tooltip-wrapper-body";
export const headingClass = "openui-tooltip-wrapper-heading";
export const textClass = "openui-tooltip-wrapper-text";
export const contentClass = "openui-tooltip-wrapper-content";

const stylesheetScope = css`
  :where(&:root) {
    .openui-tooltip-wrapper-body {
      display: flex;
      flex-direction: column;
      gap: var(--openui-space-2xs, 4px);
      width: 100%;
      max-width: 248px;
    }
    .openui-tooltip-wrapper-heading {
      ${smallBody}
      color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
      width: 100%;
    }
    .openui-tooltip-wrapper-text {
      ${smallBody}
      color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
      width: 100%;
    }
    .openui-tooltip-wrapper-content {
      box-sizing: border-box;
      background-color: var(--openui-elevated, oklch(0.097 0 0 / 0.08));
      padding: var(--openui-space-xs, 6px) var(--openui-space-s, 8px);
      outline: 1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06));
      z-index: 9999;
      border-radius: var(--openui-radius-s, 6px);
      user-select: none;
      animation-duration: 400ms;
      animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
      will-change: transform, opacity;
      &[data-state="delayed-open"] {
        &[data-side="top"] {
          animation-name: ${down};
        }
        &[data-side="right"] {
          animation-name: ${left};
        }
        &[data-side="bottom"] {
          animation-name: ${up};
        }
        &[data-side="left"] {
          animation-name: ${right};
        }
      }
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}
