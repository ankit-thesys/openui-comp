import { css } from "goober";
export const wrapperClass = "openui-code-block-root";

const stylesheetScope = css`
  :where(&:root) {
    .openui-code-block-root {
      position: relative;
      &:hover .openui-code-block-copy-button {
        opacity: 1;
      }
      & .openui-code-block-copy-button {
        position: absolute;
        right: 0.5rem;
        top: 0.5rem;
        opacity: 0;
        transition: opacity 0.2s ease-in-out;
        &.openui-code-block-copy-button-copied {
          color: var(--openui-text-success-primary, oklch(0.448 0.108 151.328 / 1));
          background-color: var(--openui-success-background, oklch(0.627 0.17 149.214 / 0.12));
        }
      }
      & .openui-code-block-syntax-highlighter {
        margin: 0 !important;
        border-radius: 0.5rem;
      }
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}
