import { css } from "goober";
export const emptyClass = css`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  & :where(.openui-chart-empty-text) {
    font: var(--openui-text-body-default, 400 16px/1.5 "Inter", sans-serif);
    letter-spacing: var(--openui-text-body-default-letter-spacing, -0.01em);
    font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
    color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
  }
`;
export const yAxisLabelClass = css`
  font: var(--openui-text-label-xs, 400 12px/1.25 "Inter", sans-serif);
  letter-spacing: var(--openui-text-label-xs-letter-spacing, -0.01em);
  font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
  color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
  padding-bottom: var(--openui-space-s, 8px);
`;
export const xAxisLabelClass = css`
  font: var(--openui-text-label-xs, 400 12px/1.25 "Inter", sans-serif);
  letter-spacing: var(--openui-text-label-xs-letter-spacing, -0.01em);
  font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
  color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
  text-align: center;
`;
