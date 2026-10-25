import { css, keyframes } from "goober";
import { centeredContainer, centeredSvgWrapper } from "../shared/chartBaseDeclarations";
const appear = keyframes({
  from: { opacity: 0, transform: "scale(0.8)" },
  to: { opacity: 1, transform: "scale(1)" },
});
export const rootClass = css({
  ...centeredContainer,
  "& :where(.openui-pie-chart-svg-wrapper)": centeredSvgWrapper,
  "& :where(.openui-pie-chart-track)": {
    fill: "var(--openui-sunk, oklch(0.097 0 0 / 0.04))",
  },
  "@media (prefers-reduced-motion: no-preference)": {
    "& :where(.openui-pie-chart-slice--animated)": {
      opacity: 0,
      transformOrigin: "center center",
      animation: `${appear} 0.6s ease-out forwards`,
    },
  },
});
