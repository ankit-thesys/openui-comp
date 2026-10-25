import { css, keyframes } from "goober";
import { gridLine } from "../shared/chartBaseDeclarations";
import { svgTickLabel } from "../shared/chartTypography";

const grow = keyframes({ from: { transform: "scaleX(0)" }, to: { transform: "scaleX(1)" } });
export const rootClass = css({
  position: "relative",
  width: "100%",
  height: "auto",
  display: "flex",
  flexDirection: "column",
  "& :where(.openui-horizontal-bar-chart-container-inner-wrapper)": {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    overflow: "hidden",
  },
  "& :where(.openui-horizontal-bar-chart-container-inner)": {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    width: "100%",
    flex: 1,
    minWidth: 0,
  },
  "& :where(.openui-horizontal-bar-chart-main-container)": {
    height: "100%",
    overflowY: "auto",
    "&::-webkit-scrollbar": { display: "none" },
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  },
  "& :where(.openui-horizontal-bar-chart-x-axis-container)": {
    flexShrink: 0,
    width: "100%",
    boxSizing: "border-box",
    borderTop: "1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06))",
    paddingTop: "var(--openui-space-2xs, 4px)",
  },
  "& :where(.openui-horizontal-bar-chart-category-label)": {
    display: "flex",
    alignItems: "center",
    color: "var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6))",
    font: svgTickLabel.font,
    letterSpacing: svgTickLabel.letterSpacing,
    fontVariationSettings: svgTickLabel.fontVariationSettings,
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    width: "100%",
    paddingLeft: "var(--openui-space-m, 12px)",
    boxSizing: "border-box",
  },
  "& :where(.openui-horizontal-bar-chart-x-tick)": svgTickLabel,
  "& line:where(.openui-horizontal-bar-chart-grid-vertical line)": gridLine,
  "& :where(.openui-horizontal-bar-chart-internal-line)": { pointerEvents: "none" },
  "& :where(.openui-horizontal-bar-chart-crosshair)": {
    fill: "var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1))",
    opacity: 0.04,
    pointerEvents: "none",
  },
  "@media (prefers-reduced-motion: no-preference)": {
    "& :where(.openui-horizontal-bar-chart-bar--animated)": {
      transformBox: "fill-box",
      transformOrigin: "left center",
      animation: `${grow} 0.6s ease-out both`,
    },
    "& .openui-horizontal-bar-chart-bar--negative:where(.openui-horizontal-bar-chart-bar--animated)":
      { transformOrigin: "right center" },
  },
});
