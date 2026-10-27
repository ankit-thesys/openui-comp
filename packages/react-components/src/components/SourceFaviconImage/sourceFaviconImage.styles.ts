import { css } from "goober";

export const faviconClass = "openui-source-favicon-image-root";

const stylesheetScope = css`
  :where(&:root) {
    .openui-source-favicon-image-root {
      object-fit: cover;
      display: flex;
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}
