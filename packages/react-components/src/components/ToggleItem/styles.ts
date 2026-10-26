export const componentStyles = `
  box-sizing: border-box;
  font: var(--openui-text-body-default, 400 16px/1.5 "Inter", sans-serif);
  letter-spacing: var(--openui-text-body-default-letter-spacing, -0.01em);
  font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
  padding: var(--openui-space-m, 12px);
  border-radius: var(--openui-radius-m, 8px);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  gap: var(--openui-space-2xs, 4px);
  align-items: center;
  background-color: var(--openui-foreground, oklch(0.994 0 89.876 / 1));
  color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
  border-color: var(--openui-border-default, oklch(0.097 0 0 / 0.06));
  &:hover {
    background-color: var(--openui-sunk, oklch(0.097 0 0 / 0.04));
  }
  &:disabled {
    color: var(--openui-text-neutral-tertiary, oklch(0.097 0 0 / 0.2));
    border-color: var(--openui-border-default, oklch(0.097 0 0 / 0.06));
    cursor: not-allowed;
  }
  &[data-state="on"] {
    background-color: var(--openui-interactive-accent-default, oklch(0.546 0.215 262.881 / 1));
    color: var(--openui-text-accent-primary, oklch(0.994 0 89.876 / 1));
    &:hover {
      background-color: var(--openui-interactive-accent-hover, oklch(0.546 0.215 262.881 / 0.8));
    }
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;
