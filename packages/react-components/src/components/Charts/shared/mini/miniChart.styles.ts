import { css } from "goober";
import { fadeAppearAnimation } from "../animations/fadeAppear.styles";
export const rootClass = "openui-mini-chart-root";

const stylesheetScope = css`
  :where(&:root) {
    .openui-mini-chart-root {
      & {
        position: relative;
        aspect-ratio: 1/1;
        min-width: 100px;
        min-height: 100px;
      }
      & > svg {
        display: block;
      }
      &:where(.openui-mini-chart--clickable) {
        cursor: pointer;
      }
      & :where(.openui-mini-line-chart-point) {
        fill: var(--openui-background, oklch(0.97 0 89.876 / 1));
      }
      @media (prefers-reduced-motion: no-preference) {
        & :where(.openui-mini-chart-mark--animated) {
          opacity: 0;
          animation: ${fadeAppearAnimation} 0.6s ease-out forwards;
        }
      }
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}
