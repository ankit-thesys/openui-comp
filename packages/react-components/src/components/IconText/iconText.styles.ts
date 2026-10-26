import { css } from "goober";
export const rootClass = css`
  display: flex;
  gap: var(--openui-space-m, 12px);
`;
export const layoutClasses = {
  vertical: css`
    flex-direction: column;
    align-items: flex-start;
  `,
  horizontal: css`
    flex-direction: row;
    align-items: flex-start;
    .openui-icon-tag {
      margin-top: var(--openui-space-3xs, 2px);
    }
    .openui-text-block__primary {
      font: var(--openui-text-body-sm-heavy, 560 14px/1.5 "Inter", sans-serif);
      letter-spacing: var(--openui-text-body-sm-heavy-letter-spacing, -0.01em);
      font-variation-settings: var(--openui-font-variation-medium, "wght" 560);
    }
  `,
};
export const contentClass = css`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;
