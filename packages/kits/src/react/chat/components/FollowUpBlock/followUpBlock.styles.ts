import { css } from "goober";

export const rootClass = css({
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
});

export const headerClass = css({
  color: "var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6))",
  borderBottom: "1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06))",
  paddingTop: "var(--openui-space-s, 8px)",
  paddingBottom: "var(--openui-space-s, 8px)",
  marginBottom: "var(--openui-space-m, 12px)",
});
