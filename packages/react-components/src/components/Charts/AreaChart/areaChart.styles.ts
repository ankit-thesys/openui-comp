import { css } from "goober";
import { drawLineAnimation } from "../shared/animations/drawLine.styles";
import { fadeAppearAnimation } from "../shared/animations/fadeAppear.styles";
import {
  activeDotInner,
  activeDotOuter,
  cartesianContainer,
  cartesianContainerInner,
  cartesianMainContainer,
  cartesianYAxisContainer,
  crosshairLine,
  gridLine,
  zeroGridLine,
} from "../shared/chartBaseDeclarations";
import { svgTickLabel } from "../shared/chartTypography";

export const rootClass = "openui-area-chart-root";

const stylesheetScope = css`
  :where(&:root) {
    .openui-area-chart-root {
      ${cartesianContainer}
      & :where(.openui-area-chart-container-inner) {
        ${cartesianContainerInner}
      }
      & :where(.openui-area-chart-y-axis-container) {
        ${cartesianYAxisContainer}
      }
      & :where(.openui-area-chart-main-container) {
        ${cartesianMainContainer}
      }
      & line:where(.openui-area-chart-grid line) {
        ${gridLine}
      }
      & line.openui-grid-zero-line:where(.openui-area-chart-grid line) {
        ${zeroGridLine}
      }
      &
        :where(
          .openui-area-chart-y-tick,
          .openui-area-chart-x-tick,
          .openui-area-chart-x-tick-angled
        ) {
        ${svgTickLabel}
      }
      & :where(.openui-area-chart-crosshair-line) {
        ${crosshairLine}
      }
      & :where(.openui-area-chart-active-dot-outer) {
        ${activeDotOuter}
      }
      & :where(.openui-area-chart-active-dot-inner) {
        ${activeDotInner}
      }
      & :where(.openui-area-chart-area-path) {
        transition: opacity 0.2s ease;
      }
      & :where(.openui-area-chart-area-line) {
        fill: none;
        stroke-width: 2;
      }
      @media (prefers-reduced-motion: no-preference) {
        & :where(.openui-area-chart-area-line--animated) {
          stroke-dasharray: var(--_openui-chart-path-length);
          stroke-dashoffset: var(--_openui-chart-path-length);
          animation: ${drawLineAnimation} 1s ease-out forwards;
        }
        & :where(.openui-area-chart-area-path--animated) {
          opacity: 0;
          animation: ${fadeAppearAnimation} 0.6s ease-out 0.4s forwards;
        }
      }
    }
  }
`;
if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}
