// Existing --openui-* variables and light defaults; no runtime theme-table import.
const smallText = `
  font: var(--openui-text-label-sm);
  letter-spacing: var(--openui-text-label-sm-letter-spacing);
  font-variation-settings: var(--openui-font-variation-regular);
`;
export const buttonStyles = `
  box-sizing: border-box;
  font: var(--openui-text-label-default);
  letter-spacing: var(--openui-text-label-default-letter-spacing);
  font-variation-settings: var(--openui-font-variation-regular);
  border-radius: var(--openui-radius-l);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.12s ease;
  display: flex;
  gap: var(--openui-space-xs);
  align-items: center;
  & svg {
    height: 1em;
    width: 1em;
  }
  &.openui-button-base-primary {
    background-color: var(--openui-interactive-accent-default);
    color: var(--openui-text-accent-primary);
    border-color: var(--openui-border-accent);
    box-shadow: var(--openui-shadow-m);
    &:hover:not(:disabled) {
      background-color: var(--openui-interactive-accent-hover);
      box-shadow: none;
    }
    &:disabled {
      background-color: var(--openui-interactive-accent-disabled);
      cursor: not-allowed;
      box-shadow: none;
    }
    &:active:not(:disabled) {
      background-color: var(--openui-interactive-accent-pressed);
    }
  }
  &.openui-button-base-secondary {
    background-color: transparent;
    color: var(--openui-text-neutral-primary);
    border-color: var(--openui-border-interactive);
    box-shadow: var(--openui-shadow-m);
    &:hover:not(:disabled) {
      background-color: var(--openui-highlight);
      box-shadow: none;
    }
    &:disabled {
      background-color: transparent;
      box-shadow: none;
      color: var(--openui-text-neutral-tertiary);
      cursor: not-allowed;
    }
    &:active:not(:disabled) {
      background-color: var(--openui-highlight);
    }
  }
  &.openui-button-base-tertiary {
    background-color: transparent;
    color: var(--openui-text-neutral-primary);
    &:hover:not(:disabled) {
      background-color: var(--openui-highlight);
    }
    &:disabled {
      background-color: transparent;
      border-color: var(--openui-border-default);
      color: var(--openui-text-neutral-tertiary);
      cursor: not-allowed;
    }
    &:active:not(:disabled) {
      background-color: var(--openui-highlight);
      border-color: var(--openui-border-interactive);
    }
  }
  &.openui-button-base-destructive-primary {
    background-color: var(--openui-interactive-destructive-accent-default);
    color: var(--openui-text-danger-inverted-primary);
    border-color: var(--openui-border-accent);
    &:hover:not(:disabled) {
      background-color: var(--openui-interactive-destructive-accent-hover);
    }
    &:disabled {
      background-color: var(--openui-interactive-destructive-accent-disabled);
      cursor: not-allowed;
    }
    &:active:not(:disabled) {
      background-color: var(--openui-interactive-destructive-accent-pressed);
    }
  }
  &.openui-button-base-destructive-secondary {
    background-color: var(--openui-interactive-destructive-default);
    color: var(--openui-text-danger-primary);
    border-color: var(--openui-border-danger);
    &:hover:not(:disabled) {
      background-color: var(--openui-interactive-destructive-hover);
    }
    &:disabled {
      background-color: var(--openui-interactive-destructive-disabled);
      color: var(--openui-text-danger-tertiary);
      cursor: not-allowed;
    }
    &:active:not(:disabled) {
      background-color: var(--openui-interactive-destructive-hover);
    }
  }
  &.openui-button-base-destructive-tertiary {
    background-color: transparent;
    border-color: transparent;
    color: var(--openui-text-danger-primary);
    &:hover:not(:disabled) {
      background-color: var(--openui-interactive-destructive-hover);
    }
    &:disabled {
      color: var(--openui-text-danger-tertiary);
      cursor: not-allowed;
    }
    &:active:not(:disabled) {
      background-color: var(--openui-interactive-destructive-hover);
      border-color: var(--openui-border-danger);
    }
  }
  &.openui-button-base-extra-small {
    border-radius: var(--openui-radius-s);
    padding: calc(var(--openui-space-xs) - 1.75px) var(--openui-space-s);
    ${smallText}
  }
  &.openui-button-base-small {
    border-radius: calc(var(--openui-radius-s) + 1px);
    padding: calc(var(--openui-space-s) - 1.75px) var(--openui-space-s-m);
    ${smallText}
  }
  &.openui-button-base-medium {
    padding: calc(var(--openui-space-s) - 1px) var(--openui-space-s-m);
    border-radius: var(--openui-radius-m);
  }
  &.openui-button-base-large {
    padding: calc(var(--openui-space-s-m) - 1px) var(--openui-space-m);
  }
`;
