import { css } from "goober";

const stylesheetScope = css`
  :where(&:root) {
    .openui-border-box {
      box-sizing: border-box;
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}

// Explicit opt-in preserves the three roots' existing applicability.
export const borderBoxClass = "openui-border-box";
