import { z } from "zod/v4";
import { formatSchema } from "../../../shared/format";
export const segmentedBarPropsSchema = z.object({
  labels: z.array(z.string()),
  values: z.array(z.number()),
  format: formatSchema.optional(),
});
export type SegmentedBarSchemaProps = z.infer<typeof segmentedBarPropsSchema>;
