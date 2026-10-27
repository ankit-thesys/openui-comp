import { css } from "goober";
export const rootClass = "openui-text-content-wrapper-root";
// MarkDownRenderer owns the shared rich-text rules; these are the wrapper's differences.
export const markdownClass = "openui-text-content-wrapper-markdown";

const stylesheetScope = css`
  :where(&:root) {
    .openui-text-content-wrapper-root {
      display: flex;
      flex-direction: column;
      gap: var(--openui-space-xl, 24px);
    }
    .openui-text-content-wrapper-markdown {
      & p:has(+ ol),
      & p:has(+ ul) {
        margin-bottom: 8px;
      }
      &.openui-text-content-markdown-dark-mode p,
      &.openui-text-content-markdown-dark-mode h1,
      &.openui-text-content-markdown-dark-mode h2,
      &.openui-text-content-markdown-dark-mode h3,
      &.openui-text-content-markdown-dark-mode h4,
      &.openui-text-content-markdown-dark-mode h5,
      &.openui-text-content-markdown-dark-mode h6 {
        color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
      }
      &.openui-text-content-markdown-dark-mode .katex {
        margin-top: var(--openui-space-xs, 6px);
        display: inline-block;
      }
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}
