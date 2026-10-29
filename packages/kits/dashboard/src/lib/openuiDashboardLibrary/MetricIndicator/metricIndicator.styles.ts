import { css } from "goober";
import { C1_CLASS_PREFIX as P } from "../../../shared/classPrefix";
import { typography } from "../../../shared/typography";

export const metricIndicatorClass = css`
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: var(--openui-space-3xs);

  & .${P}-dashboard-metric-indicator__row {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--openui-space-xs);
    min-width: 0;
  }

  & .${P}-dashboard-metric-indicator__main-value {
    color: var(--openui-text-neutral-primary);
    ${typography("number", "heading-medium")}
  }

  & .${P}-dashboard-metric-indicator__subtext {
    min-width: 0;
    color: var(--openui-text-neutral-secondary);
    ${typography("body", "default")}
  }

  & .${P}-dashboard-metric-indicator__trend {
    color: var(--openui-text-neutral-secondary);
    ${typography("number", "default")}
  }

  & .${P}-dashboard-metric-indicator__trend--success {
    color: var(--openui-text-success-primary);
  }

  & .${P}-dashboard-metric-indicator__trend--danger {
    color: var(--openui-text-danger-primary);
  }
`;
