import { css } from "goober";
export const rootClass = "openui-chart-default-legend-root";

const stylesheetScope = css`
  :where(&:root) {
    .openui-chart-default-legend-root {
      & {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--openui-space-s, 8px);
      }
      & :where(.openui-chart-legend-axis-label-container) {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--openui-space-m, 12px);
        flex-wrap: wrap;
      }
      & :where(.openui-chart-legend-axis-label) {
        font: var(--openui-text-label-xs, 400 12px/1.25 "Inter", sans-serif);
        letter-spacing: var(--openui-text-label-xs-letter-spacing, -0.01em);
        font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
        color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
      }
      & :where(.openui-chart-legend-axis-label-text) {
        color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
      }
      & :where(.openui-chart-legend) {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--openui-space-m, 12px);
        flex-wrap: wrap;
      }
      &:where(.openui-chart-legend--bottom) {
        padding-top: var(--openui-space-m, 12px);
      }
      & :where(.openui-chart-legend--collapsed) {
        flex-wrap: nowrap;
        overflow: hidden;
      }
      & :where(.openui-chart-legend--expanded) {
        flex-wrap: wrap;
      }
      & :where(.openui-chart-legend-item) {
        display: flex;
        align-items: center;
        gap: var(--openui-space-xs, 6px);
      }
      & svg:where(.openui-chart-legend-item svg) {
        height: 10px;
        width: 10px;
        color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
      }
      & :where(.openui-chart-legend-item-indicator) {
        height: 10px;
        width: 10px;
        flex-shrink: 0;
        border-radius: var(--openui-radius-2xs, 2px);
        background-color: var(--color-bg);
      }
      & :where(.openui-chart-legend-item-label) {
        font: var(--openui-text-label-xs, 400 12px/1.25 "Inter", sans-serif);
        letter-spacing: var(--openui-text-label-xs-letter-spacing, -0.01em);
        font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
        color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
      }
      & :where(.openui-chart-legend-toggle-button) {
        font: var(--openui-text-label-xs, 400 12px/1.25 "Inter", sans-serif);
        letter-spacing: var(--openui-text-label-xs-letter-spacing, -0.01em);
        font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
        color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
        padding-left: var(--openui-space-2xs, 4px);
        padding-right: var(--openui-space-3xs, 2px);
      }
      & :where(.openui-chart-legend-toggle-button-icon) {
        width: 1em;
        height: 1em;
        color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
      }
      & :where(.openui-chart-legend-item-label-container) {
        display: flex;
        align-items: center;
        gap: var(--openui-space-2xs, 4px);
      }
      & :where(.openui-chart-legend-item-percentage) {
        font: var(--openui-text-label-xs, 400 12px/1.25 "Inter", sans-serif);
        letter-spacing: var(--openui-text-label-xs-letter-spacing, -0.01em);
        font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
        color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
      }
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}
