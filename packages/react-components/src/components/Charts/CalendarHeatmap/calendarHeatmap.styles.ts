import { css, keyframes } from "goober";
const cellIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;
export const rootClass = "openui-calendar-heatmap-root";

const stylesheetScope = css`
  :where(&:root) {
    .openui-calendar-heatmap-root {
      & {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        position: relative;
      }

      & :where(.openui-calendar-heatmap-month-label),
      & :where(.openui-calendar-heatmap-weekday-label) {
        font: var(--openui-text-label-xs, 400 12px/1.25 "Inter", sans-serif);
        letter-spacing: var(--openui-text-label-xs-letter-spacing, -0.01em);
        font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
        fill: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
      }

      & :hover:where(.openui-calendar-heatmap-cell) {
        stroke: var(--openui-foreground, oklch(0.994 0 89.876 / 1));
        stroke-width: 1.5;
      }

      & :where(.openui-calendar-heatmap-cell--ghost) {
        fill-opacity: 0.4;
      }

      @media (prefers-reduced-motion: no-preference) {
        & :where(.openui-calendar-heatmap-cell--animated) {
          opacity: 0;
          animation: ${cellIn} 0.4s ease-out forwards;
        }
      }
      &
        [data-openui-highlight-level="0"]
        :not(.openui-calendar-heatmap-cell--level-0):where(.openui-calendar-heatmap-cell) {
        fill-opacity: 0.3;
      }

      &
        [data-openui-highlight-level="1"]
        :not(.openui-calendar-heatmap-cell--level-1):where(.openui-calendar-heatmap-cell) {
        fill-opacity: 0.3;
      }

      &
        [data-openui-highlight-level="2"]
        :not(.openui-calendar-heatmap-cell--level-2):where(.openui-calendar-heatmap-cell) {
        fill-opacity: 0.3;
      }

      &
        [data-openui-highlight-level="3"]
        :not(.openui-calendar-heatmap-cell--level-3):where(.openui-calendar-heatmap-cell) {
        fill-opacity: 0.3;
      }

      &
        [data-openui-highlight-level="4"]
        :not(.openui-calendar-heatmap-cell--level-4):where(.openui-calendar-heatmap-cell) {
        fill-opacity: 0.3;
      }

      @media (prefers-reduced-motion: no-preference) {
        & :where(.openui-calendar-heatmap-cell),
        & :where(.openui-calendar-heatmap-legend-swatch-slot) {
          transition:
            fill-opacity 0.2s ease,
            opacity 0.2s ease;
        }
      }
      & :where(.openui-calendar-heatmap-separator) {
        stroke: var(--openui-border-default, oklch(0.097 0 0 / 0.06));
        stroke-width: 1;
      }

      & :where(.openui-calendar-heatmap-quarter-label) {
        font: var(--openui-text-label-xs, 400 12px/1.25 "Inter", sans-serif);
        letter-spacing: var(--openui-text-label-xs-letter-spacing, -0.01em);
        font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
        color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
        white-space: nowrap;
        pointer-events: none;
      }

      & :where(.openui-calendar-heatmap-legend) {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: var(--openui-space-s, 8px);
        width: 100%;
        padding-top: var(--openui-space-m, 12px);
      }
      & :where(.openui-calendar-heatmap-legend-label) {
        font: var(--openui-text-label-xs, 400 12px/1.25 "Inter", sans-serif);
        letter-spacing: var(--openui-text-label-xs-letter-spacing, -0.01em);
        font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
        color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
      }
      & :where(.openui-calendar-heatmap-legend-swatches) {
        display: flex;
        align-items: center;
        gap: var(--openui-space-3xs, 2px);
      }
      & :where(.openui-calendar-heatmap-legend-swatch-slot) {
        display: inline-flex;
        cursor: pointer;
      }
      & :where(.openui-calendar-heatmap-legend-swatch) {
        display: block;
        width: 12px;
        height: 12px;
        flex-shrink: 0;
        border-radius: var(--openui-radius-2xs, 2px);
      }
      & :where(.openui-calendar-heatmap-legend-gradient) {
        position: relative;
        width: 60px;
        height: 12px;
        flex-shrink: 0;
        border-radius: var(--openui-radius-2xs, 2px);
      }
      & :where(.openui-calendar-heatmap-legend-gradient-hit) {
        position: absolute;
        top: 0;
        height: 100%;
        cursor: pointer;
      }
    }
  }
`;
if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}
