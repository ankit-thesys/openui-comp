import { css } from "goober";
import { fadeAppearAnimation } from "../animations/fadeAppear.styles";
export const rootClass = css`
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
`;
