import { css, keyframes, type CSSAttribute } from "goober";

const body = {
  font: 'var(--openui-text-body-default, 400 16px/1.5 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-body-default-letter-spacing, -0.01em)",
  fontVariationSettings: 'var(--openui-font-variation-regular, "wght" 440)',
} satisfies CSSAttribute;
const small = {
  font: 'var(--openui-text-body-sm, 400 14px/1.5 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-body-sm-letter-spacing, -0.01em)",
  fontVariationSettings: 'var(--openui-font-variation-regular, "wght" 440)',
} satisfies CSSAttribute;
const show = keyframes({
  from: { opacity: 0, transform: "scale(0.95)" },
  to: { opacity: 1, transform: "scale(1)" },
});

export const triggerClass = css({
  boxSizing: "border-box",
  backgroundColor: "var(--openui-highlight-subtle, oklch(0.097 0 0 / 0.02))",
  color: "var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1))",
  ...body,
  border: "1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06))",
  outline: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--openui-space-s, 8px)",
  "&:hover": {
    background: "var(--openui-highlight, oklch(0.097 0 0 / 0.04))",
    borderColor: "var(--openui-border-interactive, oklch(0.097 0 0 / 0.12))",
    color: "var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6))",
    "&:not([data-placeholder])": {
      color: "var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1))",
    },
  },
  "&:disabled": {
    backgroundColor: "var(--openui-highlight-subtle, oklch(0.097 0 0 / 0.02))",
    color: "var(--openui-text-neutral-tertiary, oklch(0.097 0 0 / 0.2))",
    borderColor: "var(--openui-border-default, oklch(0.097 0 0 / 0.06))",
    cursor: "not-allowed",
  },
  '&[data-state="open"]': {
    borderColor: "var(--openui-border-interactive, oklch(0.097 0 0 / 0.12))",
    backgroundColor: "var(--openui-highlight, oklch(0.097 0 0 / 0.04))",
  },
  "&[data-placeholder]": { color: "var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6))" },
  "&:where(.openui-select-trigger-sm)": {
    ...small,
    padding: "calc(var(--openui-space-xs, 6px) - 1.5px) var(--openui-space-s, 8px)",
    borderRadius: "calc(var(--openui-radius-s, 6px) + 1px)",
  },
  "&:where(.openui-select-trigger-md)": {
    padding: "calc(var(--openui-space-xs, 6px) - 1px) calc(var(--openui-space-m, 12px) - 1px)",
    borderRadius: "var(--openui-radius-m, 8px)",
  },
  "&:where(.openui-select-trigger-lg)": {
    padding: "calc(var(--openui-space-s, 8px) - 1px) var(--openui-space-m, 12px)",
    borderRadius: "var(--openui-radius-l, 10px)",
  },
  "& .openui-select-trigger-icon": { height: "16px", width: "16px" },
  "& svg": { transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)" },
  '&[data-state="open"] svg': { transform: "rotate(180deg)" },
});
export const contentClass = css({
  boxSizing: "border-box",
  position: "relative",
  zIndex: 99999,
  maxHeight: "372px",
  minWidth: "var(--radix-select-trigger-width)",
  overflow: "hidden",
  border: "none",
  borderRadius: "var(--openui-radius-2xl, 14px)",
  backgroundColor:
    "color-mix(in oklch, var(--openui-foreground, oklch(0.994 0 89.876 / 1)), var(--openui-text-white, oklch(1 0 89.876 / 1)) 6%)",
  boxShadow:
    "0 0 0 1px color-mix(in oklch, var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1)) 6%, transparent), 0 4px 12px -2px oklch(0 0 0 / 0.05), 0 16px 32px -8px oklch(0 0 0 / 0.08)",
  "& > :first-child:first-child": {
    borderTopLeftRadius: "calc(var(--openui-radius-2xl, 14px) - var(--openui-space-2xs, 4px))",
    borderTopRightRadius: "calc(var(--openui-radius-2xl, 14px) - var(--openui-space-2xs, 4px))",
  },
  "& > :last-child:last-child": {
    borderBottomLeftRadius: "calc(var(--openui-radius-2xl, 14px) - var(--openui-space-2xs, 4px))",
    borderBottomRightRadius: "calc(var(--openui-radius-2xl, 14px) - var(--openui-space-2xs, 4px))",
  },
  padding: 0,
  color: "var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1))",
  transformOrigin: "top center",
  animation: `${show} 0.18s ease-out forwards`,
  "&.openui-select-content-sm .openui-select-label, &.openui-select-content-sm .openui-select-item, &.openui-select-content-sm .openui-select-item-text, &.openui-select-content-sm .openui-select-item-text-value":
    small,
});
export const viewportClass = css({
  boxSizing: "border-box",
  padding: "var(--openui-space-2xs, 4px) 0",
  '&[data-position="popper"]': { width: "100%" },
});
export const groupClass = css({
  display: "flex",
  flexDirection: "column",
  gap: "var(--openui-space-3xs, 2px)",
});
export const labelClass = css({
  boxSizing: "border-box",
  ...body,
  padding: "var(--openui-space-s, 8px) var(--openui-space-m-l, 16px) var(--openui-space-2xs, 4px)",
  color:
    "color-mix(in oklch, var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1)) 60%, transparent)",
  fontSize: "12px",
  lineHeight: "12px",
});
export const itemClass = css({
  boxSizing: "border-box",
  position: "relative",
  display: "flex",
  cursor: "default",
  userSelect: "none",
  alignItems: "center",
  justifyContent: "space-between",
  ...body,
  height: "32px",
  padding: "0 var(--openui-space-m-l, 16px)",
  borderRadius: 0,
  outline: "none",
  color: "var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1))",
  "&:where(.openui-select-item--with-tick)": { paddingRight: "var(--openui-space-xl, 24px)" },
  "&[data-disabled]": { pointerEvents: "none", opacity: 0.5 },
  "&[data-highlighted]": { color: "var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1))" },
  '&:hover:not([data-state="checked"])': {
    backgroundColor: "var(--openui-highlight, oklch(0.097 0 0 / 0.04))",
    color: "var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1))",
  },
  "&:focus": {
    backgroundColor: "var(--openui-highlight, oklch(0.097 0 0 / 0.04))",
    color: "var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1))",
  },
  '&[data-state="checked"]': {
    backgroundColor: "var(--openui-highlight, oklch(0.097 0 0 / 0.04))",
  },
  "& .openui-select-item-check-wrapper": {
    position: "absolute",
    right: "8px",
    height: "14px",
    width: "14px",
  },
  "& .openui-select-item-check-icon": { height: "16px", width: "16px" },
  "& .openui-select-item-text": {
    flex: 1,
    ...body,
    color: "var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6))",
  },
  "& .openui-select-item-value": {
    color: "var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6))",
  },
});
export const separatorClass = css({
  boxSizing: "border-box",
  margin: "var(--openui-space-2xs, 4px) 0",
  height: "1px",
  borderTop: "1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06))",
});
