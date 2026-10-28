import { keyframes } from "goober";
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
export const datePickerStyles = `
  &:where(.openui-date-picker-renderer-floating-container) {
    position: relative;
  }
  & .openui-date-picker-renderer-floating-input-container {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06));
    border-radius: var(--openui-radius-m, 8px);
    background: var(--openui-sunk, oklch(0.097 0 0 / 0.04));
    padding: var(--openui-space-s, 8px) var(--openui-space-m, 12px);
    font: var(--openui-text-body-default, 400 16px/1.5 "Inter", sans-serif);
    letter-spacing: var(--openui-text-body-default-letter-spacing, -0.01em);
    font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
    color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
    cursor: pointer;
    box-shadow: var(--openui-shadow-s, 0 1px 3px -2px oklch(0 0 0 / 0.02), 0 2px 5px -2px oklch(0 0 0 / 0.04));
    width: 100%;
    &:disabled {
      color: var(--openui-text-neutral-tertiary, oklch(0.097 0 0 / 0.2));
      cursor: not-allowed;
    }
    & svg {
      transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
  }
  & .openui-date-picker-renderer-floating-input-container-open {
    border-color: var(--openui-border-interactive, oklch(0.097 0 0 / 0.12));
    background-color: var(--openui-sunk, oklch(0.097 0 0 / 0.04));
  }
  & .openui-date-picker-renderer-floating-input-container-not-open:hover {
    border-color: var(--openui-border-interactive, oklch(0.097 0 0 / 0.12));
    background-color: var(--openui-sunk, oklch(0.097 0 0 / 0.04));
  }
  & .openui-date-picker-renderer-floating-input-container-has-no-selected-date {
    color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
  }
  & .openui-date-picker-renderer-floating-input-container-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  & .openui-date-picker-renderer-floating-input-container-icon {
    transform: rotate(180deg);
  }
  & .openui-date-picker-renderer-floating-reference {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  &:where(.openui-date-picker-renderer-floating-content) {
    z-index: 50;
  }
  & .openui-date-picker-renderer-floating-menu {
    background: var(--openui-foreground, oklch(0.994 0 89.876 / 1));
    border-radius: var(--openui-radius-2xl, 14px);
    box-shadow: var(--openui-shadow-s, 0 1px 3px -2px oklch(0 0 0 / 0.02), 0 2px 5px -2px oklch(0 0 0 / 0.04));
    border: 1px solid var(--openui-border-interactive, oklch(0.097 0 0 / 0.12));
    overflow: hidden;
    transform-origin: top center;
    animation: ${show} 0.18s ease-out forwards;
  }
  & .openui-date-picker-renderer-floating-menu .openui-calendar-root {
    border: none;
    border-radius: 0;
  }
  & .openui-date-picker-renderer-single-mode, & .openui-date-picker-renderer-range-mode {
    width: 100%;
    height: 100%;
  }
`;
