import { css, keyframes } from "goober";

const body = `
  font: var(--openui-text-body-default, 400 16px/1.5 "Inter", sans-serif);
  letter-spacing: var(--openui-text-body-default-letter-spacing, -0.01em);
  font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
`;
const small = `
  font: var(--openui-text-body-sm, 400 14px/1.5 "Inter", sans-serif);
  letter-spacing: var(--openui-text-body-sm-letter-spacing, -0.01em);
  font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
`;
const show = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const triggerStylesheetScope = css`
  :where(&:root) {
    .openui-select-trigger-root {
      box-sizing: border-box;
      background-color: var(--openui-highlight-subtle, oklch(0.097 0 0 / 0.02));
      color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
      ${body}
      border: 1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06));
      outline: none;
      display: inline-flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--openui-space-s, 8px);
      &:hover {
        background: var(--openui-highlight, oklch(0.097 0 0 / 0.04));
        border-color: var(--openui-border-interactive, oklch(0.097 0 0 / 0.12));
        color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
        &:not([data-placeholder]) {
          color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
        }
      }
      &:disabled {
        background-color: var(--openui-highlight-subtle, oklch(0.097 0 0 / 0.02));
        color: var(--openui-text-neutral-tertiary, oklch(0.097 0 0 / 0.2));
        border-color: var(--openui-border-default, oklch(0.097 0 0 / 0.06));
        cursor: not-allowed;
      }
      &[data-state="open"] {
        border-color: var(--openui-border-interactive, oklch(0.097 0 0 / 0.12));
        background-color: var(--openui-highlight, oklch(0.097 0 0 / 0.04));
      }
      &[data-placeholder] {
        color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
      }
      &:where(.openui-select-trigger-sm) {
        ${small}
        padding: calc(var(--openui-space-xs, 6px) - 1.5px) var(--openui-space-s, 8px);
        border-radius: calc(var(--openui-radius-s, 6px) + 1px);
      }
      &:where(.openui-select-trigger-md) {
        padding: calc(var(--openui-space-xs, 6px) - 1px) calc(var(--openui-space-m, 12px) - 1px);
        border-radius: var(--openui-radius-m, 8px);
      }
      &:where(.openui-select-trigger-lg) {
        padding: calc(var(--openui-space-s, 8px) - 1px) var(--openui-space-m, 12px);
        border-radius: var(--openui-radius-l, 10px);
      }
      & .openui-select-trigger-icon {
        height: 16px;
        width: 16px;
      }
      & svg {
        transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }
      &[data-state="open"] svg {
        transform: rotate(180deg);
      }
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(triggerStylesheetScope);
}

export const triggerClass = "openui-select-trigger-root";
const contentStylesheetScope = css`
  :where(&:root) {
    .openui-select-content-root {
      box-sizing: border-box;
      position: relative;
      z-index: 99999;
      max-height: 372px;
      min-width: var(--radix-select-trigger-width);
      overflow: hidden;
      border: none;
      border-radius: var(--openui-radius-2xl, 14px);
      background-color: color-mix(
        in oklch,
        var(--openui-foreground, oklch(0.994 0 89.876 / 1)),
        var(--openui-text-white, oklch(1 0 89.876 / 1)) 6%
      );
      box-shadow:
        0 0 0 1px
          color-mix(
            in oklch,
            var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1)) 6%,
            transparent
          ),
        0 4px 12px -2px oklch(0 0 0 / 0.05),
        0 16px 32px -8px oklch(0 0 0 / 0.08);
      & > :first-child:first-child {
        border-top-left-radius: calc(var(--openui-radius-2xl, 14px) - var(--openui-space-2xs, 4px));
        border-top-right-radius: calc(
          var(--openui-radius-2xl, 14px) - var(--openui-space-2xs, 4px)
        );
      }
      & > :last-child:last-child {
        border-bottom-left-radius: calc(
          var(--openui-radius-2xl, 14px) - var(--openui-space-2xs, 4px)
        );
        border-bottom-right-radius: calc(
          var(--openui-radius-2xl, 14px) - var(--openui-space-2xs, 4px)
        );
      }
      padding: 0;
      color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
      transform-origin: top center;
      animation: ${show} 0.18s ease-out forwards;
      &.openui-select-content-sm .openui-select-label,
      &.openui-select-content-sm .openui-select-item,
      &.openui-select-content-sm .openui-select-item-text,
      &.openui-select-content-sm .openui-select-item-text-value {
        ${small}
      }
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(contentStylesheetScope);
}

export const contentClass = "openui-select-content-root";
const viewportStylesheetScope = css`
  :where(&:root) {
    .openui-select-viewport-root {
      box-sizing: border-box;
      padding: var(--openui-space-2xs, 4px) 0;
      &[data-position="popper"] {
        width: 100%;
      }
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(viewportStylesheetScope);
}

export const viewportClass = "openui-select-viewport-root";
const groupStylesheetScope = css`
  :where(&:root) {
    .openui-select-group-root {
      display: flex;
      flex-direction: column;
      gap: var(--openui-space-3xs, 2px);
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(groupStylesheetScope);
}

export const groupClass = "openui-select-group-root";
const labelStylesheetScope = css`
  :where(&:root) {
    .openui-select-label-root {
      box-sizing: border-box;
      ${body}
      padding: var(--openui-space-s, 8px) var(--openui-space-m-l, 16px) var(--openui-space-2xs, 4px);
      color: color-mix(
        in oklch,
        var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1)) 60%,
        transparent
      );
      font-size: 12px;
      line-height: 12px;
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(labelStylesheetScope);
}

export const labelClass = "openui-select-label-root";
const itemStylesheetScope = css`
  :where(&:root) {
    .openui-select-item-root {
      box-sizing: border-box;
      position: relative;
      display: flex;
      cursor: default;
      user-select: none;
      align-items: center;
      justify-content: space-between;
      ${body}
      height: 32px;
      padding: 0 var(--openui-space-m-l, 16px);
      border-radius: 0;
      outline: none;
      color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
      &:where(.openui-select-item--with-tick) {
        padding-right: var(--openui-space-xl, 24px);
      }
      &[data-disabled] {
        pointer-events: none;
        opacity: 0.5;
      }
      &[data-highlighted] {
        color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
      }
      &:hover:not([data-state="checked"]) {
        background-color: var(--openui-highlight, oklch(0.097 0 0 / 0.04));
        color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
      }
      &:focus {
        background-color: var(--openui-highlight, oklch(0.097 0 0 / 0.04));
        color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
      }
      &[data-state="checked"] {
        background-color: var(--openui-highlight, oklch(0.097 0 0 / 0.04));
      }
      & .openui-select-item-check-wrapper {
        position: absolute;
        right: 8px;
        height: 14px;
        width: 14px;
      }
      & .openui-select-item-check-icon {
        height: 16px;
        width: 16px;
      }
      & .openui-select-item-text {
        flex: 1;
        ${body}
        color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
      }
      & .openui-select-item-value {
        color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
      }
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(itemStylesheetScope);
}

export const itemClass = "openui-select-item-root";
const separatorStylesheetScope = css`
  :where(&:root) {
    .openui-select-separator-root {
      box-sizing: border-box;
      margin: var(--openui-space-2xs, 4px) 0;
      height: 1px;
      border-top: 1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06));
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(separatorStylesheetScope);
}

export const separatorClass = "openui-select-separator-root";
