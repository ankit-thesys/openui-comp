import { skeletonPulse } from "./skeletonPulse";
export const barStyles = `
  background-color: var(--openui-elevated, oklch(0.097 0 0 / 0.08));
  border-radius: var(--openui-radius-s, 6px);
  animation: ${skeletonPulse} 1.2s ease-in-out infinite;
`;
export const stackStyles = `
  display: flex;
  flex-direction: column;
  gap: var(--openui-space-s, 8px);
`;
