import { css, keyframes } from "goober";
const appear = keyframes`
  from {
    opacity: 0;
    transform: scale(0.85);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;
export const rootClass = "openui-funnel-chart-root";

const stylesheetScope = css`
  :where(&:root) {
    .openui-funnel-chart-root {
      & {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        position: relative;
      }

      & :where(.openui-funnel-chart-ring) {
        transition:
          d 0.3s ease,
          fill-opacity 0.2s ease;
      }

      & :where(.openui-funnel-chart-ring--springy) {
        transform-box: fill-box;
        transform-origin: center;
      }

      & :where(.openui-funnel-chart-ring--bloom-y) {
        transform: scaleY(var(--funnel-ring-scale, 1));
      }

      & :where(.openui-funnel-chart-ring--bloom-x) {
        transform: scaleX(var(--funnel-ring-scale, 1));
      }

      & :where(.openui-funnel-chart-stage) {
        transition: filter 0.2s ease;
      }

      @media print {
        & :where(.openui-funnel-chart-ring),
        & :where(.openui-funnel-chart-stage) {
          transition: none;
        }
      }
      & :where(.openui-funnel-chart-value) {
        font: var(--openui-text-label-sm, 400 14px/1.25 "Inter", sans-serif);
        letter-spacing: var(--openui-text-label-sm-letter-spacing, -0.01em);
        font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
        fill: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
        font-weight: 600;
        font-variation-settings: normal;
      }

      & :where(.openui-funnel-chart-label) {
        font: var(--openui-text-label-xs, 400 12px/1.25 "Inter", sans-serif);
        letter-spacing: var(--openui-text-label-xs-letter-spacing, -0.01em);
        font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
        fill: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
      }

      & :where(.openui-funnel-chart-pct) {
        font: var(--openui-text-label-xs, 400 12px/1.25 "Inter", sans-serif);
        letter-spacing: var(--openui-text-label-xs-letter-spacing, -0.01em);
        font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
        fill: var(--openui-background, oklch(0.97 0 89.876 / 1));
        font-weight: 700;
        font-variation-settings: normal;
      }

      & :where(.openui-funnel-chart-pct-pill) {
        fill: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
      }

      @media (prefers-reduced-motion: no-preference) {
        & :where(.openui-funnel-chart-stage--animated) {
          opacity: 0;
          transform-box: fill-box;
          transform-origin: center;
          animation: ${appear} 0.5s ease-out forwards;
        }
      }
    }
  }
`;
if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}
