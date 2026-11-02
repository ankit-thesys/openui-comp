import { css } from "../../../../styles/css";

// The stable animation name and its keyframes are available on import.
export const fadeAppearStyles = css`
  @keyframes openui-chart-fade-appear {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

export const fadeAppearAnimation = fadeAppearStyles && "openui-chart-fade-appear";
