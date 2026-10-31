import type { StyleCss } from "../../../../styles/useStyles";

// The name is inert on import; register the keyframes through useStyles at render time.
export const drawLineAnimation = "openui-chart-draw-line";
export const drawLineStyles = (css: StyleCss) => css`
  @keyframes openui-chart-draw-line {
    to {
      stroke-dashoffset: 0;
    }
  }
`;
