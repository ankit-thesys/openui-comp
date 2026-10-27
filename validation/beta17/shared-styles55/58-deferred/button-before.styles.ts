// Existing --openui-* variables and light defaults; no runtime theme-table import.
const smallText = `
  font: var(--openui-text-label-sm, 400 14px/1.25 "Inter", sans-serif);
  letter-spacing: var(--openui-text-label-sm-letter-spacing, -0.01em);
  font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
`;
export const buttonStyles = `
  box-sizing: border-box;
  font: var(--openui-text-label-default, 400 16px/1.25 "Inter", sans-serif);
  letter-spacing: var(--openui-text-label-default-letter-spacing, -0.01em);
  font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
  border-radius: var(--openui-radius-l, 10px);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.12s ease;
  display: flex;
  gap: var(--openui-space-xs, 6px);
  align-items: center;
  & svg {
    height: 1em;
    width: 1em;
  }
  &.openui-button-base-primary {
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
  &.openui-button-base-secondary {
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
  &.openui-button-base-tertiary {
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
  &.openui-button-base-destructive-primary {
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
  &.openui-button-base-destructive-secondary {
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
  &.openui-button-base-destructive-tertiary {
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
  &.openui-button-base-extra-small {
    border-radius: var(--openui-radius-s, 6px);
    padding: calc(var(--openui-space-xs, 6px) - 1.75px) var(--openui-space-s, 8px);
    ${smallText}
  }
  &.openui-button-base-small {
    border-radius: calc(var(--openui-radius-s, 6px) + 1px);
    padding: calc(var(--openui-space-s, 8px) - 1.75px) var(--openui-space-s-m, 10px);
    ${smallText}
  }
  &.openui-button-base-medium {
    padding: calc(var(--openui-space-s, 8px) - 1px) var(--openui-space-s-m, 10px);
    border-radius: var(--openui-radius-m, 8px);
  }
  &.openui-button-base-large {
    padding: calc(var(--openui-space-s-m, 10px) - 1px) var(--openui-space-m, 12px);
  }
`;
