import { css, type CSSAttribute } from "goober";
export const wrapperClass = css({
  position: "relative",
  "&:hover .openui-code-block-copy-button": { opacity: 1 },
  "& .openui-code-block-copy-button": {
    position: "absolute",
    right: "0.5rem",
    top: "0.5rem",
    opacity: 0,
    transition: "opacity 0.2s ease-in-out",
    "&.openui-code-block-copy-button-copied": {
      color: "var(--openui-text-success-primary, oklch(0.448 0.108 151.328 / 1))",
      backgroundColor: "var(--openui-success-background, oklch(0.627 0.17 149.214 / 0.12))",
    },
  },
  "& .openui-code-block-syntax-highlighter": { margin: "0 !important", borderRadius: "0.5rem" },
} satisfies CSSAttribute);
