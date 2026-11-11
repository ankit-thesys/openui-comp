import { z } from "zod/v4";
import { formatSchema } from "../../../shared/format";
export const donutPropsSchema = z.object({
  labels: z.array(z.string()),
  values: z.array(z.number()),
  format: formatSchema.optional(),
  centerLabel: z.string().optional(),
});
export type DonutSchemaProps = z.infer<typeof donutPropsSchema>;
