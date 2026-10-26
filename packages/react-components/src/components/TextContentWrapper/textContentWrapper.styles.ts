import { css } from "goober";
export const rootClass = css`
  display: flex;
  flex-direction: column;
  gap: var(--openui-space-xl, 24px);
`;
// MarkDownRenderer owns the shared rich-text rules; these are the wrapper's differences.
export const markdownClass = css`
  & p:has(+ ol),
  & p:has(+ ul) {
    margin-bottom: 8px;
  }
  &:where(.openui-text-content-markdown-dark-mode) p,
  &:where(.openui-text-content-markdown-dark-mode) h1,
  &:where(.openui-text-content-markdown-dark-mode) h2,
  &:where(.openui-text-content-markdown-dark-mode) h3,
  &:where(.openui-text-content-markdown-dark-mode) h4,
  &:where(.openui-text-content-markdown-dark-mode) h5,
  &:where(.openui-text-content-markdown-dark-mode) h6 {
    color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
  }
  &:where(.openui-text-content-markdown-dark-mode) .katex {
    margin-top: var(--openui-space-xs, 6px);
    display: inline-block;
  }
`;
