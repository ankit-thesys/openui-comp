import { keyframes } from "goober";
const body = `
  font: var(--openui-text-body-default, 400 16px/1.5 "Inter", sans-serif);
  letter-spacing: var(--openui-text-body-default-letter-spacing, -0.01em);
  font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
`;
const down = keyframes`
  from {
    height: 0;
  }
  to {
    height: var(--radix-accordion-content-height);
  }
`;
const up = keyframes`
  from {
    height: var(--radix-accordion-content-height);
  }
  to {
    height: 0;
  }
`;
export const accordionStyles = `
  box-sizing: border-box;
  border-radius: var(--openui-radius-2xl, 14px);
  border: 1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06));
  padding: calc(var(--openui-space-m, 12px) + 2px);
  padding-bottom: 0;
  &.openui-accordion-clear {
    border: 1px solid transparent;
    box-shadow: none;
    padding: 0;
    & .openui-accordion-trigger {
      box-shadow: none;
      padding-left: 0;
      padding-right: 0;
      padding-top: var(--openui-space-l, 18px);
      padding-bottom: var(--openui-space-l, 18px);
    }
    & .openui-accordion-item:first-child .openui-accordion-trigger {
      padding-top: 0;
    }
    & .openui-accordion-item:last-child {
      border-bottom-left-radius: 0px;
      border-bottom-right-radius: 0px;
      border-bottom: 1px solid transparent;
    }
    & .openui-accordion-content-wrapper {
      padding: 0;
      padding-bottom: var(--openui-space-l, 18px);
      gap: var(--openui-space-m, 12px);
    }
  }
  &.openui-accordion-card {
    & .openui-accordion-content-wrapper {
      padding: 0;
      padding-bottom: var(--openui-space-m, 12px);
      gap: var(--openui-space-l, 18px);
    }
    & .openui-accordion-item:last-child .openui-accordion-trigger {
      border-bottom: none;
    }
    & .openui-accordion-item:last-child {
      border-bottom-left-radius: 0px;
      border-bottom-right-radius: 0px;
      border-bottom: none;
    }
  }
  &.openui-accordion-sunk {
    background-color: var(--openui-highlight-subtle, oklch(0.097 0 0 / 0.02));
    & .openui-accordion-content-wrapper {
      padding: 0;
      padding-bottom: var(--openui-space-m, 12px);
      gap: var(--openui-space-l, 18px);
    }
    & .openui-accordion-item:last-child .openui-accordion-trigger {
      border-bottom: none;
    }
  }
  & .openui-accordion-item {
    box-sizing: border-box;
    overflow: hidden;
    border-bottom: 1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06));
    &:first-child {
      margin-top: 0;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      & .openui-accordion-trigger {
        padding-top: 0;
      }
    }
    &:last-child {
      border-bottom-left-radius: 4px;
      border-bottom-right-radius: 4px;
      border-bottom: none;
    }
    &:focus-within {
      position: relative;
      z-index: 1;
    }
  }
  & .openui-accordion-header {
    display: flex;
    margin-block-start: 0;
    margin-block-end: 0;
    margin-inline-start: 0;
    margin-inline-end: 0;
  }
  /* Preserve the legacy trigger specificity against host disabled-button rules. */
  & :where(.openui-accordion-trigger) {
    border: none;
    box-sizing: border-box;
    ${body}
    background-color: transparent;
    padding: var(--openui-space-l, 18px) 0;
    width: 100%;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
    cursor: pointer;
    &[data-state="open"] .openui-accordion-trigger-icon {
      transform: rotate(180deg);
    }
  }
  & .openui-accordion-trigger-content {
    display: flex;
    align-items: center;
    color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
    gap: var(--openui-space-xs, 6px);
  }
  & .openui-accordion-trigger-content-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 16px;
    width: 16px;
  }
  & .openui-accordion-trigger-icon {
    color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
    height: 16px;
    width: 16px;
    transition: transform 300ms cubic-bezier(0.87, 0, 0.13, 1);
  }
  & .openui-accordion-content {
    overflow: hidden;
    color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
    ${body}
    &[data-state="open"] {
      animation: ${down} 300ms cubic-bezier(0.87, 0, 0.13, 1);
    }
    &[data-state="closed"] {
      animation: ${up} 300ms cubic-bezier(0.87, 0, 0.13, 1);
    }
  }
  & .openui-accordion-content-wrapper {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    padding: 0;
    gap: var(--openui-space-l, 18px);
  }
`;
