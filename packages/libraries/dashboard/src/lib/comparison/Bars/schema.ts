import { z } from "zod/v4";
import { stackedSchema } from "../../../shared/chartHelpers";
import { formatSchema } from "../../../shared/format";
import { goodWhenSchema } from "../../../shared/schema";
import { Reference, Series } from "../../../trends/charts";

export const barsPropsSchema = z.object({
  labels: z.array(z.string()),
  series: z.array(Series.ref),
  format: formatSchema.optional(),
  orientation: z.enum(["vertical", "horizontal"]).optional(),
  stacked: stackedSchema.optional(),
  goodWhen: goodWhenSchema.optional(),
  references: z.array(Reference.ref).optional(),
  diverging: z.array(z.string()).optional(),
});
export type BarsSchemaProps = z.infer<typeof barsPropsSchema>;
