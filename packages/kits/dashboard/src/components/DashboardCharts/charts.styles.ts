import { css } from "goober";

export const names = {
  radar: "openui-dashboard-radar-chart",
  radial: "openui-dashboard-radial-chart",
  pie: "openui-dashboard-pie-chart",
} as const;

/** The fixed chart height the chart components set on their wrapper. */
export const CHART_HEIGHT_VAR = "--_openui-dashboard-chart-height";

const chartBox = `
  height: var(${CHART_HEIGHT_VAR}, 296px);
  min-height: var(${CHART_HEIGHT_VAR}, 296px);
  overflow: visible;
`;

/**
 * Sizing for the charts react-components renders, as a wrapper class plus their stable classes.
 * Each reserves the fixed box on the square SVG cell; overflow: visible keeps grid rings, axis
 * labels and semi-circular labels from being clipped by it.
 */
export const styles = {
  radar: css`
    width: 100%;
    min-width: 0;
    & .openui-radar-chart-svg-wrapper {
      ${chartBox}
    }
  `,
  radial: css`
    &.openui-radial-chart {
      overflow: visible;
    }
    & .openui-radial-chart-svg-wrapper {
      ${chartBox}
    }
  `,
  pie: css`
    container-type: inline-size;
    width: 100%;
    height: auto;
    min-width: 0;
    & .openui-pie-chart-svg-wrapper {
      ${chartBox}
    }
  `,
};
