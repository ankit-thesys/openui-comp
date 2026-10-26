import { css } from "goober";

export const rootClass = css`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--openui-space-3xs, 2px);
  &:where(.openui-metric-indicator--variant-inline) {
    gap: 0;
  }
  &:where(.openui-metric-indicator--has-subtext) {
    gap: var(--openui-space-3xs, 2px);
  }
  & :where(.openui-metric-indicator__row) {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: var(--openui-space-xs, 6px);
    min-width: 0;
  }
  &.openui-metric-indicator--variant-inline :where(.openui-metric-indicator__row) {
    align-items: baseline;
    gap: var(--openui-space-2xs, 4px);
  }
  & :where(.openui-metric-indicator__main-value) {
    color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
    font: var(--openui-text-numbers-default-heavy, 560 16px/1.5 "Inter", sans-serif);
    letter-spacing: var(--openui-text-numbers-default-heavy-letter-spacing, -0.01em);
    font-variation-settings: var(--openui-font-variation-medium, "wght" 560);
  }
  & :where(.openui-metric-indicator__previous-value) {
    color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
    text-decoration: line-through;
    font: var(--openui-text-numbers-sm, 400 14px/1.5 "Inter", sans-serif);
    letter-spacing: var(--openui-text-numbers-sm-letter-spacing, -0.01em);
    font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
    margin-bottom: 1px;
  }
  & :where(.openui-metric-indicator__subtext) {
    color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
    min-width: 0;
    font: var(--openui-text-body-sm, 400 14px/1.5 "Inter", sans-serif);
    letter-spacing: var(--openui-text-body-sm-letter-spacing, -0.01em);
    font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
  }
  &.openui-metric-indicator--variant-inline :where(.openui-metric-indicator__subtext) {
    margin-top: 0;
  }
  & :where(.openui-metric-indicator__trend--success) {
    color: var(--openui-text-success-primary, oklch(0.448 0.108 151.328 / 1));
  }
  & :where(.openui-metric-indicator__trend--danger) {
    color: var(--openui-text-danger-primary, oklch(0.505 0.19 27.518 / 1));
  }
  & :where(.openui-metric-indicator__trend) {
    font: var(--openui-text-numbers-sm, 400 14px/1.5 "Inter", sans-serif);
    letter-spacing: var(--openui-text-numbers-sm-letter-spacing, -0.01em);
    font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
    margin-bottom: 1px;
  }
`;
