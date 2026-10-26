import { css, keyframes } from "goober";
import { centeredContainer, gridLine, zeroGridLine } from "../shared/chartBaseDeclarations";
import { svgTickLabel } from "../shared/chartTypography";
const appear = keyframes`
  from {
    opacity: 0;
    r: 0;
  }
  to {
    opacity: 1;
  }
`;
export const rootClass = css`
  ${centeredContainer}
  & line:where(.openui-scatter-chart-grid line) {
    ${gridLine}
  }
  & line.openui-grid-zero-line:where(.openui-scatter-chart-grid line) {
    ${zeroGridLine}
  }
  & line:where(.openui-scatter-chart-grid-vertical line) {
    ${gridLine}
  }
  & :where(.openui-scatter-chart-y-tick, .openui-scatter-chart-x-tick) {
    ${svgTickLabel}
  }
  & :where(.openui-scatter-chart-dot) {
    stroke: var(--openui-foreground, oklch(0.994 0 89.876 / 1));
    stroke-width: 1.5;
    transition:
      r 0.15s ease,
      fill-opacity 0.15s ease,
      stroke-opacity 0.15s ease;
  }
  @media (prefers-reduced-motion: no-preference) {
    & :where(.openui-scatter-chart-dot--animated) {
      opacity: 0;
      animation: ${appear} 0.4s ease-out forwards;
    }
  }
`;
