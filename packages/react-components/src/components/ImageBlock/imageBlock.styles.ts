import { css, keyframes } from "goober";
export const wrapperClass = "openui-image-block-wrapper-styled";
export const wrapperMobileClass = "openui-image-block-wrapper-mobile";
export const errorClass = "openui-image-block-error";
export const imageClass = "openui-image-block-image-styled";
export const imageMobileClass = "openui-image-block-image-mobile";
const spin = keyframes`to {transform:rotate(360deg);}`;
export const loaderClass = "openui-image-block-loader-styled";

const stylesheetScope = css`
  :where(&:root) {
    .openui-image-block-wrapper-styled {
      flex: 1 1 0;
      min-width: 0;
      min-height: 240px;
      max-height: 240px;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      isolation: isolate;
      border-radius: var(--openui-radius-2xl, 14px);
      padding: calc(var(--openui-space-l, 18px) - 2px) calc(var(--openui-space-l, 18px) + 2px);
      overflow: hidden;
      &::before {
        content: "";
        position: absolute;
        inset: -20px;
        background-image: var(--bg-image);
        background-size: 150%;
        background-position: center;
        background-repeat: no-repeat;
        opacity: 0.2;
        filter: blur(12px);
        z-index: 0;
        border-radius: inherit;
      }
    }
    .openui-image-block-wrapper-mobile {
      height: auto;
      width: 100%;
      padding: 0;
    }
    .openui-image-block-error {
      visibility: hidden;
    }
    .openui-image-block-image-styled {
      height: 100%;
      max-width: 100%;
      object-fit: cover;
      border: 4px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06));
      border-radius: var(--openui-radius-l, 10px);
      position: relative;
      z-index: 1;
    }
    .openui-image-block-image-mobile {
      border-radius: var(--openui-radius-2xl, 14px);
      width: 100%;
      height: auto;
    }
    .openui-image-block-loader-styled {
      position: absolute;
      left: 50%;
      top: 50%;
      translate: -50% -50%;
      border-width: 3px;
      border-style: solid;
      height: 24px;
      width: 24px;
      animation: ${spin} 1s linear infinite;
      border-radius: var(--openui-radius-full, 9999px);
      border-color: rgb(209, 213, 219);
      border-top-color: rgb(37, 99, 235);
      z-index: 2;
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}
