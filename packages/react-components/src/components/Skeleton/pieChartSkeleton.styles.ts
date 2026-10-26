import type { CSSAttribute } from "goober";
import { skeletonPulse } from "./skeletonPulse";
export const pieStyles = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--openui-space-m, 12px)",
  padding: "var(--openui-space-m, 12px)",
  "& .openui-skeleton-pie-chart-container": {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  "& .openui-skeleton-pie-chart-shape": {
    borderRadius: "50%",
    backgroundColor: "var(--openui-elevated-strong, oklch(0.097 0 0 / 0.16))",
    animation: `${skeletonPulse} 1.2s ease-in-out infinite`,
  },
  "& .openui-skeleton-pie-chart-donut": {
    backgroundColor: "transparent",
    border:
      "var(--openui-space-xl, 24px) solid var(--openui-elevated-strong, oklch(0.097 0 0 / 0.16))",
  },
  "& .openui-skeleton-pie-chart-semi": {
    borderRadius: "var(--openui-radius-full, 9999px) var(--openui-radius-full, 9999px) 0 0",
  },
  "& .openui-skeleton-pie-chart-semi-donut": {
    backgroundColor: "transparent",
    border:
      "var(--openui-space-xl, 24px) solid var(--openui-elevated-strong, oklch(0.097 0 0 / 0.16))",
    borderBottom: 0,
    borderRadius: "var(--openui-radius-full, 9999px) var(--openui-radius-full, 9999px) 0 0",
  },
  "& .openui-skeleton-pie-chart-legend": {
    display: "flex",
    flexDirection: "column",
    gap: "var(--openui-space-s, 8px)",
    minWidth: "120px",
  },
  "& .openui-skeleton-pie-chart-legend-item": {
    display: "flex",
    alignItems: "center",
    gap: "var(--openui-space-s, 8px)",
  },
  "& .openui-skeleton-pie-chart-legend-dot": {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: "var(--openui-elevated-strong, oklch(0.097 0 0 / 0.16))",
    animation: `${skeletonPulse} 1.2s ease-in-out infinite`,
    flexShrink: 0,
  },
} satisfies CSSAttribute;
