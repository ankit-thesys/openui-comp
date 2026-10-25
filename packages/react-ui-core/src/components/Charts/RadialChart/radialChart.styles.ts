import { css } from "goober";
import { fadeAppearAnimation } from "../shared/animations/fadeAppear.styles";
import { centeredContainer, centeredSvgWrapper } from "../shared/chartBaseDeclarations";
export const rootClass = css({
  ...centeredContainer,
  "& :where(.openui-radial-chart-svg-wrapper)": centeredSvgWrapper,
  "& :where(.openui-radial-chart-grid-circle)": {
    stroke: "var(--openui-border-default, oklch(0.097 0 0 / 0.06))",
    strokeWidth: 1,
    strokeDasharray: "4 4",
  },
  "@media (prefers-reduced-motion: no-preference)": {
    "& :where(.openui-radial-chart-bar--animated)": {
      opacity: 0,
      animation: `${fadeAppearAnimation} 0.5s ease-out forwards`,
    },
  },
});
