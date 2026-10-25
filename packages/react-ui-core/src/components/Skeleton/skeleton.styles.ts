import type { CSSAttribute } from "goober";
import { skeletonPulse } from "./skeletonPulse";
export const barStyles = {
  backgroundColor: "var(--openui-elevated, oklch(0.097 0 0 / 0.08))",
  borderRadius: "var(--openui-radius-s, 6px)",
  animation: `${skeletonPulse} 1.2s ease-in-out infinite`,
} satisfies CSSAttribute;
export const stackStyles = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--openui-space-s, 8px)",
} satisfies CSSAttribute;
