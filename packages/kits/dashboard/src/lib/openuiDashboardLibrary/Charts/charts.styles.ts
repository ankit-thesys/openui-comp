import { CHART_CLASS_PREFIX as C } from "@openuidev/react-components";
import { css } from "goober";

/**
 * Dashboard sizing for the chart wrappers react-components renders.
 *
 * Each reserves the fixed chart box on the square SVG cell; `overflow: visible`
 * keeps grid rings, axis labels and semiCircular pie labels from being clipped
 * by that square bound.
 */

export const radarChartClass = css`
  width: 100%;
  min-width: 0;

  & .${C}-radar-chart-svg-wrapper {
    height: var(--${C}-dashboard-chart-height, 296px);
    min-height: var(--${C}-dashboard-chart-height, 296px);
    overflow: visible;
  }
`;

export const radialChartClass = css`
  &.${C}-radial-chart-container {
    overflow: visible;
  }

  & .${C}-radial-chart-svg-wrapper {
    height: var(--${C}-dashboard-chart-height, 296px);
    min-height: var(--${C}-dashboard-chart-height, 296px);
    overflow: visible;
  }
`;

export const pieChartClass = css`
  container-type: inline-size;
  width: 100%;
  height: auto;
  min-width: 0;

  & .${C}-pie-chart-svg-wrapper {
    height: var(--${C}-dashboard-pie-chart-height, 296px);
    min-height: var(--${C}-dashboard-pie-chart-height, 296px);
    overflow: visible;
  }
`;
