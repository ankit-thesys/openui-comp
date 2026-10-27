import { css } from "goober";
const label = `
  font: var(--openui-text-label-default, 400 16px/1.25 "Inter", sans-serif);
  letter-spacing: var(--openui-text-label-default-letter-spacing, -0.01em);
  font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
`;
export const tabsClass = "openui-tabs-tabs";
export const containerClass = "openui-tabs-container";
export const listClass = "openui-tabs-list-styled";
export const triggerClass = "openui-tabs-trigger-styled";
export const contentClass = "openui-tabs-content-styled";

const stylesheetScope = css`
  :where(&:root) {
    .openui-tabs-tabs {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: var(--openui-space-l, 18px);
      &.openui-tabs-clear {
        & .openui-tabs-content {
          padding: var(--openui-space-3xs, 2px) 0;
          border: transparent;
        }
        & .openui-tabs-list {
          border-radius: 0;
          gap: var(--openui-space-l, 18px);
          background: none;
          padding: 0;
          box-sizing: border-box;
          flex: 1;
          display: flex;
          width: 100%;
          position: relative;
          overflow-x: auto;
          scrollbar-width: none;
          ms-overflow-style: none;
          scroll-behavior: smooth;
          &::-webkit-scrollbar {
            display: none;
          }
        }
        & .openui-tabs-trigger {
          width: auto;
          min-width: 0;
          border: 0px;
          border-radius: var(--openui-radius-none, 0px);
          flex-shrink: 0;
          padding: var(--openui-space-s, 8px) 0;
          &[data-state="active"] {
            border: 0px;
            box-shadow: none;
            background-color: transparent;
            font: var(--openui-text-label-default-heavy, 560 16px/1.25 "Inter", sans-serif);
            letter-spacing: var(--openui-text-label-default-heavy-letter-spacing, -0.01em);
            font-variation-settings: var(--openui-font-variation-medium, "wght" 560);
          }
          &:hover:not([data-state="active"]) {
            color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
            border: 0px;
            background-color: transparent;
          }
        }
        & .openui-tabs-list--icon-title-subtext .openui-tabs-trigger,
        & .openui-tabs-list--image-title-subtext .openui-tabs-trigger {
          padding: var(--openui-space-m, 12px) 0;
        }
      }
    }
    .openui-tabs-container {
      position: relative;
      display: flex;
      align-items: center;
      overflow: hidden;
      &::after {
        content: "";
        position: absolute;
        bottom: 0;
        height: 1px;
        left: 0;
        right: 0;
        border-bottom: 1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06));
        pointer-events: none;
      }
      & .openui-tabs-indicator {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 1.5px;
        width: 0;
        opacity: 0;
        background-color: var(--openui-border-interactive-selected, oklch(0.097 0 0 / 1));
        pointer-events: none;
        z-index: 1;
      }
      & .openui-tabs-scroll-button-container-left {
        position: absolute;
        height: 100%;
        left: 0;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 4px 0 0;
        background-color: var(--openui-foreground, oklch(0.994 0 89.876 / 1));
      }
      & .openui-tabs-scroll-button-container-right {
        position: absolute;
        height: 100%;
        right: 0;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 0 0 4px;
        background-color: var(--openui-foreground, oklch(0.994 0 89.876 / 1));
      }
      & .openui-tabs-scroll-button {
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        &.openui-tabs-scroll-left {
          left: 2px;
        }
        &.openui-tabs-scroll-right {
          right: 2px;
        }
      }
    }
    .openui-tabs-list-styled {
      width: 100%;
      box-sizing: border-box;
      display: flex;
      gap: var(--openui-space-3xs, 2px);
      flex-direction: row;
      padding: var(--openui-space-2xs, 4px);
      border-radius: var(--openui-radius-l, 10px);
      background-color: var(--openui-sunk, oklch(0.097 0 0 / 0.04));
      overflow-x: auto;
      scrollbar-width: none;
      ms-overflow-style: none;
      scroll-behavior: smooth;
      &::-webkit-scrollbar {
        display: none;
      }
      &.openui-tabs-list--title .openui-tabs-trigger-content {
        align-items: center;
      }
      &.openui-tabs-list--icon-title,
      &.openui-tabs-list--image-title {
        & .openui-tabs-trigger-content {
          align-items: flex-start;
        }
        & .openui-tabs-trigger-icon {
          width: 24px;
          height: 24px;
          border-radius: var(--openui-radius-s, 6px);
          & svg {
            width: 14px;
            height: 14px;
          }
        }
      }
      &.openui-tabs-list--icon-title-subtext,
      &.openui-tabs-list--image-title-subtext {
        & .openui-tabs-trigger {
          align-items: flex-start;
        }
        & .openui-tabs-trigger-content {
          align-items: flex-start;
        }
      }
      &.openui-tabs-list--icon-title-subtext .openui-tabs-trigger-icon {
        width: 36px;
        height: 36px;
        border-radius: var(--openui-radius-m, 8px);
        & svg {
          width: 16px;
          height: 16px;
        }
      }
      &.openui-tabs-list--image-title .openui-tabs-trigger-image {
        width: 24px;
        height: 24px;
        border-radius: var(--openui-radius-s, 6px);
      }
      &.openui-tabs-list--image-title-subtext .openui-tabs-trigger-image {
        width: 36px;
        height: 36px;
        border-radius: var(--openui-radius-m, 8px);
      }
    }
    .openui-tabs-trigger-styled {
      cursor: pointer;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: var(--openui-space-s, 8px);
      box-sizing: border-box;
      padding: var(--openui-space-3xs, 2px) var(--openui-space-s, 8px);
      border: 1px solid transparent;
      border-radius: var(--openui-radius-s, 6px);
      min-width: 7.3rem;
      width: 100%;
      background-color: transparent;
      color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
      ${label}
      &[data-state="active"] {
        background-color: var(--openui-elevated, oklch(0.097 0 0 / 0.08));
        border: 1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06));
        color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
        box-shadow: var(
          --openui-shadow-s,
          0 1px 3px -2px oklch(0 0 0 / 0.02),
          0 2px 5px -2px oklch(0 0 0 / 0.04)
        );
      }
      &:hover:not([data-state="active"]) {
        background-color: var(--openui-sunk, oklch(0.097 0 0 / 0.04));
        border: 1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06));
        color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
        box-shadow: var(
          --openui-shadow-s,
          0 1px 3px -2px oklch(0 0 0 / 0.02),
          0 2px 5px -2px oklch(0 0 0 / 0.04)
        );
      }
      & .openui-tabs-trigger-content {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: var(--openui-space-3xs, 2px);
        min-width: 0;
      }
      & .openui-tabs-trigger-text {
        width: auto;
        max-width: 232px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      & .openui-tabs-trigger-subtext {
        font: var(--openui-text-label-xs, 400 12px/1.25 "Inter", sans-serif);
        letter-spacing: var(--openui-text-label-xs-letter-spacing, -0.01em);
        font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
        color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 232px;
      }
      & .openui-tabs-trigger-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        flex-shrink: 0;
        background: var(--openui-sunk, oklch(0.097 0 0 / 0.04));
        & svg {
          width: 14px;
          height: 14px;
        }
      }
      & .openui-tabs-trigger-image {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        overflow: hidden;
        flex-shrink: 0;
        & img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
    .openui-tabs-content-styled {
      box-sizing: border-box;
      padding: var(--openui-space-l, 18px);
      border: 1px solid transparent;
      border-radius: var(--openui-radius-m, 8px);
      font: var(--openui-text-body-default, 400 16px/1.5 "Inter", sans-serif);
      letter-spacing: var(--openui-text-body-default-letter-spacing, -0.01em);
      font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
      & .openui-tabs-content-inner {
        display: flex;
        flex-direction: column;
        gap: var(--openui-space-l, 18px);
      }
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}
