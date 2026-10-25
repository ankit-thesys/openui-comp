import { css, keyframes, type CSSAttribute } from "goober";
const fadeIn = keyframes({ from: { opacity: 0 }, to: { opacity: 1 } });
const slideIn = keyframes({
  from: { opacity: 0, transform: "translate(-50%, -48%)" },
  to: { opacity: 1, transform: "translate(-50%, -50%)" },
});
export const rootClass = css({
  position: "relative",
  zIndex: 9999,
  "& :where(.openui-modal-sr-only)": {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: 0,
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    border: 0,
  },
} satisfies CSSAttribute);
export const overlayClass = css({
  position: "fixed",
  inset: 0,
  background: "var(--openui-overlay, oklch(0 0 0 / 0.4))",
  zIndex: 9999,
  animation: `${fadeIn} 0.15s ease-out`,
} satisfies CSSAttribute);
export const contentClass = css({
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  zIndex: 10000,
  background: "var(--openui-foreground, oklch(0.994 0 89.876 / 1))",
  color: "var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1))",
  border: "1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06))",
  borderRadius: "12px",
  boxShadow: "0 16px 48px rgba(0, 0, 0, 0.2)",
  display: "flex",
  flexDirection: "column",
  maxHeight: "85vh",
  animation: `${slideIn} 0.15s ease-out`,
  "&:focus": { outline: "none" },
  "&:where(.openui-modal-sm)": { width: "400px", maxWidth: "90vw" },
  "&:where(.openui-modal-md)": { width: "560px", maxWidth: "90vw" },
  "&:where(.openui-modal-lg)": { width: "720px", maxWidth: "90vw" },
} satisfies CSSAttribute);
export const headerClass = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "var(--openui-space-m, 12px)",
  borderBottom: "1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06))",
} satisfies CSSAttribute);
export const titleClass = css({
  font: 'var(--openui-text-body-default-heavy, 560 16px/1.5 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-body-default-heavy-letter-spacing, -0.01em)",
  fontVariationSettings: 'var(--openui-font-variation-medium, "wght" 560)',
  margin: 0,
} satisfies CSSAttribute);
export const closeClass = css({
  all: "unset",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "28px",
  height: "28px",
  borderRadius: "6px",
  color: "var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6))",
  "&:hover": { color: "var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1))" },
} satisfies CSSAttribute);
export const bodyClass = css({
  padding: "var(--openui-space-m, 12px)",
  overflowY: "auto",
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: "var(--openui-space-m, 12px)",
} satisfies CSSAttribute);
