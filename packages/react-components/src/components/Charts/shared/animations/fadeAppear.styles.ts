import type { StyleCss } from "../../../../styles/useStyles";

// The name is inert on import; register the keyframes through useStyles at render time.
export const fadeAppearAnimation = "openui-chart-fade-appear";
export const fadeAppearStyles = (css: StyleCss) => css`
  @keyframes openui-chart-fade-appear {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;
