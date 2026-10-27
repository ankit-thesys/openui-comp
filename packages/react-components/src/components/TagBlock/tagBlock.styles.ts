import { css } from "goober";
export const blockClass = "openui-tag-block-root";

const stylesheetScope = css`
  :where(&:root) {
    .openui-tag-block-root {
      display: flex;
      flex-wrap: wrap;
      gap: var(--openui-space-s, 8px);
      max-width: 100%;
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}
