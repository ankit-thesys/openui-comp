import { z } from "zod/v4";

/** How much of a Row a card takes, on a 12-column grid. Narrow screens stack. */
export const WIDTHS = ["quarter", "third", "half", "two-thirds", "three-quarters", "full"] as const;
export const widthSchema = z.enum(WIDTHS);
export type Width = z.infer<typeof widthSchema>;

export const widthClass = (width: Width | undefined | null, fallback: Width) =>
  `openui-dashboard-w-${width ?? fallback}`;
