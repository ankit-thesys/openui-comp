import type { StyleCss } from "../../styles/useStyles";
export const names = {
  root: "openui-image-text",
  imageContainer: "openui-image-text-image-container",
  image: "openui-image-text-image",
  content: "openui-image-text-content",
  layout: {
    horizontal: "openui-image-text--layout-horizontal",
    vertical: "openui-image-text--layout-vertical",
  },
  bold: { true: "openui-image-text--bold" },
} as const;
export const imageTextStyles = (css: StyleCss) => ({
  root: css`
    min-width: var(--_openui-snippet-card-min-width, auto);
    width: var(--_openui-snippet-card-text-width, auto);
    overflow: var(--_openui-snippet-card-overflow, visible);
    display: flex;
    gap: var(--openui-space-m, 12px);
  `,
  imageContainer: css`
    position: relative;
    width: var(
      --_openui-image-text-size,
      calc(var(--openui-space-2xl, 36px) + var(--openui-space-2xs, 4px))
    );
    height: var(
      --_openui-image-text-size,
      calc(var(--openui-space-2xl, 36px) + var(--openui-space-2xs, 4px))
    );
    border-radius: var(--openui-radius-m, 8px);
    overflow: hidden;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--openui-sunk, oklch(0.097 0 0 / 0.04));
  `,
  image: css`
    width: 100%;
    height: 100%;
    object-fit: cover;
  `,
  content: css`
    display: flex;
    flex-direction: column;
    min-width: 0;
    padding-top: var(--_openui-image-text-content-padding, 0px);
  `,
  layout: {
    vertical: css`
      flex-direction: column;
      align-items: flex-start;
    `,
    horizontal: css`
      flex-direction: row;
      align-items: center;
      --_openui-image-text-content-padding: var(--openui-space-3xs, 2px);
    `,
  },
});
