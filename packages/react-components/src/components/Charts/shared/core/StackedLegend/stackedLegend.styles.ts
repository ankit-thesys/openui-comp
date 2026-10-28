import { css } from "goober";
export const rootClass = css`
  & {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
  }
  & :where(.openui-stacked-legend-header) {
    width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 0 var(--openui-space-xs, 6px) var(--openui-space-xs, 6px) var(--openui-space-l, 18px);
    color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
  }
  & :where(.openui-stacked-legend-header-buttons) {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--openui-space-xs, 6px);
  }
  & :where(.openui-stacked-legend-header-title) {
    font: var(--openui-text-label-sm, 400 14px/1.25 "Inter", sans-serif);
    letter-spacing: var(--openui-text-label-sm-letter-spacing, -0.01em);
    font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
    color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
  }
  & :where(.openui-stacked-legend-scroll-button) {
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  & :where(.openui-stacked-legend) {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: safe center;
    min-width: 200px;
    overflow-y: scroll;
    height: 100%;
    scrollbar-width: none;
    -ms-overflow-style: none;
    scroll-behavior: smooth;
  }
  & :where(.openui-stacked-legend__item) {
    width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    padding: 4px 8px;
    border-radius: var(--openui-radius-m, 8px);
    transition: all 0.2s ease-in-out;
    height: 32px;
    flex-shrink: 0;
  }
  & :hover:where(.openui-stacked-legend__item) {
    background-color: var(--openui-sunk, oklch(0.097 0 0 / 0.04));
  }
  & :where(.openui-stacked-legend__item--active) {
    background-color: var(--openui-sunk, oklch(0.097 0 0 / 0.04));
  }
  & :where(.openui-stacked-legend__item-label) {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    min-width: 0;
    flex: 1;
  }
  & :where(.openui-stacked-legend__item-color-container) {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 10px;
    height: 100%;
    width: 32px;
    flex-shrink: 0;
  }
  & :where(.openui-stacked-legend__item-color) {
    width: 10px;
    height: 10px;
    border-radius: 2px;
    transition: all 0.2s ease-in-out;
  }
  & .openui-stacked-legend__item:hover :where(.openui-stacked-legend__item-color) {
    transform: scale(1.2);
  }
  & .openui-stacked-legend__item--active :where(.openui-stacked-legend__item-color) {
    transform: scale(1.3);
  }
  & :where(.openui-stacked-legend__item-label-text) {
    font: var(--openui-text-label-sm, 400 14px/1.25 "Inter", sans-serif);
    letter-spacing: var(--openui-text-label-sm-letter-spacing, -0.01em);
    font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
    color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
    transition: color 0.2s ease-in-out;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }
  & :where(.openui-stacked-legend__item-value) {
    font: var(--openui-text-label-sm, 400 14px/1.25 "Inter", sans-serif);
    letter-spacing: var(--openui-text-label-sm-letter-spacing, -0.01em);
    font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
    color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
    transition: all 0.2s ease-in-out;
    flex-shrink: 0;
  }
  & :where(.openui-stacked-legend-show-more-button) {
    width: 100%;
    justify-content: center;
    margin-top: var(--openui-space-2xs, 4px);
  }
  & :where(.openui-stacked-legend-separator) {
    margin: var(--openui-space-2xs, 4px) 0;
  }
`;
export const layoutClass = css`
  & {
    display: flex;
    position: relative;
    gap: 20px;
    align-items: center;
  }
  &:where(.openui-chart-with-stacked-legend--column) {
    flex-direction: column;
  }
  &:where(.openui-chart-with-stacked-legend--row) {
    flex-direction: row;
    min-height: 296px;
  }
  & :where(.openui-chart-with-stacked-legend__chart) {
    width: 100%;
    min-width: 0;
  }
  & :where(.openui-chart-with-stacked-legend__legend) {
    display: flex;
    justify-content: center;
    width: 100%;
  }
  &.openui-chart-with-stacked-legend--column :where(.openui-chart-with-stacked-legend__legend) {
    align-items: flex-start;
  }
  &.openui-chart-with-stacked-legend--row :where(.openui-chart-with-stacked-legend__chart) {
    flex: 1;
  }
  &.openui-chart-with-stacked-legend--row :where(.openui-chart-with-stacked-legend__legend) {
    flex: 1;
    min-width: 0;
    height: 296px;
    align-items: center;
  }
  &.openui-chart-with-stacked-legend--row
    .openui-chart-with-stacked-legend__legend
    :where(.openui-stacked-legend-container) {
    justify-content: center;
  }
  &.openui-chart-with-stacked-legend--row
    .openui-chart-with-stacked-legend__legend
    :where(.openui-stacked-legend) {
    height: auto;
    max-height: 100%;
  }
`;

export const scrollbarClass = css`
  &::-webkit-scrollbar {
    display: none;
  }
`;
