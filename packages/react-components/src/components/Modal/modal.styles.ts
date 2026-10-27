import { css, keyframes } from "goober";
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, -48%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
`;
const rootStylesheetScope = css`
  :where(&:root) {
    .openui-modal-portal-root {
      position: relative;
      z-index: 9999;
      & :where(.openui-modal-sr-only) {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(rootStylesheetScope);
}

export const rootClass = "openui-modal-portal-root";
const overlayStylesheetScope = css`
  :where(&:root) {
    .openui-modal-overlay-root {
      position: fixed;
      inset: 0;
      background: var(--openui-overlay, oklch(0 0 0 / 0.4));
      z-index: 9999;
      animation: ${fadeIn} 0.15s ease-out;
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(overlayStylesheetScope);
}

export const overlayClass = "openui-modal-overlay-root";
const contentStylesheetScope = css`
  :where(&:root) {
    .openui-modal-content-root {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10000;
      background: var(--openui-foreground, oklch(0.994 0 89.876 / 1));
      color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
      border: 1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06));
      border-radius: 12px;
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
      display: flex;
      flex-direction: column;
      max-height: 85vh;
      animation: ${slideIn} 0.15s ease-out;
      &:focus {
        outline: none;
      }
      &:where(.openui-modal-sm) {
        width: 400px;
        max-width: 90vw;
      }
      &:where(.openui-modal-md) {
        width: 560px;
        max-width: 90vw;
      }
      &:where(.openui-modal-lg) {
        width: 720px;
        max-width: 90vw;
      }
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(contentStylesheetScope);
}

export const contentClass = "openui-modal-content-root";
const headerStylesheetScope = css`
  :where(&:root) {
    .openui-modal-header-root {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--openui-space-m, 12px);
      border-bottom: 1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06));
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(headerStylesheetScope);
}

export const headerClass = "openui-modal-header-root";
const titleStylesheetScope = css`
  :where(&:root) {
    .openui-modal-title-root {
      font: var(--openui-text-body-default-heavy, 560 16px/1.5 "Inter", sans-serif);
      letter-spacing: var(--openui-text-body-default-heavy-letter-spacing, -0.01em);
      font-variation-settings: var(--openui-font-variation-medium, "wght" 560);
      margin: 0;
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(titleStylesheetScope);
}

export const titleClass = "openui-modal-title-root";
const closeStylesheetScope = css`
  :where(&:root) {
    .openui-modal-close-root {
      all: unset;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
      &:hover {
        color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
      }
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(closeStylesheetScope);
}

export const closeClass = "openui-modal-close-root";
const bodyStylesheetScope = css`
  :where(&:root) {
    .openui-modal-body-root {
      padding: var(--openui-space-m, 12px);
      overflow-y: auto;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--openui-space-m, 12px);
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(bodyStylesheetScope);
}

export const bodyClass = "openui-modal-body-root";
