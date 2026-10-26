export const iconButtonStyles = `
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.12s ease;
  padding: 0;
  flex-shrink: 0;
  & .openui-icon-button-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  &.openui-icon-button-primary {
    background-color: var(--openui-interactive-accent-default, oklch(0.546 0.215 262.881 / 1));
    color: var(--openui-text-accent-primary, oklch(0.994 0 89.876 / 1));
    border-color: var(--openui-border-accent, oklch(0.546 0.215 262.881 / 0.08));
    box-shadow: var(--openui-shadow-m, 0 4px 6px -2px oklch(0 0 0 / 0.025), 0 2px 2px -2px oklch(0 0 0 / 0.05));
    &:hover:not(:disabled) {
      background-color: var(--openui-interactive-accent-hover, oklch(0.546 0.215 262.881 / 0.8));
      box-shadow: none;
    }
    &:disabled {
      background-color: var(--openui-interactive-accent-disabled, oklch(0.546 0.215 262.881 / 0.4));
      cursor: not-allowed;
      box-shadow: none;
    }
    &:active:not(:disabled) {
      background-color: var(--openui-interactive-accent-pressed, oklch(0.546 0.215 262.881 / 1));
    }
  }
  &.openui-icon-button-secondary {
    background-color: transparent;
    color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
    border-color: var(--openui-border-interactive, oklch(0.097 0 0 / 0.12));
    box-shadow: var(--openui-shadow-m, 0 4px 6px -2px oklch(0 0 0 / 0.025), 0 2px 2px -2px oklch(0 0 0 / 0.05));
    &:hover:not(:disabled) {
      background-color: var(--openui-highlight, oklch(0.097 0 0 / 0.04));
      box-shadow: none;
    }
    &:disabled {
      background-color: transparent;
      box-shadow: none;
      color: var(--openui-text-neutral-tertiary, oklch(0.097 0 0 / 0.2));
      cursor: not-allowed;
    }
    &:active:not(:disabled) {
      background-color: var(--openui-highlight, oklch(0.097 0 0 / 0.04));
    }
  }
  &.openui-icon-button-tertiary {
    background-color: transparent;
    color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
    &:hover:not(:disabled) {
      background-color: var(--openui-highlight, oklch(0.097 0 0 / 0.04));
    }
    &:disabled {
      background-color: transparent;
      border-color: var(--openui-border-default, oklch(0.097 0 0 / 0.06));
      color: var(--openui-text-neutral-tertiary, oklch(0.097 0 0 / 0.2));
      cursor: not-allowed;
    }
    &:active:not(:disabled) {
      background-color: var(--openui-highlight, oklch(0.097 0 0 / 0.04));
      border-color: var(--openui-border-interactive, oklch(0.097 0 0 / 0.12));
    }
  }
  &.openui-icon-button-destructive-primary {
    background-color: var(--openui-interactive-destructive-accent-default, oklch(0.577 0.215 27.325 / 1));
    color: var(--openui-text-danger-inverted-primary, oklch(0.982 0.009 17.303 / 1));
    border-color: var(--openui-border-accent, oklch(0.546 0.215 262.881 / 0.08));
    &:hover:not(:disabled) {
      background-color: var(--openui-interactive-destructive-accent-hover, oklch(0.637 0.208 25.331 / 1));
    }
    &:disabled {
      background-color: var(--openui-interactive-destructive-accent-disabled, oklch(0.577 0.215 27.325 / 0.4));
      cursor: not-allowed;
    }
    &:active:not(:disabled) {
      background-color: var(--openui-interactive-destructive-accent-pressed, oklch(0.505 0.19 27.518 / 1));
    }
  }
  &.openui-icon-button-destructive-secondary {
    background-color: var(--openui-interactive-destructive-default, oklch(0.577 0.215 27.325 / 0.02));
    color: var(--openui-text-danger-primary, oklch(0.505 0.19 27.518 / 1));
    border-color: var(--openui-border-danger, oklch(0.577 0.215 27.325 / 0.08));
    &:hover:not(:disabled) {
      background-color: var(--openui-interactive-destructive-hover, oklch(0.577 0.215 27.325 / 0.08));
    }
    &:disabled {
      background-color: var(--openui-interactive-destructive-disabled, oklch(0.577 0.215 27.325 / 0.02));
      color: var(--openui-text-danger-tertiary, oklch(0.808 0.103 19.571 / 1));
      cursor: not-allowed;
    }
    &:active:not(:disabled) {
      background-color: var(--openui-interactive-destructive-hover, oklch(0.577 0.215 27.325 / 0.08));
    }
  }
  &.openui-icon-button-destructive-tertiary {
    background-color: transparent;
    border-color: transparent;
    color: var(--openui-text-danger-primary, oklch(0.505 0.19 27.518 / 1));
    &:hover:not(:disabled) {
      background-color: var(--openui-interactive-destructive-hover, oklch(0.577 0.215 27.325 / 0.08));
    }
    &:disabled {
      color: var(--openui-text-danger-tertiary, oklch(0.808 0.103 19.571 / 1));
      cursor: not-allowed;
    }
    &:active:not(:disabled) {
      background-color: var(--openui-interactive-destructive-hover, oklch(0.577 0.215 27.325 / 0.08));
      border-color: var(--openui-border-danger, oklch(0.577 0.215 27.325 / 0.08));
    }
  }
  &.openui-icon-button-3-extra-small {
    width: 20px;
    height: 20px;
    & .openui-icon-button-icon {
      width: 10px;
      height: 10px;
    }
  }
  &.openui-icon-button-2-extra-small {
    width: 24px;
    height: 24px;
    & .openui-icon-button-icon {
      width: 12px;
      height: 12px;
    }
  }
  &.openui-icon-button-extra-small {
    width: 28px;
    height: 28px;
    & .openui-icon-button-icon {
      width: 14px;
      height: 14px;
    }
  }
  &.openui-icon-button-small {
    width: 32px;
    height: 32px;
    & .openui-icon-button-icon {
      width: 16px;
      height: 16px;
    }
  }
  &.openui-icon-button-medium {
    width: 36px;
    height: 36px;
    & .openui-icon-button-icon {
      width: 16px;
      height: 16px;
    }
  }
  &.openui-icon-button-large {
    width: 40px;
    height: 40px;
    min-width: 40px;
    min-height: 40px;
    font-size: 16px;
    & .openui-icon-button-icon {
      width: 16px;
      height: 16px;
    }
  }
  &.openui-icon-button-square {
    border-radius: var(--openui-radius-s, 6px);
    &.openui-icon-button-2-extra-small {
      border-radius: calc(var(--openui-radius-s, 6px) - 1px);
    }
    &.openui-icon-button-extra-small {
      border-radius: var(--openui-radius-s, 6px);
    }
    &.openui-icon-button-small {
      border-radius: calc(var(--openui-radius-s, 6px) + 1px);
    }
    &.openui-icon-button-medium {
      border-radius: var(--openui-radius-m, 8px);
    }
    &.openui-icon-button-large {
      border-radius: var(--openui-radius-l, 10px);
    }
  }
  &.openui-icon-button-circle {
    border-radius: var(--openui-radius-full, 9999px);
  }
`;
