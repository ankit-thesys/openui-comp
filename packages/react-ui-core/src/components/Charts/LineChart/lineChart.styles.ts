import { css } from "goober";
import { drawLineAnimation } from "../shared/animations/drawLine.styles";
import {
  activeDotInner,
  activeDotOuter,
  cartesianContainer,
  cartesianContainerInner,
  cartesianMainContainer,
  cartesianYAxisContainer,
  crosshairLine,
  gridLine,
  zeroGridLine,
} from "../shared/chartBaseDeclarations";
import { svgTickLabel } from "../shared/chartTypography";

export const rootClass = css({
  ...cartesianContainer,
  "& :where(.openui-line-chart-container-inner)": cartesianContainerInner,
  "& :where(.openui-line-chart-y-axis-container)": cartesianYAxisContainer,
  "& :where(.openui-line-chart-main-container)": cartesianMainContainer,
  "& line:where(.openui-line-chart-grid line)": gridLine,
  "& line.openui-grid-zero-line:where(.openui-line-chart-grid line)": zeroGridLine,
  "& :where(.openui-line-chart-y-tick,.openui-line-chart-x-tick,.openui-line-chart-x-tick-angled)":
    svgTickLabel,
  "& :where(.openui-line-chart-crosshair-line)": crosshairLine,
  "& :where(.openui-line-chart-active-dot-outer)": activeDotOuter,
  "& :where(.openui-line-chart-active-dot-inner)": activeDotInner,
  "& :where(.openui-line-chart-line)": { fill: "none", strokeWidth: 2 },
  "& :where(.openui-line-chart-dot)": {
    stroke: "var(--openui-foreground, oklch(0.994 0 89.876 / 1))",
    strokeWidth: 1,
  },
  "@media (prefers-reduced-motion: no-preference)": {
    "& :where(.openui-line-chart-line--animated)": {
      strokeDasharray: "var(--path-length)",
      strokeDashoffset: "var(--path-length)",
      animation: `${drawLineAnimation} 1s ease-out forwards`,
    },
  },
});
