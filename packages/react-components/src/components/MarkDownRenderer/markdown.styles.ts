import { css } from "goober";
const primary = "var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1))";
const body = `
  font: var(--openui-text-body-default, 400 16px/1.5 "Inter", sans-serif);
  letter-spacing: var(--openui-text-body-default-letter-spacing, -0.01em);
  font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
`;
const heavy = `
  font: var(--openui-text-body-default-heavy, 560 16px/1.5 "Inter", sans-serif);
  letter-spacing: var(--openui-text-body-default-heavy-letter-spacing, -0.01em);
  font-variation-settings: var(--openui-font-variation-medium, "wght" 560);
`;
const heading = `
  font: var(--openui-text-heading-xs, 600 16px/1.25 "Inter", sans-serif);
  letter-spacing: var(--openui-text-heading-xs-letter-spacing, -0.01em);
`;
export const codeClass = css`
  border-radius: 4px;
  padding: 2px 4px;
  background-color: var(--openui-sunk, oklch(0.097 0 0 / 0.04));
  border: 1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06));
  color: ${primary};
  ${body}
  /* Browsers ignore the legacy display:hidden declaration; preserve its rule. */
  &::after, &::before {
    content: "";
    display: hidden;
  }
`;
export const linkClass = css`
  color: var(--openui-text-info-primary, oklch(0.424 0.181 265.638 / 1));
  cursor: pointer;
  text-decoration: none;
  transition: color 0.2s ease-in-out;
  ${body}
  &:hover {
    text-decoration: underline;
  }
`;
export const rootClass = css`
  color: ${primary};
  ${body}
  max-width: none;
  &:where(.openui-markdown-renderer-card) {
    background-color: var(--openui-foreground, oklch(0.994 0 89.876 / 1));
    border-radius: 0.5rem;
    padding: 1rem;
  }
  &:where(.openui-markdown-renderer-card-sunk) {
    background-color: var(--openui-sunk, oklch(0.097 0 0 / 0.04));
    border-radius: 0.5rem;
    padding: 1rem;
  }
  & h1,
  & h2,
  & h3,
  & h4,
  & h5,
  & h6 {
    ${heading}
    color: ${primary};
    margin-bottom: 18px;
    &:has(+ p) {
      margin-bottom: 8px;
    }
    & + strong {
      ${heading}
    }
  }
  & p {
    color: ${primary};
    ${body}
    margin-bottom: 0;
    &:has(+ p) {
      margin-bottom: 18px;
    }
  }
  & strong {
    color: ${primary};
    ${heavy}
  }
  & li {
    margin-bottom: 8px;
    ${body}
    & :last-child {
      margin-bottom: 0;
    }
    &::marker {
      ${body}
      color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
    }
  }
  & li ul,
  & li li,
  & li ol {
    margin-top: 8px;
  }
  & ol {
    list-style-type: decimal;
    padding-left: 20px;
    margin-bottom: 20px;
    ${body}
    color: ${primary};
    & :last-child {
      margin-bottom: 0;
    }
  }
  & ul {
    list-style-type: disc;
    padding-left: 20px;
    margin-bottom: 24px;
    ${body}
    color: ${primary};
    & :last-child {
      margin-bottom: 0;
    }
  }
  & .openui-code-block-syntax-highlighter {
    padding: 25px !important;
    margin-top: 8px !important;
    margin-bottom: 8px !important;
    &:first-child {
      margin-top: 0 !important;
    }
    &:last-child {
      margin-bottom: 0 !important;
    }
  }
  & hr {
    margin-top: 48px;
    margin-bottom: 48px;
    & + * {
      margin-top: 0;
    }
  }
  & blockquote {
    color: ${primary};
    border-left: 4px solid color-mix(in oklab, ${primary} 70%, transparent);
    padding: 0 0 0 8px;
    font-style: italic;
    margin-left: 0;
    margin-top: 25px;
    margin-bottom: 25px;
    padding-left: 16px;
    quotes: "“" "”" "‘" "’";
    line-height: 1.625;
  }
  & blockquote strong {
    ${heavy}
  }
  & blockquote > *:first-child::before {
    content: open-quote;
    font-size: 1em;
    line-height: 1;
    vertical-align: top;
    margin-right: 0.2em;
  }
  & blockquote > *:last-child::after {
    content: close-quote;
    font-size: 1em;
    line-height: 1.5;
    vertical-align: top;
    margin-left: 0.2em;
  }
  & blockquote * {
    font-style: inherit;
    color: inherit;
    line-height: inherit;
  }
  & .openui-table-container {
    margin-bottom: 20px;
  }
  & > *:first-child {
    margin-top: 0;
  }
  & > *:last-child {
    margin-bottom: 0;
  }
`;
