import { skeletonPulse } from "./skeletonPulse";
export const pieStyles = `
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--openui-space-m, 12px);
  padding: var(--openui-space-m, 12px);
  & .openui-skeleton-pie-chart-container {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  & .openui-skeleton-pie-chart-shape {
    border-radius: 50%;
    background-color: var(--openui-elevated-strong, oklch(0.097 0 0 / 0.16));
    animation: ${skeletonPulse} 1.2s ease-in-out infinite;
  }
  & .openui-skeleton-pie-chart-donut {
    background-color: transparent;
    border: var(--openui-space-xl, 24px) solid var(--openui-elevated-strong, oklch(0.097 0 0 / 0.16));
  }
  & .openui-skeleton-pie-chart-semi {
    border-radius: var(--openui-radius-full, 9999px) var(--openui-radius-full, 9999px) 0 0;
  }
  & .openui-skeleton-pie-chart-semi-donut {
    background-color: transparent;
    border: var(--openui-space-xl, 24px) solid var(--openui-elevated-strong, oklch(0.097 0 0 / 0.16));
    border-bottom: 0;
    border-radius: var(--openui-radius-full, 9999px) var(--openui-radius-full, 9999px) 0 0;
  }
  & .openui-skeleton-pie-chart-legend {
    display: flex;
    flex-direction: column;
    gap: var(--openui-space-s, 8px);
    min-width: 120px;
  }
  & .openui-skeleton-pie-chart-legend-item {
    display: flex;
    align-items: center;
    gap: var(--openui-space-s, 8px);
  }
  & .openui-skeleton-pie-chart-legend-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: var(--openui-elevated-strong, oklch(0.097 0 0 / 0.16));
    animation: ${skeletonPulse} 1.2s ease-in-out infinite;
    flex-shrink: 0;
  }
`;
