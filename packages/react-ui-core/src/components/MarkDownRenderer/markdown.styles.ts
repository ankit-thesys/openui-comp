import { css, type CSSAttribute } from "goober";
const primary = "var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1))";
const body = {
  font: 'var(--openui-text-body-default, 400 16px/1.5 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-body-default-letter-spacing, -0.01em)",
  fontVariationSettings: 'var(--openui-font-variation-regular, "wght" 440)',
};
const heavy = {
  font: 'var(--openui-text-body-default-heavy, 560 16px/1.5 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-body-default-heavy-letter-spacing, -0.01em)",
  fontVariationSettings: 'var(--openui-font-variation-medium, "wght" 560)',
};
const heading = {
  font: 'var(--openui-text-heading-xs, 600 16px/1.25 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-heading-xs-letter-spacing, -0.01em)",
};
export const codeClass = css({
  borderRadius: "4px",
  padding: "2px 4px",
  backgroundColor: "var(--openui-sunk, oklch(0.097 0 0 / 0.04))",
  border: "1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06))",
  color: primary,
  ...body,
  // Browsers ignore the legacy display:hidden declaration; preserve its rule.
  "&::after, &::before": { content: '""', display: "hidden" },
} satisfies CSSAttribute);
export const linkClass = css({
  color: "var(--openui-text-info-primary, oklch(0.424 0.181 265.638 / 1))",
  cursor: "pointer",
  textDecoration: "none",
  transition: "color 0.2s ease-in-out",
  ...body,
  "&:hover": { textDecoration: "underline" },
} satisfies CSSAttribute);
export const rootClass = css({
  color: primary,
  ...body,
  maxWidth: "none",
  "&:where(.openui-markdown-renderer-card)": {
    backgroundColor: "var(--openui-foreground, oklch(0.994 0 89.876 / 1))",
    borderRadius: "0.5rem",
    padding: "1rem",
  },
  "&:where(.openui-markdown-renderer-card-sunk)": {
    backgroundColor: "var(--openui-sunk, oklch(0.097 0 0 / 0.04))",
    borderRadius: "0.5rem",
    padding: "1rem",
  },
  "& h1, & h2, & h3, & h4, & h5, & h6": {
    ...heading,
    color: primary,
    marginBottom: "18px",
    "&:has(+ p)": { marginBottom: "8px" },
    "& + strong": { ...heading },
  },
  "& p": { color: primary, ...body, marginBottom: 0, "&:has(+ p)": { marginBottom: "18px" } },
  "& strong": { color: primary, ...heavy },
  "& li": {
    marginBottom: "8px",
    ...body,
    "& :last-child": { marginBottom: 0 },
    "&::marker": { ...body, color: "var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6))" },
  },
  "& li ul, & li li, & li ol": { marginTop: "8px" },
  "& ol": {
    listStyleType: "decimal",
    paddingLeft: "20px",
    marginBottom: "20px",
    ...body,
    color: primary,
    "& :last-child": { marginBottom: 0 },
  },
  "& ul": {
    listStyleType: "disc",
    paddingLeft: "20px",
    marginBottom: "24px",
    ...body,
    color: primary,
    "& :last-child": { marginBottom: 0 },
  },
  "& .openui-code-block-syntax-highlighter": {
    padding: "25px !important",
    marginTop: "8px !important",
    marginBottom: "8px !important",
    "&:first-child": { marginTop: "0 !important" },
    "&:last-child": { marginBottom: "0 !important" },
  },
  "& hr": { marginTop: "48px", marginBottom: "48px", "& + *": { marginTop: 0 } },
  "& blockquote": {
    color: primary,
    borderLeft: `4px solid color-mix(in oklab, ${primary} 70%, transparent)`,
    padding: "0 0 0 8px",
    fontStyle: "italic",
    marginLeft: 0,
    marginTop: "25px",
    marginBottom: "25px",
    paddingLeft: "16px",
    quotes: '"“" "”" "‘" "’"',
    lineHeight: 1.625,
  },
  "& blockquote strong": { ...heavy },
  "& blockquote > *:first-child::before": {
    content: "open-quote",
    fontSize: "1em",
    lineHeight: 1,
    verticalAlign: "top",
    marginRight: "0.2em",
  },
  "& blockquote > *:last-child::after": {
    content: "close-quote",
    fontSize: "1em",
    lineHeight: 1.5,
    verticalAlign: "top",
    marginLeft: "0.2em",
  },
  "& blockquote *": { fontStyle: "inherit", color: "inherit", lineHeight: "inherit" },
  "& .openui-table-container": { marginBottom: "20px" },
  "& > *:first-child": { marginTop: 0 },
  "& > *:last-child": { marginBottom: 0 },
} satisfies CSSAttribute);
