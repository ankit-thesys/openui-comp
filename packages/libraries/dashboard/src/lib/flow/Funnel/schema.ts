import { z } from "zod/v4";
import { formatSchema } from "../../../shared/format";
import { Series } from "../../../trends/charts";
export const funnelPropsSchema = z.object({
  steps: z.array(z.string()),
  values: z.array(z.number()),
  previous: z.array(z.number()).optional(),
  format: formatSchema.optional(),
  shape: z.enum(["bars", "funnel"]).optional(),
  segments: z.array(Series.ref).optional(),
  basis: z.enum(["step", "start"]).optional(),
});
export type FunnelSchemaProps = z.infer<typeof funnelPropsSchema>;
