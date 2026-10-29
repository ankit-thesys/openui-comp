import type { StyleCss } from "../../styles/useStyles";

export const names = { root: "openui-skeleton-pulse" } as const;

// Keep the animation and its keyframes together: no registration until an animated part
// renders, in the same cascade layer as that part. The keyframe name is private.
export const skeletonPulseStyles = (css: StyleCss) => ({
  root: css`
    animation: _openui-skeleton-pulse 1.2s ease-in-out infinite;
    @keyframes _openui-skeleton-pulse {
      0% {
        opacity: 0.3;
      }
      50% {
        opacity: 0.85;
      }
      100% {
        opacity: 0.3;
      }
    }
  `,
});
