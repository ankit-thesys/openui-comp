import { css, type CSSAttribute } from "goober";
const smallBody = {
  font: 'var(--openui-text-body-sm, 400 14px/1.5 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-body-sm-letter-spacing, -0.01em)",
  fontVariationSettings: 'var(--openui-font-variation-regular, "wght" 440)',
};
const padding = {
  paddingTop: "var(--openui-space-m, 12px)",
  paddingBottom: "var(--openui-space-m, 12px)",
  paddingLeft: "var(--openui-space-m, 12px)",
  paddingRight: "var(--openui-space-m, 12px)",
  color: "var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1))",
};
export const containerClass = css({
  position: "relative",
  width: "100%",
  overflow: "auto",
  border: "1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06))",
  borderRadius: "var(--openui-radius-2xl, 14px)",
} satisfies CSSAttribute);
export const tableClass = css({
  ...smallBody,
  width: "100%",
  captionSide: "bottom",
  borderCollapse: "collapse",
} satisfies CSSAttribute);
export const footerClass = css({
  borderTop: "1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06))",
  "& > tr:last-child": { borderBottom: 0 },
} satisfies CSSAttribute);
export const headClass = css({
  ...padding,
  borderBottom: "1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06))",
  "& .openui-table-head-label": {
    ...smallBody,
    color: "var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6))",
    display: "inline-flex",
    flexGrow: 1,
    justifyContent: "left",
  },
  "& .openui-table-head-content": {
    display: "flex",
    alignItems: "center",
    gap: "var(--openui-space-2xs, 4px)",
  },
  "& .openui-table-head-icon": {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6))",
  },
} satisfies CSSAttribute);
export const rowClass = css({
  "&:nth-child(even)": {
    backgroundColor: "var(--openui-highlight-subtle, oklch(0.097 0 0 / 0.02))",
  },
  borderBottom: "1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06))",
  "&:last-child": { borderBottom: 0 },
} satisfies CSSAttribute);
export const cellClass = css({ ...padding, whiteSpace: "nowrap" } satisfies CSSAttribute);
export const alignmentClass = css({
  "&:where(.openui-table-align-left)": { textAlign: "left", justifyContent: "flex-start" },
  "&:where(.openui-table-align-right)": {
    textAlign: "right",
    justifyContent: "flex-end",
    "& .openui-table-head-label": { justifyContent: "flex-end" },
  },
  "&:where(.openui-table-align-center)": {
    textAlign: "center",
    justifyContent: "center",
    "& .openui-table-head-label": { justifyContent: "center" },
  },
} satisfies CSSAttribute);
