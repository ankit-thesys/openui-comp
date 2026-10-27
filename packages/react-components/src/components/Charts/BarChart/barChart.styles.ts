import { css, keyframes } from "goober";
import {
  cartesianContainer,
  cartesianContainerInner,
  cartesianMainContainer,
  cartesianYAxisContainer,
  gridLine,
  zeroGridLine,
} from "../shared/chartBaseDeclarations";
import { svgTickLabel } from "../shared/chartTypography";

const grow = keyframes`
  from {
    transform: scaleY(0);
  }
  to {
    transform: scaleY(1);
  }
`;
export const rootClass = "openui-bar-chart-root";

const stylesheetScope = css`
  :where(&:root) {
    .openui-bar-chart-root {
      ${cartesianContainer}
      & :where(.openui-bar-chart-container-inner) {
        ${cartesianContainerInner}
      }
      & :where(.openui-bar-chart-y-axis-container) {
        ${cartesianYAxisContainer}
      }
      & :where(.openui-bar-chart-main-container) {
        ${cartesianMainContainer}
      }
      & line:where(.openui-bar-chart-grid line) {
        ${gridLine}
      }
      & line.openui-grid-zero-line:where(.openui-bar-chart-grid line) {
        ${zeroGridLine}
      }
      & :where(.openui-bar-chart-y-tick, .openui-bar-chart-x-tick, .openui-bar-chart-x-tick-angled) {
        ${svgTickLabel}
      }
      & :where(.openui-bar-chart-hover-highlight) {
        fill: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
        opacity: 0.04;
        pointer-events: none;
      }
      & :where(.openui-bar-chart-internal-line) {
        pointer-events: none;
      }
      @media (prefers-reduced-motion: no-preference) {
        & :where(.openui-bar-chart-bar--animated) {
          transform-box: fill-box;
          transform-origin: center bottom;
          animation: ${grow} 0.6s ease-out both;
        }
        & .openui-bar-chart-bar--negative:where(.openui-bar-chart-bar--animated) {
          transform-origin: center top;
        }
      }
    }
  }
`;
if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}
