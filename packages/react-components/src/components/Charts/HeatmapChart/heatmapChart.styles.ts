import { css } from "goober";
import { fadeAppearAnimation } from "../shared/animations/fadeAppear.styles";
import { centeredContainer } from "../shared/chartBaseDeclarations";
import { svgTickLabel } from "../shared/chartTypography";
const labelTypography = `
  font: var(--openui-text-label-xs, 400 12px/1.25 "Inter", sans-serif);
  letter-spacing: var(--openui-text-label-xs-letter-spacing, -0.01em);
  font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
`;
export const rootClass = css`
  ${centeredContainer}
  & :where(.openui-heatmap-chart-x-tick), & :where(.openui-heatmap-chart-y-tick) {
    ${svgTickLabel}
  }
  & :where(.openui-heatmap-chart-cell),
  & :where(.openui-heatmap-chart-cell-label) {
    transition: fill 0.2s ease;
  }
  @media print {
    & :where(.openui-heatmap-chart-cell),
    & :where(.openui-heatmap-chart-cell-label) {
      transition: none;
    }
  }
  & :hover:where(.openui-heatmap-chart-cell) {
    stroke: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
    stroke-width: 1.5;
  }
  & :where(.openui-heatmap-chart-cell-label) {
    ${labelTypography}
    pointer-events: none;
    user-select: none;
  }
  & :where(.openui-heatmap-chart-cell--empty) {
    fill: var(--openui-border-default, oklch(0.097 0 0 / 0.06));
    fill-opacity: 0.35;
  }
  @media (prefers-reduced-motion: no-preference) {
    & :where(.openui-heatmap-chart-cell--animated),
    & :where(.openui-heatmap-chart-cell-label--animated) {
      opacity: 0;
      animation: ${fadeAppearAnimation} 0.4s ease-out forwards;
    }
  }
  & :where(.openui-heatmap-chart-color-scale) {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 6px 0 2px;
  }
  & :where(.openui-heatmap-chart-color-scale-label) {
    ${labelTypography}
    color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
    white-space: nowrap;
  }
  & :where(.openui-heatmap-chart-color-scale-ramp) {
    position: relative;
    display: flex;
    flex: 1;
    height: 8px;
    border-radius: 4px;
    overflow: hidden;
  }
  & :where(.openui-heatmap-chart-color-scale-bucket) {
    flex: 1;
  }
`;

export const divergingRampClass = css`
  &::after {
    content: "";
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 2px;
    transform: translateX(-50%);
    background: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
    opacity: 0.55;
  }
`;
