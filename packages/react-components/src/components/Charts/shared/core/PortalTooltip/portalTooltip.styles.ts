import { css } from "goober";
export const portalClass = css`
  & {
    pointer-events: none;
    z-index: 1000;
    position: absolute;
  }
`;
export const tooltipClass = css`
  & {
    display: grid;
    align-items: start;
    min-width: 128px;
    max-width: 240px;
    gap: var(--openui-space-xs, 6px);
    padding: var(--openui-space-xs, 6px);
    color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
    font: var(--openui-text-label-xs, 400 12px/1.25 "Inter", sans-serif);
    letter-spacing: var(--openui-text-label-xs-letter-spacing, -0.01em);
    font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
    border-radius: var(--openui-radius-l, 10px);
    border: 1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06));
    background-color: var(--openui-foreground, oklch(0.994 0 89.876 / 1));
    box-shadow: var(
      --openui-shadow-s,
      0 1px 3px -2px oklch(0 0 0 / 0.02),
      0 2px 5px -2px oklch(0 0 0 / 0.04)
    );
  }
  & :where(.openui-chart-tooltip-label) {
    font: var(--openui-text-label-xs, 400 12px/1.25 "Inter", sans-serif);
    letter-spacing: var(--openui-text-label-xs-letter-spacing, -0.01em);
    font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
    color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
    overflow-wrap: break-word;
    word-break: break-word;
  }
  & :where(.openui-chart-tooltip-label-heavy) {
    font: var(--openui-text-label-xs-heavy, 560 12px/1.25 "Inter", sans-serif);
    letter-spacing: var(--openui-text-label-xs-heavy-letter-spacing, -0.01em);
    font-variation-settings: var(--openui-font-variation-medium, "wght" 560);
    color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
    overflow-wrap: break-word;
    word-break: break-word;
  }
  & :where(.openui-chart-tooltip-content) {
    display: grid;
    align-items: start;
    min-width: 128px;
    gap: var(--openui-space-xs, 6px);
    color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
    font: var(--openui-text-label-xs, 400 12px/1.25 "Inter", sans-serif);
    letter-spacing: var(--openui-text-label-xs-letter-spacing, -0.01em);
    font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
    background-color: var(--openui-foreground, oklch(0.994 0 89.876 / 1));
  }
  & :where(.openui-chart-tooltip-content-item) {
    display: flex;
    width: 100%;
    flex-wrap: wrap;
    gap: var(--openui-space-xs, 6px);
    align-items: flex-start;
  }
  & :where(.openui-chart-tooltip-content-item--dot) {
    align-items: center;
  }
  & svg:where(.openui-chart-tooltip-content-item svg) {
    height: 10px;
    width: 10px;
    color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
  }
  & :where(.openui-chart-tooltip-content-indicator) {
    flex-shrink: 0;
    border-radius: var(--openui-radius-2xs, 2px);
  }
  & :where(.openui-chart-tooltip-content-indicator--dot) {
    height: 10px;
    width: 10px;
    background-color: var(--color-bg);
    border-color: var(--color-border);
  }
  & :where(.openui-chart-tooltip-content-indicator--line) {
    width: 4px;
    background-color: var(--color-bg);
    border-color: var(--color-border);
  }
  & :where(.openui-chart-tooltip-content-indicator--dashed) {
    width: 0;
    border: 1.5px dashed var(--color-border);
    background-color: transparent;
  }
  & :where(.openui-chart-tooltip-content-indicator--two-items) {
    margin-top: 2px;
  }
  & :where(.openui-chart-tooltip-content-value-wrapper) {
    display: flex;
    flex: 1;
    gap: var(--openui-space-s, 8px);
    justify-content: space-between;
    line-height: 1;
  }
  & :where(.openui-chart-tooltip-content-value-wrapper--nested) {
    align-items: flex-end;
  }
  & :where(.openui-chart-tooltip-content-value-wrapper--standard) {
    align-items: center;
  }
  & :where(.openui-chart-tooltip-content-value-wrapper--vertical) {
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    gap: var(--openui-space-2xs, 4px);
  }
  & :where(.openui-chart-tooltip-content-label) {
    display: grid;
    gap: var(--openui-space-xs, 6px);
    color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
    font: var(--openui-text-label-xs, 400 12px/1.25 "Inter", sans-serif);
    letter-spacing: var(--openui-text-label-xs-letter-spacing, -0.01em);
    font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
  }
  & span:where(.openui-chart-tooltip-content-label span) {
    display: block;
    overflow-wrap: break-word;
    word-break: break-word;
  }
  & :where(.openui-chart-tooltip-content-value) {
    font-variant-numeric: tabular-nums;
    color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
    font: var(--openui-text-label-xs, 400 12px/1.25 "Inter", sans-serif);
    letter-spacing: var(--openui-text-label-xs-letter-spacing, -0.01em);
    font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  & :where(.openui-chart-tooltip-content-item-separator) {
    width: 100%;
    height: 1px;
    background-color: var(--openui-border-default, oklch(0.097 0 0 / 0.06));
    margin: 0;
  }
  &
    .openui-chart-tooltip-content-item:last-child
    :where(.openui-chart-tooltip-content-item-separator) {
    display: none;
  }
  & :where(.openui-chart-tooltip-content-view-more) {
    font: var(--openui-text-label-xs, 400 12px/1.25 "Inter", sans-serif);
    letter-spacing: var(--openui-text-label-xs-letter-spacing, -0.01em);
    font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
    color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
    text-align: left;
    overflow-wrap: break-word;
    word-break: break-word;
  }
`;
