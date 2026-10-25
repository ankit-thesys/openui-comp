import { css, keyframes } from "goober";

export const rootClass = css({
  minWidth: 0,
  "& .openui-model-switcher-trigger": {
    display: "flex",
    height: "32px",
    width: "auto",
    maxWidth: "240px",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: "var(--openui-space-xs, 6px)",
    border: "none",
    borderRadius: "var(--openui-radius-full, 9999px)",
    backgroundColor: "var(--openui-highlight, oklch(0.097 0 0 / 0.04))",
    padding: "0 var(--openui-space-m, 12px)",
    color: "var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1))",
    boxShadow: "none",
    fontSize: "12px",
    fontWeight: 400,
    fontVariationSettings: 'var(--openui-font-variation-regular, "wght" 440)',
    lineHeight: "12px",
    '&:hover, &[data-state="open"]': {
      backgroundColor: "var(--openui-highlight-strong, oklch(0.097 0 0 / 0.08))",
      color: "var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1))",
    },
    "& .openui-model-switcher-logo": { width: "14px", height: "14px" },
    "& .openui-model-switcher-badge-trigger": { display: "none" },
    "& .openui-select-trigger-icon": {
      width: "12px",
      height: "12px",
      flexShrink: 0,
      opacity: 0.4,
    },
  },
});

// Select portals render outside the trigger container, so these classes travel with their nodes.
export const contentClass = css({
  "&.openui-select-content": {
    maxHeight: "calc(var(--radix-select-content-available-height, 376px) - 6px)",
    width: "min(283px, calc(100vw - 32px))",
    overflow: "auto",
  },
});

export const rowClass = css({
  "& .openui-tag.openui-tag-sm": {
    height: "18px",
    padding: "0 var(--openui-space-s, 8px)",
    borderRadius: "var(--openui-radius-full, 9999px)",
    flexShrink: 0,
    "& .openui-tag-text": { fontSize: "11px", lineHeight: "18px" },
  },
  display: "flex",
  width: "100%",
  minWidth: 0,
  alignItems: "center",
  gap: "var(--openui-space-xs, 6px)",
});

export const nameClass = css({
  minWidth: 0,
  flex: "1 1 auto",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const logoClass = css({
  display: "inline-flex",
  width: "16px",
  height: "16px",
  flexShrink: 0,
  alignItems: "center",
  justifyContent: "center",
  "& > *": { display: "block", width: "100%", height: "100%", objectFit: "contain" },
});

export const dotClass = css({ height: "6px", width: "6px", flexShrink: 0, borderRadius: "9999px" });
export const dotKindClasses = {
  recommended: css({
    backgroundColor: "var(--openui-border-info-emphasis, oklch(0.546 0.215 262.881 / 1))",
  }),
  badge: css({
    backgroundColor: "var(--openui-border-success-emphasis, oklch(0.627 0.17 149.214 / 1))",
  }),
};

export const badgeTriggerClass = css({
  display: "inline-flex",
  height: "20px",
  width: "20px",
  flexShrink: 0,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "9999px",
  border: "1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06))",
});

const pulse = keyframes({ "0%,100%": { opacity: 1 }, "50%": { opacity: 0.5 } });
export const skeletonDotClass = css({
  height: "20px",
  width: "20px",
  flexShrink: 0,
  borderRadius: "var(--openui-radius-m, 8px)",
  backgroundColor: "var(--openui-border-default, oklch(0.097 0 0 / 0.06))",
  animation: `${pulse} 1.5s ease-in-out infinite`,
});
export const skeletonBarClass = css({
  height: "16px",
  width: "96px",
  borderRadius: "var(--openui-radius-m, 8px)",
  backgroundColor: "var(--openui-border-default, oklch(0.097 0 0 / 0.06))",
  animation: `${pulse} 1.5s ease-in-out infinite`,
});

export const srClass = css({
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
});
