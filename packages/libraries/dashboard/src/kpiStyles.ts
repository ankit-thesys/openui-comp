import { css } from "@openuidev/react-components";
export const kpiStyles = css`
  .openui-dashboard-kpis {
    border: 1px solid var(--openui-dashboard-border);
    border-radius: var(--openui-dashboard-radius);
    background: var(--openui-dashboard-surface);
    box-shadow: var(--openui-dashboard-shadow);
    overflow: hidden;
  }
  .openui-dashboard-kpi-compact {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
    padding: var(--openui-dashboard-space-sm) var(--openui-dashboard-space-md);
  }
  .openui-dashboard-kpi-compact-value {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    font-size: 22px;
    line-height: 1.15;
    font-weight: 600;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
  }
  .openui-dashboard-kpi-compact-meta {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    min-width: 0;
    font-size: 12px;
  }
  .openui-dashboard-kpi-compact-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--openui-dashboard-ink-secondary);
  }
  .openui-dashboard-kpi-compact-meta .openui-dashboard-delta {
    flex: none;
  }
  .openui-dashboard-kpis-compact .openui-dashboard-kpi-cell + .openui-dashboard-kpi-cell::before {
    top: 12px;
    bottom: 12px;
  }
  .openui-dashboard-kpis-row {
    position: relative;
    display: flex;
  }
  .openui-dashboard-kpis-row + .openui-dashboard-kpis-row::before {
    content: "";
    position: absolute;
    top: 0;
    left: var(--openui-dashboard-space-md);
    right: var(--openui-dashboard-space-md);
    border-top: 1px dotted var(--openui-dashboard-border-strong);
  }
  .openui-dashboard-kpi-cell {
    position: relative;
    display: flex;
    flex: 1 1 0;
    min-width: 0;
  }
  .openui-dashboard-kpi-cell > * {
    flex: 1 1 auto;
  }
  .openui-dashboard-kpi-cell .openui-dashboard-kpi {
    border: 0;
    border-radius: 0;
    box-shadow: none;
    background: transparent;
  }
  .openui-dashboard-kpi-cell + .openui-dashboard-kpi-cell::before {
    content: "";
    position: absolute;
    left: 0;
    top: 14px;
    bottom: 14px;
    border-left: 1px dotted var(--openui-dashboard-border-strong);
  }
  .openui-dashboard-kpi-hint {
    margin-top: -4px;
    font-size: 12px;
    color: var(--openui-dashboard-ink-muted);
  }
  .openui-dashboard-kpi-text {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }
  .openui-dashboard-kpi-value.openui-dashboard-kpi-text {
    font-size: 22px;
    font-weight: 500;
  }
  .openui-dashboard-kpi-text-value {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    padding-block: 0.12em;
    margin-block: -0.12em;
  }
  .openui-dashboard-kpi-status-dots > span[data-state="warning"] {
    width: 9px;
    height: 8px;
    border-radius: 0;
    clip-path: polygon(50% 0, 100% 100%, 0 100%);
  }
  .openui-dashboard-kpi-status-dots > span[data-state="bad"] {
    width: 8px;
    height: 8px;
    border-radius: 0;
    clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
  }
  .openui-dashboard-kpi {
    gap: 10px;
  }
  .openui-dashboard-kpi-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    font-size: 13px;
    font-weight: 500;
    color: var(--openui-dashboard-ink-secondary);
  }
  .openui-dashboard-kpi-main {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }
  /* His .kpis:has(.kpi-spark) .kpi-main, through a variable the strip sets: goober breaks a
     selector with anything after a ")". */
  .openui-dashboard-kpis:has(.openui-dashboard-kpi-spark) {
    --openui-dashboard-kpi-main-min: 44px;
  }
  .openui-dashboard-kpis .openui-dashboard-kpi-main {
    min-height: var(--openui-dashboard-kpi-main-min, auto);
  }
  .openui-dashboard-kpi-value {
    font-size: 26px;
    line-height: 1.1;
    font-weight: 600;
    letter-spacing: -0.025em;
    font-variant-numeric: tabular-nums;
  }
  .openui-dashboard-kpi-foot {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--openui-dashboard-ink-muted);
  }
  .openui-dashboard-kpi-visual {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }
  .openui-dashboard-kpi-caption {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    font-size: 12px;
    color: var(--openui-dashboard-ink-muted);
    font-variant-numeric: tabular-nums;
  }
  .openui-dashboard-kpi-meter-track {
    height: 8px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--openui-dashboard-ink) 9%, transparent);
    overflow: hidden;
  }
  .openui-dashboard-kpi-meter-fill {
    height: 100%;
    border-radius: inherit;
    background-color: var(--openui-dashboard-series-1);
  }
  .openui-dashboard-kpi-split-bar {
    display: flex;
    gap: 2px;
    height: 8px;
  }
  .openui-dashboard-kpi-split-bar > span {
    flex-basis: 0;
    min-width: 2px;
    border-radius: 2px;
  }
  .openui-dashboard-kpi-split-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 2px 10px;
    font-size: 12px;
    color: var(--openui-dashboard-ink-secondary);
    font-variant-numeric: tabular-nums;
  }
  .openui-dashboard-kpi-split-legend > span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }
  .openui-dashboard-kpi-split-legend i {
    width: 7px;
    height: 7px;
    border-radius: 2px;
  }
  .openui-dashboard-kpi-status {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .openui-dashboard-kpi-status-dots {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 3px;
  }
  .openui-dashboard-kpi-status-dots > span {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background-color: var(--openui-dashboard-neutral-soft);
  }
  .openui-dashboard-kpi-status-dots > span[data-state="good"] {
    background-color: var(--openui-dashboard-good-mark);
  }
  .openui-dashboard-kpi-status-dots > span[data-state="warning"] {
    background-color: var(--openui-dashboard-warning-mark);
  }
  .openui-dashboard-kpi-status-dots > span[data-state="bad"] {
    background-color: var(--openui-dashboard-bad-mark);
  }
  .openui-dashboard-kpi-spark {
    width: 120px;
    max-width: 100%;
    height: 44px;
    flex: none;
  }
  .openui-dashboard-kpi-spark-wrap {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
    justify-content: flex-end;
    container-type: inline-size;
  }
  @container (max-width: 47px) {
    .openui-dashboard-kpi-spark-wrap > .openui-dashboard-kpi-spark {
      display: none;
    }
  }
  .openui-dashboard-kpi-compact
    .openui-dashboard-state[data-state="loading"]
    .openui-dashboard-skel-line {
    width: 64%;
    height: 18px;
  }
  .openui-dashboard-kpi-compact
    .openui-dashboard-state[data-state="loading"]
    .openui-dashboard-skel-block {
    display: none;
  }
  .openui-dashboard-kpi-compact .openui-dashboard-state[data-compact] .openui-dashboard-state-icon {
    width: 20px;
    height: 20px;
  }
  .openui-dashboard-kpi-compact
    .openui-dashboard-state[data-compact]
    .openui-dashboard-state-icon
    svg {
    width: 12px;
    height: 12px;
  }
  .openui-dashboard-kpi-compact
    .openui-dashboard-state[data-compact]
    .openui-dashboard-state-title {
    font-size: 12px;
    white-space: nowrap;
  }
  .openui-dashboard-state[data-compact][data-state="loading"] .openui-dashboard-skel-line {
    width: 56%;
    height: 26px;
  }
  .openui-dashboard-state[data-compact][data-state="loading"] .openui-dashboard-skel-block {
    flex: 0 0 12px;
    width: 40%;
    min-height: 12px;
  }
  .openui-dashboard-state[data-compact] .openui-dashboard-state-layer {
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
    padding: 0;
    text-align: left;
  }
  .openui-dashboard-state[data-compact][data-state="loading"] .openui-dashboard-state-layer {
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 8px;
  }
  .openui-dashboard-state[data-compact] .openui-dashboard-state-icon {
    width: 24px;
    height: 24px;
  }
  .openui-dashboard-state[data-compact] .openui-dashboard-state-icon svg {
    width: 14px;
    height: 14px;
  }
  .openui-dashboard-state[data-compact] .openui-dashboard-state-title {
    color: var(--openui-dashboard-ink-secondary);
  }
`;
