import { css } from "@openuidev/react-components";
// goober splits every selector at its commas, even inside :is(), :not() or :has(), so no
// selector here puts a comma inside parentheses: list the alternatives as separate selectors.
export const sharedStyles = css`
  .openui-dashboard-segmented {
    display: inline-flex;
    padding: 3px;
    border-radius: var(--openui-dashboard-radius-md);
    background: var(--openui-dashboard-neutral-soft);
  }
  .openui-dashboard-segmented button {
    height: 24px;
    padding: 0 10px;
    border: 0;
    border-radius: var(--openui-dashboard-radius-sm);
    background: transparent;
    font: inherit;
    font-size: 13px;
    font-weight: 500;
    color: var(--openui-dashboard-ink-secondary);
    cursor: pointer;
    transition:
      background 150ms,
      color 150ms,
      box-shadow 150ms;
  }
  .openui-dashboard-segmented-sm {
    padding: 2px;
    border-radius: var(--openui-dashboard-radius-sm);
  }
  .openui-dashboard-segmented-sm button {
    height: 24px;
    padding: 0 9px;
    font-size: 12px;
    border-radius: calc(var(--openui-dashboard-radius-sm) - 2px);
  }
  .openui-dashboard-chart-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 26px;
    margin-bottom: 10px;
  }
  .openui-dashboard-chart-top > .openui-dashboard-segmented {
    margin-left: auto;
  }
  .openui-dashboard-view-check {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 28px;
    font-size: 12px;
    color: var(--openui-dashboard-ink-secondary);
    cursor: pointer;
    white-space: nowrap;
  }
  .openui-dashboard-view-check:hover {
    color: var(--openui-dashboard-ink);
  }
  .openui-dashboard-view-check input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
    margin: 0;
    pointer-events: none;
  }
  .openui-dashboard-view-check input:focus-visible + .openui-dashboard-checkbox {
    box-shadow:
      0 0 0 2px var(--openui-dashboard-surface),
      0 0 0 3.5px var(--openui-dashboard-ink);
  }
  .openui-dashboard-size-key {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    font-size: 12px;
    color: var(--openui-dashboard-ink-secondary);
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }
  .openui-dashboard-chart-top > .openui-dashboard-legend + .openui-dashboard-size-key {
    margin-left: auto;
  }
  /* The size key (Scatter, PointMap): the measure's name and three graduated dots, which match
     the plot's: fill fading with size, a subtle outline, and a tiny solid centre. */

  .openui-dashboard-size-name {
    color: var(--openui-dashboard-ink-muted);
  }

  .openui-dashboard-size-step {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .openui-dashboard-size-dot {
    flex: none;
    border-radius: 50%;
    border: 1px solid color-mix(in srgb, var(--openui-dashboard-dot) 50%, transparent);
    background: radial-gradient(
      circle,
      var(--openui-dashboard-dot) 0 1.8px,
      color-mix(
          in srgb,
          var(--openui-dashboard-dot) var(--openui-dashboard-dot-fill, 20%),
          transparent
        )
        2px
    );
  }
  .openui-dashboard-legend-shape {
    flex: none;
    display: block;
  }
  .openui-dashboard-segmented button:hover {
    color: var(--openui-dashboard-ink);
  }
  .openui-dashboard-segmented button[aria-checked="true"] {
    background: var(--openui-dashboard-surface);
    color: var(--openui-dashboard-ink);
    box-shadow: 0 0 0 1px var(--openui-dashboard-border-strong);
  }
  .openui-dashboard-segmented button:disabled {
    opacity: 0.5;
    cursor: default;
  }
  .openui-dashboard-status-icon {
    --openui-dashboard-status: var(--openui-dashboard-ink-muted);
    flex: none;
    display: inline-grid;
    place-items: center;
    width: 0.85em;
    height: 0.85em;
    border-radius: 0.24em;
    background: color-mix(in srgb, var(--openui-dashboard-status) 16%, transparent);
    color: var(--openui-dashboard-status-ink, var(--openui-dashboard-ink-secondary));
  }
  .openui-dashboard-status-icon > span {
    width: 0.34em;
    height: 0.34em;
    border-radius: 50%;
    background: var(--openui-dashboard-status);
  }
  .openui-dashboard-status-shape {
    flex: none;
    display: inline-flex;
    align-items: center;

    justify-content: flex-start;
    width: 8px;
    height: 13px;
  }
  .openui-dashboard-status-shape > span {
    width: 6.5px;
    height: 6.5px;
    border-radius: 50%;
    background: var(
      --openui-dashboard-status-ink,
      var(--openui-dashboard-status, var(--openui-dashboard-ink-muted))
    );
  }
  .openui-dashboard-status-icon.openui-dashboard-status-warning > span,
  .openui-dashboard-status-shape.openui-dashboard-status-warning > span {
    width: 0.42em;
    height: 0.37em;
    border-radius: 0;
    clip-path: polygon(50% 0, 100% 100%, 0 100%);
  }
  .openui-dashboard-status-icon.openui-dashboard-status-bad > span,
  .openui-dashboard-status-shape.openui-dashboard-status-bad > span {
    width: 0.4em;
    height: 0.4em;
    border-radius: 0;
    clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
  }
  .openui-dashboard-status-icon.openui-dashboard-status-info > span,
  .openui-dashboard-status-shape.openui-dashboard-status-info > span {
    width: 0.3em;
    height: 0.3em;
    border-radius: 0.06em;
  }
  .openui-dashboard-status-icon.openui-dashboard-status-neutral > span,
  .openui-dashboard-status-shape.openui-dashboard-status-neutral > span {
    width: 0.42em;
    height: 0.12em;
    border-radius: 0.06em;
  }
  .openui-dashboard-status-shape.openui-dashboard-status-warning > span {
    width: 8px;
    height: 7px;
  }
  .openui-dashboard-status-shape.openui-dashboard-status-bad > span {
    width: 7.6px;
    height: 7.6px;
  }
  .openui-dashboard-status-shape.openui-dashboard-status-info > span {
    width: 5.7px;
    height: 5.7px;
    border-radius: 1.1px;
  }
  .openui-dashboard-status-shape.openui-dashboard-status-neutral > span {
    width: 8px;
    height: 2.3px;
    border-radius: 1.1px;
  }
  .openui-dashboard-status-good {
    --openui-dashboard-status: var(--openui-dashboard-good-mark);
    --openui-dashboard-status-ink: var(--openui-dashboard-good);
  }
  .openui-dashboard-status-warning {
    --openui-dashboard-status: var(--openui-dashboard-warning-mark);
    --openui-dashboard-status-ink: var(--openui-dashboard-warning);
  }
  .openui-dashboard-status-bad {
    --openui-dashboard-status: var(--openui-dashboard-bad-mark);
    --openui-dashboard-status-ink: var(--openui-dashboard-bad);
  }
  .openui-dashboard-status-info {
    --openui-dashboard-status: var(--openui-dashboard-info);
    --openui-dashboard-status-ink: var(--openui-dashboard-info);
  }
  .openui-dashboard-tex-0 {
    background-image:
      radial-gradient(
        circle at 2.12px 2.12px,
        rgb(0 0 0 / var(--openui-dashboard-bar-ink)) 0.8px,
        transparent 0.9px
      ),
      radial-gradient(
        circle at 6.36px 6.36px,
        rgb(0 0 0 / var(--openui-dashboard-bar-ink)) 0.8px,
        transparent 0.9px
      );
    background-size: 8.49px 8.49px;
  }
  .openui-dashboard-tex-1 {
    background-image: repeating-linear-gradient(
      135deg,
      rgb(0 0 0 / var(--openui-dashboard-bar-ink)) 0 0.45px,
      transparent 0.45px 4.5px
    );
  }
  .openui-dashboard-tex-2 {
    background-image: repeating-linear-gradient(
      45deg,
      rgb(0 0 0 / var(--openui-dashboard-bar-ink)) 0 0.45px,
      transparent 0.45px 4.5px
    );
  }
  .openui-dashboard-tex-3 {
    background-image: repeating-linear-gradient(
      0deg,
      rgb(0 0 0 / var(--openui-dashboard-bar-ink)) 0 0.45px,
      transparent 0.45px 4.5px
    );
  }
  .openui-dashboard-tex-4 {
    background-image:
      repeating-linear-gradient(
        135deg,
        rgb(0 0 0 / var(--openui-dashboard-bar-ink)) 0 0.45px,
        transparent 0.45px 5px
      ),
      repeating-linear-gradient(
        45deg,
        rgb(0 0 0 / var(--openui-dashboard-bar-ink)) 0 0.45px,
        transparent 0.45px 5px
      );
  }
  .openui-dashboard-tex-5 {
    background-image: repeating-linear-gradient(
      90deg,
      rgb(0 0 0 / var(--openui-dashboard-bar-ink)) 0 0.45px,
      transparent 0.45px 4.5px
    );
  }
  .openui-dashboard-delta {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }
  .openui-dashboard-delta-good {
    color: var(--openui-dashboard-good);
  }
  .openui-dashboard-delta-bad {
    color: var(--openui-dashboard-bad);
  }
  .openui-dashboard-delta-neutral {
    color: var(--openui-dashboard-ink-secondary);
  }
  .openui-dashboard-legend {
    position: relative;
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: 16px;
    min-width: 0;
    padding: var(--openui-dashboard-space-xs) 0;
    font-size: 12px;
    color: var(--openui-dashboard-ink-secondary);
    white-space: nowrap;
  }
  .openui-dashboard-legend-overflow {
    position: absolute;
    visibility: hidden;
    pointer-events: none;
  }
  .openui-dashboard-legend-more-anchor {
    position: relative;
    display: inline-flex;
    flex: none;
  }
  .openui-dashboard-legend-more {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 2px 6px;
    margin: -2px -6px;
    border: 0;
    border-radius: var(--openui-dashboard-radius-sm);
    background: transparent;
    font: inherit;
    color: var(--openui-dashboard-ink-secondary);
    cursor: pointer;
    transition:
      background 150ms,
      color 150ms;
  }
  .openui-dashboard-legend-more:hover,
  .openui-dashboard-legend-more[aria-expanded="true"] {
    color: var(--openui-dashboard-ink);
    background: var(--openui-dashboard-surface-subtle);
  }
  .openui-dashboard-legend-more:focus-visible {
    outline: 2px solid var(--openui-dashboard-accent);
    outline-offset: 1px;
  }
  .openui-dashboard-legend-more .openui-dashboard-filter-caret {
    margin-left: 0;
    width: 5px;
    height: 5px;
  }
  .openui-dashboard-legend-menu {
    position: absolute;
    top: calc(100% + 8px);
    right: -6px;
    z-index: 30;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 160px;
    padding: 10px 12px;
    border: 1px solid var(--openui-dashboard-border);
    border-radius: var(--openui-dashboard-radius-md);
    background: var(--openui-dashboard-surface);
    box-shadow: var(--openui-dashboard-shadow-pop);
  }
  .openui-dashboard-legend-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .openui-dashboard-legend-swatch {
    width: 10px;
    height: 10px;
    border-radius: 3px;
  }
  .openui-dashboard-legend-line {
    width: 14px;
    height: 0;
    border-top: 2px dashed var(--openui-dashboard-muted-mark);
  }
  .openui-dashboard-legend-dotted {
    border-top-style: dotted;
  }
  .openui-dashboard-legend-solid {
    border-top-style: solid;
  }
  .openui-dashboard-tooltip {
    min-width: 184px;
    padding: 12px 14px;
    border: 1px solid var(--openui-dashboard-border);
    border-radius: var(--openui-dashboard-radius-md);
    background: var(--openui-dashboard-surface);
    box-shadow: var(--openui-dashboard-shadow-pop);
    font-size: 12px;
  }
  .openui-dashboard-tooltip-title {
    margin: 0 0 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--openui-dashboard-border);
    font-weight: 600;
    color: var(--openui-dashboard-ink);
  }
  .openui-dashboard-tooltip-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 4px 0;
    color: var(--openui-dashboard-ink-secondary);
  }
  .openui-dashboard-tooltip-row span:first-child {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .openui-dashboard-tooltip-value {
    display: inline-flex;
    align-items: baseline;
    gap: 8px;
    font-weight: 600;
    color: var(--openui-dashboard-ink);
    font-variant-numeric: tabular-nums;
  }
  .openui-dashboard-tooltip-value > .openui-dashboard-delta {
    font-weight: 500;
  }
  .openui-dashboard-tooltip-share {
    color: var(--openui-dashboard-ink-muted);
    font-weight: 400;
  }
  .openui-dashboard-tooltip-sub {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid var(--openui-dashboard-border);
    font-weight: 400;
    color: var(--openui-dashboard-ink-muted);
  }
  .openui-dashboard-rows {
    position: relative;
  }
  .openui-dashboard-hrow {
    margin-inline: -8px;
    padding-inline: 8px;
    border-radius: var(--openui-dashboard-radius-sm);
    transition: background 150ms;
  }
  .openui-dashboard-hrow[data-hover] {
    background: var(--openui-dashboard-surface-subtle);
  }
  .openui-dashboard-rowtip {
    position: absolute;
    z-index: 5;
    pointer-events: none;

    width: max-content;
    transform: translate(14px, -50%);
  }
  .openui-dashboard-rowtip[data-flip] {
    transform: translate(calc(-100% - 14px), -50%);
  }
  .openui-dashboard-row-grid {
    position: absolute;
    top: -3px;
    bottom: -3px;
    border-left: 1px solid var(--openui-dashboard-grid);
  }
  .openui-dashboard-row-guide {
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    height: 1px;
    background: var(--openui-dashboard-grid);
  }
  .openui-dashboard-row-baseline {
    position: absolute;
    top: -3px;
    bottom: -3px;
    width: 2px;
    transform: translateX(-1px);
    background-image: radial-gradient(
      circle at center,
      var(--openui-dashboard-ink-muted) 0.75px,
      transparent 0.9px
    );
    background-size: 2px 4px;
    background-repeat: repeat-y;
  }
  .openui-dashboard-row-chip {
    position: absolute;
    bottom: 0;
    transform: translateX(-50%);
    padding: 0 7px;
    background: var(--openui-dashboard-ink);
    color: var(--openui-dashboard-surface);
    font-weight: 500;
    white-space: nowrap;
  }
  .openui-dashboard-tip-mark {
    flex: none;
    width: 12px;
    height: 10px;
  }
  .openui-dashboard-tip-dot {
    flex: none;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  .openui-dashboard-scroll-fill {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
  }
  .openui-dashboard-scroll-fill > .openui-dashboard-scroll-body {
    flex: 1 1 0;
    min-height: 0;
  }
  .openui-dashboard-rank-panel {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
  }
  .openui-dashboard-geo-side {
    display: flex;
    flex-direction: column;
  }
  .openui-dashboard-scroll {
    position: relative;
    min-width: 0;
  }
  .openui-dashboard-scroll-body {
    overflow-y: auto;
    scrollbar-width: none;
    overscroll-behavior: contain;
  }
  .openui-dashboard-scroll-body::-webkit-scrollbar {
    display: none;
  }
  .openui-dashboard-scroll-body[data-overflow] {
    padding-bottom: 36px;
  }
  .openui-dashboard-scroll-fade {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 44px;
    background: linear-gradient(to bottom, transparent, var(--openui-dashboard-surface));
    pointer-events: none;
  }
  .openui-dashboard-scroll-step {
    position: absolute;
    left: 50%;
    bottom: 0;
    transform: translateX(-50%);
    display: inline-flex;
    padding: 1px;
    border: 1px solid var(--openui-dashboard-border-strong);
    border-radius: var(--openui-dashboard-radius-sm);
    background: var(--openui-dashboard-surface);
    box-shadow: var(--openui-dashboard-shadow);
  }
  .openui-dashboard-scroll-step button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 20px;
    padding: 0;
    border: 0;
    border-radius: calc(var(--openui-dashboard-radius-sm) - 2px);
    background: transparent;
    color: var(--openui-dashboard-ink-secondary);
    cursor: pointer;
    transition:
      color 150ms,
      background 150ms;
  }
  .openui-dashboard-scroll-step button:hover:not(:disabled) {
    color: var(--openui-dashboard-ink);
    background: var(--openui-dashboard-surface-subtle);
  }
  .openui-dashboard-scroll-step button:disabled {
    color: var(--openui-dashboard-ink-muted);
    opacity: 0.4;
    cursor: default;
  }
  .openui-dashboard-scroll-step button:focus-visible {
    outline: 2px solid var(--openui-dashboard-accent);
    outline-offset: 1px;
  }
  .openui-dashboard-scroll-step svg {
    width: 11px;
    height: 11px;
  }
  .openui-dashboard-scroll-body > .openui-dashboard-menu,
  .openui-dashboard-scroll-body > .openui-dashboard-multi-list {
    max-height: none;
    overflow: visible;
  }
  .openui-dashboard-geo-side {
    position: relative;
    flex: 1 1 220px;
    min-width: 0;

    margin-top: -32px;
    border-left: 1px solid var(--openui-dashboard-border);
    padding-left: var(--openui-dashboard-space-lg);
  }
  .openui-dashboard-geo-side-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding-bottom: 10px;
  }
  .openui-dashboard-sort-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 0;
    border: 1px solid var(--openui-dashboard-border);
    border-radius: var(--openui-dashboard-radius-sm);
    background: var(--openui-dashboard-surface);
    color: var(--openui-dashboard-ink);
    cursor: pointer;
    transition: border-color 150ms;
  }
  .openui-dashboard-sort-toggle:hover {
    border-color: color-mix(in srgb, var(--openui-dashboard-ink) 18%, transparent);
  }
  .openui-dashboard-sort-toggle svg {
    width: 14px;
    height: 14px;
    transition: transform 150ms;
  }
  .openui-dashboard-sort-toggle[data-asc] svg {
    transform: scaleY(-1);
  }
  .openui-dashboard-sort-toggle:focus-visible {
    outline: 2px solid var(--openui-dashboard-accent);
    outline-offset: 1px;
  }
  @container openui-dashboard (max-width: 720px) {
    .openui-dashboard-geo-side {
      border-left: 0;
      padding-left: 0;
      margin-top: 0;
    }
  }
  .openui-dashboard-rank-head {
    display: flex;
    justify-content: flex-end;
    padding-bottom: 10px;
  }
  .openui-dashboard-rank {
    display: flex;
    flex-direction: column;
    gap: 22px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .openui-dashboard-rank-row {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .openui-dashboard-rank-top {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    font-size: 13px;
  }
  .openui-dashboard-rank-name {
    min-width: 0;
    font-weight: 500;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }
  .openui-dashboard-rank-value {
    flex-shrink: 0;
    white-space: nowrap;
    display: inline-flex;
    align-items: baseline;
    gap: 8px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  .openui-dashboard-rank-track {
    height: 4px;
    border-radius: 999px;

    background: color-mix(in srgb, var(--openui-dashboard-ink) 9%, transparent);
    overflow: hidden;
  }
  .openui-dashboard-rank-fill {
    height: 100%;
    border-radius: 999px;
    background-color: var(--openui-dashboard-series-1);
  }
  .openui-dashboard-rank-track {
    transition: transform 150ms;
  }
  .openui-dashboard-rank-row:hover .openui-dashboard-rank-track,
  .openui-dashboard-rank-row[data-linked] .openui-dashboard-rank-track {
    transform: scaleY(1.5);
  }
  .openui-dashboard-parts-legend {
    columns: 240px;
    column-gap: 64px;
    column-rule: 1px dotted var(--openui-dashboard-border-strong);
    font-size: 13px;
  }
  .openui-dashboard-parts-legend > div {
    break-inside: avoid;
    padding-block: 5px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-width: 0;
  }
  .openui-dashboard-parts-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    color: var(--openui-dashboard-ink-secondary);
  }
  .openui-dashboard-parts-name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .openui-dashboard-parts-nums {
    display: inline-flex;
    gap: 8px;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }
  .openui-dashboard-parts-share {
    color: var(--openui-dashboard-ink-muted);
  }
  .openui-dashboard-parts-value {
    font-weight: 600;
    min-width: 48px;
    text-align: right;
  }
  .openui-dashboard-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    min-height: 200px;
    padding: 16px;
    border-radius: var(--openui-dashboard-radius-sm);
    background: color-mix(in srgb, var(--openui-dashboard-ink) 2.5%, transparent);
    text-align: center;
  }
  .openui-dashboard-empty[data-state="loading"] {
    align-items: stretch;
    padding: 0;
    background: none;
  }
  .openui-dashboard-empty[data-state="loading"] .openui-dashboard-skel-block {
    flex: 1 1 auto;
  }
  .openui-dashboard-filter-caret {
    width: 6px;
    height: 6px;
    margin-left: 4px;
    border-right: 1.5px solid var(--openui-dashboard-ink-muted);
    border-bottom: 1.5px solid var(--openui-dashboard-ink-muted);
    transform: translateY(-2px) rotate(45deg);
  }
  .openui-dashboard-checkbox {
    display: inline-grid;
    place-items: center;
    flex: none;
    width: 14px;
    height: 14px;
    border: 1px solid var(--openui-dashboard-border-strong);
    border-radius: 4px;
    color: transparent;
    transition:
      background 150ms,
      border-color 150ms,
      color 150ms;
  }
  .openui-dashboard-view-check input:checked + .openui-dashboard-checkbox {
    border-color: transparent;
    background: var(--openui-dashboard-ink);
    color: var(--openui-dashboard-surface);
  }
  .openui-dashboard-chart {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    width: 100%;
    min-width: 0;
  }
  .openui-dashboard-chart-plot {
    flex: 1 1 auto;
    height: 0;
  }
  .openui-dashboard-chart .recharts-cartesian-axis-tick-value {
    fill: var(--openui-dashboard-ink-muted);
    font-size: 12px;
  }
  .openui-dashboard-chart .recharts-surface:focus,
  .openui-dashboard-chart .recharts-wrapper:focus,
  .openui-dashboard-chart *:focus {
    outline: none;
  }

  /* A card with a stat above its chart puts the legend on the stat's delta
   line, right-aligned: the chart wrapper dissolves so the legend can share
   the stat's row while the plot spans the row below. Narrow cards stack. */
  .openui-dashboard-card-body:has(> .openui-dashboard-stat + .openui-dashboard-chart),
  .openui-dashboard-state-content:has(> .openui-dashboard-stat + .openui-dashboard-chart) {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    column-gap: var(--openui-dashboard-space-lg);
  }
  .openui-dashboard-card-body > .openui-dashboard-stat:has(+ .openui-dashboard-chart),
  .openui-dashboard-state-content > .openui-dashboard-stat:has(+ .openui-dashboard-chart) {
    grid-column: 1;
    grid-row: 1;
  }
  .openui-dashboard-card-body > .openui-dashboard-stat + .openui-dashboard-chart,
  .openui-dashboard-state-content > .openui-dashboard-stat + .openui-dashboard-chart {
    display: contents;
  }
  .openui-dashboard-card-body
    > .openui-dashboard-stat
    + .openui-dashboard-chart
    > .openui-dashboard-legend,
  .openui-dashboard-state-content
    > .openui-dashboard-stat
    + .openui-dashboard-chart
    > .openui-dashboard-legend {
    grid-column: 2;
    grid-row: 1;
    align-self: end;
    justify-content: flex-end;
    /* The subtitle's line box, so keys centre exactly on the delta line. */
    line-height: 1.4;
  }
  .openui-dashboard-card-body
    > .openui-dashboard-stat
    + .openui-dashboard-chart
    > .openui-dashboard-chart-plot,
  .openui-dashboard-state-content
    > .openui-dashboard-stat
    + .openui-dashboard-chart
    > .openui-dashboard-chart-plot {
    grid-column: 1 / -1;
    grid-row: 2;
  }
  @container (max-width: 480px) {
    .openui-dashboard-card-body:has(> .openui-dashboard-stat + .openui-dashboard-chart),
    .openui-dashboard-state-content:has(> .openui-dashboard-stat + .openui-dashboard-chart) {
      display: flex;
    }
    .openui-dashboard-card-body > .openui-dashboard-stat + .openui-dashboard-chart,
    .openui-dashboard-state-content > .openui-dashboard-stat + .openui-dashboard-chart {
      display: flex;
    }
    .openui-dashboard-card-body
      > .openui-dashboard-stat
      + .openui-dashboard-chart
      > .openui-dashboard-legend,
    .openui-dashboard-state-content
      > .openui-dashboard-stat
      + .openui-dashboard-chart
      > .openui-dashboard-legend {
      justify-content: flex-start;
    }
  }
  .openui-dashboard-segmented button:focus-visible {
    outline: 2px solid var(--openui-dashboard-accent);
    outline-offset: 1px;
  }
  /* A ramp's colour key above its grid (Heatmap, Cohorts), 10px over the first row like every legend.
     After the legend rules: the key is a legend too, and this must win. */
  .openui-dashboard-ramp-key {
    align-items: center;
    margin-bottom: 10px;
  }
`;
