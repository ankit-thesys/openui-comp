export const componentStyles = `
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: var(--openui-space-xs, 6px);
  border: 1px solid;
  border-radius: var(--openui-radius-xl, 12px);
  &.openui-checkbox-group-clear {
    border-color: transparent;
    background-color: transparent;
    padding: var(--openui-space-000, 0px);
  }
  &.openui-checkbox-group-card {
    border-color: var(--openui-border-default, oklch(0.097 0 0 / 0.06));
    padding: var(--openui-space-m, 12px);
  }
  &.openui-checkbox-group-sunk {
    border-color: var(--openui-border-default, oklch(0.097 0 0 / 0.06));
    background-color: var(--openui-sunk, oklch(0.097 0 0 / 0.04));
    padding: var(--openui-space-m, 12px);
  }
`;
