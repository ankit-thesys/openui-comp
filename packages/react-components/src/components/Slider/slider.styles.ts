const smallText = `
  font: var(--openui-text-label-sm, 400 14px/1.25 "Inter", sans-serif);
  letter-spacing: var(--openui-text-label-sm-letter-spacing, -0.01em);
  font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
`;
export const sliderStyles = `
  display: flex;
  align-items: center;
  gap: var(--openui-space-s, 8px);
  width: 100%;
  & .openui-slider-left-content, & .openui-slider-right-content {
    display: flex;
    align-items: center;
    min-width: fit-content;
    color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
    ${smallText}
    & svg {
      width: 16px;
      height: 16px;
    }
  }
  & .openui-slider-container {
    padding: 0 10px;
    background-color: var(--openui-sunk, oklch(0.097 0 0 / 0.04));
    height: 10px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--openui-radius-s, 6px);
  }
  & .openui-slider-root {
    position: relative;
    display: flex;
    height: 20px;
    width: 100%;
    min-width: 100px;
    max-width: 100%;
    touch-action: none;
    user-select: none;
    align-items: center;
  }
  & .openui-slider-track {
    position: relative;
    height: 10px;
    flex-grow: 1;
    border-radius: var(--openui-radius-full, 9999px);
  }
  & .openui-slider-range {
    position: absolute;
    height: 100%;
    border-radius: var(--openui-radius-s, 6px);
    background-color: var(--openui-interactive-accent-default, oklch(0.546 0.215 262.881 / 1));
    margin-left: -10px;
    margin-right: -8px;
  }
  & .openui-slider-range--at-min {
    background-color: transparent;
  }
  & .openui-slider-thumb {
    outline: none;
  }
  & .openui-slider-thumb-handle {
    display: block;
    width: 20px;
    height: 20px;
    border-radius: var(--openui-radius-s, 6px);
    outline: 1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06));
    background-color: var(--openui-foreground, oklch(0.994 0 89.876 / 1));
    overflow: hidden;
    box-shadow: var(--openui-shadow-s, 0 1px 3px -2px oklch(0 0 0 / 0.02), 0 2px 5px -2px oklch(0 0 0 / 0.04));
  }
  & .openui-slider-thumb-handle-inner {
    display: flex;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
    background-color: var(--openui-foreground, oklch(0.994 0 89.876 / 1));
    transition: background-color 0.2s;
    &:hover {
      background-color: var(--openui-sunk, oklch(0.097 0 0 / 0.04));
    }
  }
  & .openui-slider-thumb-handle-inner-dot {
    width: 6px;
    height: 6px;
    border-radius: var(--openui-radius-3xs, 1px);
    background-color: var(--openui-interactive-accent-default, oklch(0.546 0.215 262.881 / 1));
  }
  & .openui-slider-thumb-value {
    ${smallText}
    position: absolute;
    top: -35px;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--openui-foreground, oklch(0.994 0 89.876 / 1));
    color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
    padding: var(--openui-space-2xs, 4px);
    border-radius: var(--openui-radius-s, 6px);
    box-shadow: var(--openui-shadow-s, 0 1px 3px -2px oklch(0 0 0 / 0.02), 0 2px 5px -2px oklch(0 0 0 / 0.04));
    opacity: 0;
    transition: opacity 0.2s;
    border: 1px solid var(--openui-border-interactive, oklch(0.097 0 0 / 0.12));
  }
  & .openui-slider-thumb-handle:hover .openui-slider-thumb-value, & .openui-slider-thumb-handle:focus .openui-slider-thumb-value {
    opacity: 1;
  }
  & .openui-slider-dots-dot {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 4px;
    height: 4px;
    border-radius: var(--openui-radius-full, 9999px);
    background-color: var(--openui-text-neutral-tertiary, oklch(0.097 0 0 / 0.2));
  }
  & .openui-slider-dots-dot--active {
    background-color: var(--openui-foreground, oklch(0.994 0 89.876 / 1));
  }
  & .openui-slider-container-wrapper {
    width: 100%;
  }
  & .openui-slider-labels {
    display: flex;
    justify-content: space-between;
    margin-top: var(--openui-space-s, 8px);
    color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
    ${smallText}
    padding: 0 var(--openui-space-2xs, 4px);
  }
  & .openui-slider--disabled {
    opacity: 0.5;
    pointer-events: none;
  }
`;
