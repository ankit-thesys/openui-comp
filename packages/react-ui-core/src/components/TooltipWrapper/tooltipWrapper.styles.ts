import { css, keyframes, type CSSAttribute } from "goober";
// Existing shared slide/fade definitions, owned locally until another extracted family needs them.
const up = keyframes({
  from: { opacity: 0, transform: "translateY(2px)" },
  to: { opacity: 1, transform: "translateY(0)" },
});
const right = keyframes({
  from: { opacity: 0, transform: "translateX(-2px)" },
  to: { opacity: 1, transform: "translateX(0)" },
});
const down = keyframes({
  from: { opacity: 0, transform: "translateY(-2px)" },
  to: { opacity: 1, transform: "translateY(0)" },
});
const left = keyframes({
  from: { opacity: 0, transform: "translateX(2px)" },
  to: { opacity: 1, transform: "translateX(0)" },
});
const smallBody = {
  font: 'var(--openui-text-body-sm, 400 14px/1.5 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-body-sm-letter-spacing, -0.01em)",
  fontVariationSettings: 'var(--openui-font-variation-regular, "wght" 440)',
};
export const bodyClass = css({
  display: "flex",
  flexDirection: "column",
  gap: "var(--openui-space-2xs, 4px)",
  width: "100%",
  maxWidth: "248px",
} satisfies CSSAttribute);
export const headingClass = css({
  ...smallBody,
  color: "var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1))",
  width: "100%",
} satisfies CSSAttribute);
export const textClass = css({
  ...smallBody,
  color: "var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6))",
  width: "100%",
} satisfies CSSAttribute);
export const contentClass = css({
  boxSizing: "border-box",
  backgroundColor: "var(--openui-elevated, oklch(0.097 0 0 / 0.08))",
  padding: "var(--openui-space-xs, 6px) var(--openui-space-s, 8px)",
  outline: "1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06))",
  zIndex: 9999,
  borderRadius: "var(--openui-radius-s, 6px)",
  userSelect: "none",
  animationDuration: "400ms",
  animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
  willChange: "transform, opacity",
  '&[data-state="delayed-open"]': {
    '&[data-side="top"]': { animationName: down },
    '&[data-side="right"]': { animationName: left },
    '&[data-side="bottom"]': { animationName: up },
    '&[data-side="left"]': { animationName: right },
  },
} satisfies CSSAttribute);
