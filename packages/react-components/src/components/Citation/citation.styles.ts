import { css, keyframes } from "goober";
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
export const containerClass = "openui-citation-container-styled";
export const triggerClass = "openui-citation-trigger";
export const tooltipClass = "openui-citation-tooltip-styled";
export const tooltipContentClass = "openui-citation-tooltip-content";

const stylesheetScope = css`
  :where(&:root) {
    .openui-citation-container-styled {
      position: relative;
      display: inline-flex;
    }
    .openui-citation-trigger {
      height: 20px;
      width: 20px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--openui-space-3xs, 2px);
      background-color: var(--openui-highlight-strong, oklch(0.097 0 0 / 0.08));
      margin-left: var(--openui-space-3xs, 2px);
      border: none;
      border-radius: var(--openui-radius-xs, 4px);
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      & svg {
        color: var(--openui-text-neutral-tertiary, oklch(0.097 0 0 / 0.2));
      }
      &:hover svg,
      &[data-state="delayed-open"] svg,
      &[data-state="instant-open"] svg {
        color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
      }
      &:active {
        background-color: var(--openui-highlight-strong, oklch(0.097 0 0 / 0.08));
      }
      &:focus-visible {
        outline: 2px solid var(--openui-border-interactive, oklch(0.097 0 0 / 0.12));
        outline-offset: 2px;
      }
    }
    .openui-citation-tooltip-styled {
      background-color: var(--openui-foreground, oklch(0.994 0 89.876 / 1));
      border: 1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06));
      border-radius: var(--openui-radius-xl, 12px);
      box-shadow: var(
        --openui-shadow-s,
        0 1px 3px -2px oklch(0 0 0 / 0.02),
        0 2px 5px -2px oklch(0 0 0 / 0.04)
      );
      white-space: nowrap;
      color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
      z-index: 1000;
      pointer-events: all;
      overflow: hidden;
      &[data-state="delayed-open"] {
        &[data-side="top"] {
          animation: ${down} 0.2s ease-in-out;
        }
        &[data-side="bottom"] {
          animation: ${up} 0.2s ease-in-out;
        }
        &[data-side="right"] {
          animation: ${left} 0.2s ease-in-out;
        }
        &[data-side="left"] {
          animation: ${right} 0.2s ease-in-out;
        }
      }
    }
    .openui-citation-tooltip-content {
      padding: var(--openui-space-xs, 6px);
      display: flex;
      flex-direction: column;
      gap: var(--openui-space-2xs, 4px);
      overflow-y: auto;
      max-height: min(50vh);
      scrollbar-width: thin;
      scrollbar-color: var(--openui-border-default, oklch(0.097 0 0 / 0.06)) transparent;
      &::-webkit-scrollbar {
        width: 6px;
      }
      &::-webkit-scrollbar-track {
        background: transparent;
      }
      &::-webkit-scrollbar-thumb {
        background: var(--openui-border-default, oklch(0.097 0 0 / 0.06));
        border-radius: var(--openui-radius-full, 9999px);
      }
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}
