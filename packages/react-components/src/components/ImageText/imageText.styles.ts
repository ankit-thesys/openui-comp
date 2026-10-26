import { css } from "goober";
export const rootClass = css`
  display: flex;
  gap: var(--openui-space-m, 12px);
`;
export const imageContainerClass = css`
  position: relative;
  width: calc(var(--openui-space-2xl, 36px) + var(--openui-space-2xs, 4px));
  height: calc(var(--openui-space-2xl, 36px) + var(--openui-space-2xs, 4px));
  border-radius: var(--openui-radius-m, 8px);
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--openui-sunk, oklch(0.097 0 0 / 0.04));
`;
export const imageClass = css`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;
export const layoutClasses = {
  vertical: css`
    flex-direction: column;
    align-items: flex-start;
  `,
  horizontal: css`
    flex-direction: row;
    align-items: center;
    .openui-text-block__primary {
      font: var(--openui-text-body-sm-heavy, 560 14px/1.5 "Inter", sans-serif);
      letter-spacing: var(--openui-text-body-sm-heavy-letter-spacing, -0.01em);
      font-variation-settings: var(--openui-font-variation-medium, "wght" 560);
    }
    .openui-image-text__content {
      padding-top: var(--openui-space-3xs, 2px);
    }
  `,
};
export const contentClass = css`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;
