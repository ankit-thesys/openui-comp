const body = `
  font: var(--openui-text-body-default, 400 16px/1.5 "Inter", sans-serif);
  letter-spacing: var(--openui-text-body-default-letter-spacing, -0.01em);
  font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
`;
const label = `
  font: var(--openui-text-label-default, 400 16px/1.25 "Inter", sans-serif);
  letter-spacing: var(--openui-text-label-default-letter-spacing, -0.01em);
  font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
`;
const small = `
  font: var(--openui-text-label-sm, 400 14px/1.25 "Inter", sans-serif);
  letter-spacing: var(--openui-text-label-sm-letter-spacing, -0.01em);
  font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
`;
const dropdown = `
  padding: var(--openui-space-2xs, 4px);
  background-color: var(--openui-foreground, oklch(0.994 0 89.876 / 1));
  border: 1px solid var(--openui-border-interactive, oklch(0.097 0 0 / 0.12));
  border-radius: var(--openui-radius-xl, 12px);
  box-shadow: var(--openui-shadow-m, 0 4px 6px -2px oklch(0 0 0 / 0.025), 0 2px 2px -2px oklch(0 0 0 / 0.05));
`;
export const calendarStyles = `
  & .openui-calendar-root {
    --openui-calendar-day-size: calc(var(--openui-space-2xl, 36px) + var(--openui-space-2xs, 4px));
    --openui-calendar-cell-radius: var(--openui-radius-m, 8px);
    ${body}
    width: fit-content;
    max-width: 100%;
    box-sizing: border-box;
    padding: var(--openui-space-l, 18px);
    border: 1px solid var(--openui-border-interactive, oklch(0.097 0 0 / 0.12));
    border-radius: var(--openui-radius-3xl, 16px);
    background-color: var(--openui-foreground, oklch(0.994 0 89.876 / 1));
    color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
  }
  & .openui-calendar-nav-mobile {
    gap: var(--openui-space-s, 8px);
  }
  & .openui-calendar-nav-fullscreen, & .openui-calendar-nav-tray, & .openui-calendar-nav-copilot {
    gap: var(--openui-space-m, 12px);
  }
  & .openui-calendar-dropdowns-mobile {
    gap: var(--openui-space-2xs, 4px);
  }
  & .openui-calendar-dropdowns-fullscreen, & .openui-calendar-dropdowns-tray, & .openui-calendar-dropdowns-copilot {
    gap: var(--openui-space-s, 8px);
  }
  & .openui-calendar-month, & .openui-calendar-weekdays {
    color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
  }
  & .openui-calendar-month-caption {
    ${body}
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--openui-space-s, 8px);
    height: auto;
    margin-bottom: var(--openui-space-s, 8px);
    font-weight: inherit;
    font-size: inherit;
  }
  & .openui-calendar-months-dropdown, & .openui-calendar-years-dropdown {
    cursor: pointer;
  }
  & .openui-calendar-chevron {
    fill: var(--openui-interactive-accent-default, oklch(0.546 0.215 262.881 / 1));
  }
  & .openui-calendar-month-grid {
    width: auto;
    table-layout: auto;
    border-collapse: collapse;
  }
  & .openui-calendar-weekday {
    ${small}
    color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
    width: var(--openui-calendar-day-size);
    height: var(--openui-calendar-day-size);
    padding: 0;
    text-transform: none;
    text-align: center;
    vertical-align: middle;
  }
  & .openui-calendar-single-day, & .openui-calendar-range-day {
    width: var(--openui-calendar-day-size);
    height: var(--openui-calendar-day-size);
    min-width: var(--openui-calendar-day-size);
    min-height: var(--openui-calendar-day-size);
    padding: 0;
    vertical-align: middle;
  }
  & .openui-calendar-single-day-button, & .openui-calendar-range-day-button {
    ${label}
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    border: 1px solid transparent;
    border-radius: var(--openui-calendar-cell-radius);
    background: transparent;
    color: inherit;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.12s ease, border-color 0.12s ease, color 0.12s ease;
    &:focus {
      outline: none;
    }
    &:focus-visible {
      outline: 2px solid var(--openui-border-accent, oklch(0.546 0.215 262.881 / 0.08));
      outline-offset: var(--openui-space-3xs, 2px);
    }
    &:hover:not(:disabled) {
      background-color: var(--openui-highlight-subtle, oklch(0.097 0 0 / 0.02));
    }
    &:disabled {
      cursor: not-allowed;
      color: var(--openui-text-neutral-tertiary, oklch(0.097 0 0 / 0.2));
    }
  }
  & .openui-calendar-button-next, & .openui-calendar-button-previous {
    display: none;
  }
  & .openui-calendar-today[data-today]:not([aria-selected]) {
    background-color: var(--openui-sunk, oklch(0.097 0 0 / 0.04));
    border-radius: var(--openui-calendar-cell-radius);
  }
  & .openui-calendar-disabled {
    color: var(--openui-text-neutral-tertiary, oklch(0.097 0 0 / 0.2));
  }
  & .openui-calendar-single-day-selected {
    background: var(--openui-interactive-accent-default, oklch(0.546 0.215 262.881 / 1));
    color: var(--openui-text-accent-primary, oklch(0.994 0 89.876 / 1));
    border-radius: var(--openui-calendar-cell-radius);
  }
  & .openui-calendar-range-start {
    background: var(--openui-interactive-accent-default, oklch(0.546 0.215 262.881 / 1));
    color: var(--openui-text-accent-primary, oklch(0.994 0 89.876 / 1));
    border-top-left-radius: var(--openui-calendar-cell-radius);
    border-bottom-left-radius: var(--openui-calendar-cell-radius);
  }
  & .openui-calendar-range-middle {
    background: var(--openui-highlight, oklch(0.097 0 0 / 0.04));
  }
  & .openui-calendar-range-end {
    background: var(--openui-interactive-accent-default, oklch(0.546 0.215 262.881 / 1));
    color: var(--openui-text-accent-primary, oklch(0.994 0 89.876 / 1));
    border-top-right-radius: var(--openui-calendar-cell-radius);
    border-bottom-right-radius: var(--openui-calendar-cell-radius);
  }
  & .openui-calendar-footer {
    ${body}
    color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
  }
  /* Let Select's state rules outrank this base regardless of injection order. */
  & :where(.openui-calendar-select-trigger) {
    ${label}
    min-height: calc(var(--openui-space-l, 18px) + var(--openui-space-s, 8px));
    padding: var(--openui-space-xs, 6px) var(--openui-space-s, 8px);
    border: 1px solid transparent;
    border-radius: var(--openui-radius-s, 6px);
    background-color: transparent;
    color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
    gap: var(--openui-space-2xs, 4px);
  }
  & .openui-calendar-select-trigger:hover {
    background-color: var(--openui-highlight-subtle, oklch(0.097 0 0 / 0.02));
  }
  & .openui-calendar-select-trigger:focus-visible {
    outline-offset: var(--openui-space-3xs, 2px);
  }
  & .openui-calendar-select-trigger[data-state="open"] {
    background-color: var(--openui-highlight-subtle, oklch(0.097 0 0 / 0.02));
  }
  & .openui-calendar-select-content-months {
    ${dropdown}
  }
  & .openui-calendar-select-content-years {
    ${dropdown}
    & .openui-calendar-select-viewport {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--openui-space-2xs, 4px);
      &:where(.openui-calendar-select-viewport-mobile) {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    & .openui-calendar-select-item {
      ${body}
      display: flex;
      align-items: center;
      justify-content: center;
      align-self: center;
      justify-self: center;
      border-radius: var(--openui-radius-s, 6px);
      padding: var(--openui-space-xs, 6px) var(--openui-space-s, 8px);
      color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
      &:hover {
        background-color: var(--openui-highlight-subtle, oklch(0.097 0 0 / 0.02));
      }
      &[data-highlighted] {
        background-color: var(--openui-highlight, oklch(0.097 0 0 / 0.04));
        color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
      }
    }
  }
`;
