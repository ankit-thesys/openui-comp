import { css, keyframes } from "goober";
import {
  activeDotInner,
  activeDotOuter,
  centeredContainer,
  centeredSvgWrapper,
} from "../shared/chartBaseDeclarations";
import { svgTickLabel } from "../shared/chartTypography";
const appear = keyframes`
  from {
    opacity: 0;
    transform: scale(0.3);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;
export const rootClass = css`
  ${centeredContainer}
  & :where(.openui-radar-chart-svg-wrapper) {
    ${centeredSvgWrapper}
  }
  & svg:where(.openui-radar-chart-svg-wrapper > svg) {
    overflow: visible;
  }
  & :where(.openui-radar-chart-grid-ring),
  & :where(.openui-radar-chart-grid-spoke) {
    stroke: var(--openui-border-interactive, oklch(0.097 0 0 / 0.12));
    stroke-width: 1;
  }
  & :where(.openui-radar-chart-polygon-area) {
    transition: opacity 0.2s ease;
  }
  & :where(.openui-radar-chart-polygon-stroke) {
    fill: none;
    stroke-width: 2;
  }
  & :where(.openui-radar-chart-dot) {
    stroke: var(--openui-foreground, oklch(0.994 0 89.876 / 1));
    stroke-width: 1.5;
    transition:
      r 0.15s ease,
      opacity 0.15s ease;
  }
  & :where(.openui-radar-chart-active-dot-outer) {
    ${activeDotOuter}
  }
  & :where(.openui-radar-chart-active-dot-inner) {
    ${activeDotInner}
  }
  & :where(.openui-radar-chart-active-dots) {
    pointer-events: none;
  }
  & :where(.openui-radar-chart-axis-label) {
    ${svgTickLabel}
  }
  @media (prefers-reduced-motion: no-preference) {
    & :where(.openui-radar-chart-polygon--animated) {
      opacity: 0;
      transform-origin: center center;
      animation: ${appear} 0.5s ease-out forwards;
    }
  }
`;
