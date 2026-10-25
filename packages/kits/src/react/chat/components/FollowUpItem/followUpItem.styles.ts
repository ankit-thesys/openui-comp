import { css } from "goober";

export const rootClass = css({
  border: 0,
  background: "transparent",
  font: 'var(--openui-text-body-default, 400 16px/1.5 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-body-default-letter-spacing, -0.01em)",
  fontVariationSettings: 'var(--openui-font-variation-regular, "wght" 440)',
  boxSizing: "border-box",
  padding: "var(--openui-space-s, 8px) var(--openui-space-000, 0)",
  borderBottom: "1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06))",
  backgroundColor: "transparent",
  gap: "var(--openui-space-s, 8px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  color: "var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1))",
  cursor: "pointer",
  textAlign: "left",
  "&:last-child": { borderBottom: "none" },
});

// Preserve the legacy declaration; browsers ignore the nonstandard `size` property.
export const iconClass = css`
  size: 16px;
`;

export const textClass = css({
  flex: 1,
  whiteSpace: "break-spaces",
  wordBreak: "break-word",
  maxWidth: "100%",
  textAlign: "left",
  color: "var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1))",
});
