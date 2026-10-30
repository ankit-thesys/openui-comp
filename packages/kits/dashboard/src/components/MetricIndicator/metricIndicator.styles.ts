import { css } from "goober";
import { typography } from "../../shared/typography";

/**
 * Only what differs from react-components' MetricIndicator: dashboards show a
 * larger value, baseline-aligned, with body-sized subtext and trend.
 */
export const metricIndicatorClass = css`
  min-width: 0;

  & .openui-metric-indicator__row {
    align-items: baseline;
  }

  & .openui-metric-indicator__main-value {
    ${typography("number", "heading-medium")}
  }

  & .openui-metric-indicator__subtext {
    ${typography("body", "default")}
  }

  & .openui-metric-indicator__trend {
    margin-bottom: 0;
    ${typography("number", "default")}
  }
`;
