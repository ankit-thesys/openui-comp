import { css } from "goober";
export const rootClass = "openui-chart-horizontal-scroll-controls-root";

const stylesheetScope = css`
  :where(&:root) {
    .openui-chart-horizontal-scroll-controls-root {
      & {
        position: relative;
      }
      & .openui-chart-horizontal-scroll-button {
        position: absolute;
        background-color: var(--openui-foreground, oklch(0.994 0 89.876 / 1));
      }
      & .openui-chart-horizontal-scroll-button--left {
        top: -23px;
        transform: translateY(-50%);
        left: 20px;
      }
      & .openui-chart-horizontal-scroll-button--right {
        top: -23px;
        transform: translateY(-50%);
        right: 0px;
      }
      & .openui-chart-horizontal-scroll-button--disabled {
        visibility: hidden;
        cursor: not-allowed;
        transition: visibility 0.1s linear;
      }
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}
