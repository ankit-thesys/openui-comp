export const chipsStyles = `
  display: flex;
  flex-wrap: wrap;
  gap: var(--openui-space-s, 8px);
  width: 100%;
  box-sizing: border-box;
  & .openui-chip-item {
    padding: var(--openui-space-xs, 6px) var(--openui-space-s, 8px);
    border: 1px solid var(--openui-border-interactive, oklch(0.097 0 0 / 0.12));
    background: transparent;
    display: inline-flex;
    align-items: center;
    gap: var(--openui-space-xs, 6px);
    border-radius: var(--openui-radius-m, 8px);
    box-sizing: border-box;
    cursor: pointer;
    color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
    transition: border-color 0.15s ease, background-color 0.15s ease, opacity 0.15s ease;
    font: var(--openui-text-label-default, 400 16px/1.25 "Inter", sans-serif);
    letter-spacing: var(--openui-text-label-default-letter-spacing, -0.01em);
    font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
    &:hover:not(:disabled):not(.openui-chip-item--selected) {
      border-color: var(--openui-border-default, oklch(0.097 0 0 / 0.06));
      background-color: var(--openui-sunk-light, oklch(0.097 0 0 / 0.02));
    }
    &:focus-visible {
      outline: 2px solid var(--openui-border-accent, oklch(0.546 0.215 262.881 / 0.08));
      outline-offset: 2px;
    }
  }
  & .openui-chip-item--selected {
    border-color: var(--openui-border-interactive-selected, oklch(0.097 0 0 / 1));
    background-color: var(--openui-highlight-strong, oklch(0.097 0 0 / 0.08));
  }
  & .openui-chip-item:disabled, & .openui-chip-item--disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  & .openui-chip-item__icon {
    display: flex;
    align-items: center;
    & > * {
      width: 14px;
      height: 14px;
    }
  }
  & .openui-chip-item__text {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
`;
