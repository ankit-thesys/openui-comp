import { css, keyframes } from "goober";
import {
  cartesianContainer,
  cartesianContainerInner,
  cartesianMainContainer,
  cartesianYAxisContainer,
  gridLine,
  zeroGridLine,
} from "../shared/chartBaseDeclarations";
import { svgTickLabel } from "../shared/chartTypography";

const grow = keyframes({ from: { transform: "scaleY(0)" }, to: { transform: "scaleY(1)" } });
export const rootClass = css({
  ...cartesianContainer,
  "& :where(.openui-bar-chart-container-inner)": cartesianContainerInner,
  "& :where(.openui-bar-chart-y-axis-container)": cartesianYAxisContainer,
  "& :where(.openui-bar-chart-main-container)": cartesianMainContainer,
  "& line:where(.openui-bar-chart-grid line)": gridLine,
  "& line.openui-grid-zero-line:where(.openui-bar-chart-grid line)": zeroGridLine,
  "& :where(.openui-bar-chart-y-tick,.openui-bar-chart-x-tick,.openui-bar-chart-x-tick-angled)":
    svgTickLabel,
  "& :where(.openui-bar-chart-hover-highlight)": {
    fill: "var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1))",
    opacity: 0.04,
    pointerEvents: "none",
  },
  "& :where(.openui-bar-chart-internal-line)": { pointerEvents: "none" },
  "@media (prefers-reduced-motion: no-preference)": {
    "& :where(.openui-bar-chart-bar--animated)": {
      transformBox: "fill-box",
      transformOrigin: "center bottom",
      animation: `${grow} 0.6s ease-out both`,
    },
    "& .openui-bar-chart-bar--negative:where(.openui-bar-chart-bar--animated)": {
      transformOrigin: "center top",
    },
  },
});
