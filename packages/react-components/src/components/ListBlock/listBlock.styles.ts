import { css } from "goober";
export const rootClass = "openui-list-block-root";

const stylesheetScope = css`
  :where(&:root) {
    .openui-list-block-root {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      width: 100%;
      gap: var(--openui-space-l, 18px);
      &:where(.openui-list-block--small) {
        gap: var(--openui-space-m, 12px);
      }
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}
