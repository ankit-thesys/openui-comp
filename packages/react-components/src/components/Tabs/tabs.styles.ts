import type { StyleCss } from "../../styles/useStyles";

/** Tabs' stable classes: the public override targets. */
export const names = {
  root: "openui-tabs",
  variant: {
    clear: "openui-tabs--variant-clear",
  },
} as const;

// `clear` is the only variant and is always applied: its rules live in each part's base styles, so
// `names.variant.clear` only marks the look for consumers and has no rules of its own.
export const tabsStyles = (css: StyleCss) => ({
  root: css`
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: var(--openui-space-l, 18px);
  `,
});
