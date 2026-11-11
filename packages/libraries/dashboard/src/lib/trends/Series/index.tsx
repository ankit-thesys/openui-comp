import { defineComponent } from "@openuidev/react-lang";
import { seriesPropsSchema } from "./schema";

export const SeriesComponent = defineComponent({
  name: "Series",
  props: seriesPropsSchema,
  description:
    'One series; previous is the same points for the previous period. Use null for gaps. mark overrides the chart type to mix bars and a line in the same unit, e.g. Series("7-day average", avg, null, "line"). lows/highs shade a band such as a 95% interval: Series("Lift", lift, null, "line", lower, upper).',
  component: () => null,
});
