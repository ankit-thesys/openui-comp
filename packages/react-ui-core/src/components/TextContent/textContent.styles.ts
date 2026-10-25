import { css } from "goober";
export const rootClass = css`
  box-sizing: border-box;
  color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
  font: var(--openui-text-body-default, 400 16px/1.5 "Inter", sans-serif);
  letter-spacing: var(--openui-text-body-default-letter-spacing, -0.01em);
  font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
  border: 1px solid;
`;
export const variantClasses = {
  sunk: css`
    padding: var(--openui-space-m, 12px);
    background: var(--openui-sunk, oklch(0.097 0 0 / 0.04));
    border-radius: var(--openui-radius-m, 8px);
    border-color: var(--openui-border-default, oklch(0.097 0 0 / 0.06));
  `,
  card: css`
    padding: var(--openui-space-m, 12px);
    border-radius: var(--openui-radius-m, 8px);
    border-color: var(--openui-border-default, oklch(0.097 0 0 / 0.06));
  `,
  clear: css`
    border-color: transparent;
  `,
};
