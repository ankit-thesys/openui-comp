import { css } from "goober";
export const rootClass = "openui-image-text-large-root";
export const imageWrapClass = "openui-image-text-large-image-wrap";
export const imageClass = "openui-image-text-large-image";

const stylesheetScope = css`
  :where(&:root) {
    .openui-image-text-large-root {
      display: flex;
      width: 100%;
      min-width: 0;
      flex-direction: column;
      gap: var(--openui-space-m, 12px);
    }
    .openui-image-text-large-image-wrap {
      position: relative;
      width: 100%;
      min-height: 60px;
      max-height: 180px;
      border-radius: var(--openui-radius-m, 8px);
      overflow: hidden;
      background-color: var(--openui-sunk, oklch(0.097 0 0 / 0.04));
      line-height: 0;
    }
    .openui-image-text-large-image {
      display: block;
      width: 100%;
      height: 180px;
      max-height: 180px;
      object-fit: cover;
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}
