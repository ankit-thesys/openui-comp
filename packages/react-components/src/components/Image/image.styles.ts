import { css } from "goober";
export const imageClass = "openui-image-root";
export const fitClass = "openui-image-fit-styled";
export const fillClass = "openui-image-fill-styled";
export const errorClass = "openui-image-error";

const stylesheetScope = css`
  :where(&:root) {
    .openui-image-root {
      display: flex;
      box-sizing: border-box;
      max-width: 100%;
      height: auto;
      overflow: clip;
      border-radius: var(--openui-radius-m, 8px);
      border: 1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06));
      background-color: var(--openui-foreground, oklch(0.994 0 89.876 / 1));
    }
    .openui-image-fit-styled {
      object-fit: contain;
      width: 100%;
      height: 100%;
    }
    .openui-image-fill-styled {
      object-fit: cover;
      width: 100%;
      height: 100%;
    }
    .openui-image-error {
      visibility: hidden;
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}
