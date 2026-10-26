export const stepsStyles = `
  min-width: 280px;
  width: 100%;
  margin: 0 auto;
  & .openui-steps {
    display: flex;
    flex-direction: column;
  }
`;

export const stepItemStyles = `
  display: flex;
  position: relative;
  gap: var(--openui-space-m, 12px);
  & .openui-step-connector {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  & .openui-step-number {
    padding: var(--openui-space-2xs, 4px) 0px var(--openui-space-2xs, 4px) 0px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
  }
  & .openui-step-number-inner {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: var(--openui-elevated, oklch(0.097 0 0 / 0.08));
    color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
    border: 1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06));
    box-sizing: border-box;
    font: var(--openui-text-label-sm, 400 14px/1.25 "Inter", sans-serif);
    letter-spacing: var(--openui-text-label-sm-letter-spacing, -0.01em);
    font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
  }
  & .openui-connector-line {
    width: 1px;
    flex-grow: 1;
    z-index: 1;
    background-color: var(--openui-sunk, oklch(0.097 0 0 / 0.04));
  }
  &:last-child .openui-connector-line {
    display: none;
  }
  & .openui-step-content {
    padding-top: var(--openui-space-2xs, 4px);
    display: flex;
    flex-direction: column;
    gap: var(--openui-space-3xs, 2px);
    margin-bottom: var(--openui-space-l, 18px);
  }
  &:last-child .openui-step-content {
    margin-bottom: 0;
  }
  /* Legacy typography(title, default) emits no declarations; retain inherited text. */
  & .openui-step-title {
    color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
  }
  & .openui-step-details {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: calc(var(--openui-space-m, 12px) + 2px);
    font: var(--openui-text-body-default, 400 16px/1.5 "Inter", sans-serif);
    letter-spacing: var(--openui-text-body-default-letter-spacing, -0.01em);
    font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
  }
`;
