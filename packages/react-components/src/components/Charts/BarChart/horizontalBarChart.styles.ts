import { css, keyframes } from "goober";
import { gridLine } from "../shared/chartBaseDeclarations";
import { svgTickLabel, svgTickTypography } from "../shared/chartTypography";

const grow = keyframes`
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
`;
export const rootClass = css`
  position: relative;
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  & :where(.openui-horizontal-bar-chart-container-inner-wrapper) {
    width: 100%;
    display: flex;
    flex-direction: row;
    overflow: hidden;
  }
  & :where(.openui-horizontal-bar-chart-container-inner) {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    flex: 1;
    min-width: 0;
  }
  & :where(.openui-horizontal-bar-chart-main-container) {
    height: 100%;
    overflow-y: auto;
    &::-webkit-scrollbar {
      display: none;
    }
    scrollbar-width: none;
    ms-overflow-style: none;
  }
  & :where(.openui-horizontal-bar-chart-x-axis-container) {
    flex-shrink: 0;
    width: 100%;
    box-sizing: border-box;
    border-top: 1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06));
    padding-top: var(--openui-space-2xs, 4px);
  }
  & :where(.openui-horizontal-bar-chart-category-label) {
    display: flex;
    align-items: center;
    color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
    ${svgTickTypography}
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    width: 100%;
    padding-left: var(--openui-space-m, 12px);
    box-sizing: border-box;
  }
  & :where(.openui-horizontal-bar-chart-x-tick) {
    ${svgTickLabel}
  }
  & line:where(.openui-horizontal-bar-chart-grid-vertical line) {
    ${gridLine}
  }
  & :where(.openui-horizontal-bar-chart-internal-line) {
    pointer-events: none;
  }
  & :where(.openui-horizontal-bar-chart-crosshair) {
    fill: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
    opacity: 0.04;
    pointer-events: none;
  }
  @media (prefers-reduced-motion: no-preference) {
    & :where(.openui-horizontal-bar-chart-bar--animated) {
      transform-box: fill-box;
      transform-origin: left center;
      animation: ${grow} 0.6s ease-out both;
    }
    & .openui-horizontal-bar-chart-bar--negative:where(.openui-horizontal-bar-chart-bar--animated) {
      transform-origin: right center;
    }
  }
`;
