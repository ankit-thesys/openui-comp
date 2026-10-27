import { css } from "goober";
export const rootClass = "openui-chart-vertical-scroll-controls-root";

const stylesheetScope = css`
  :where(&:root) {
    .openui-chart-vertical-scroll-controls-root {
      & {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        width: 36px;
        height: calc(100% - 44px);
        flex-shrink: 0;
        padding-left: var(--openui-space-2xs, 4px);
      }
      & .openui-chart-vertical-scroll-button {
        background-color: var(--openui-foreground, oklch(0.994 0 89.876 / 1));
        pointer-events: auto;
      }
      & .openui-chart-vertical-scroll-button--disabled {
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
