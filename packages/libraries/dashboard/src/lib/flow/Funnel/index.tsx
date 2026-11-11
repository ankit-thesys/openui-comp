"use client";
import { defineComponent } from "@openuidev/react-lang";
import { Funnel } from "../../../components/flow/Funnel";
import { nodeList } from "../../../shared/values";
import { funnelPropsSchema } from "./schema";
export const FunnelComponent = defineComponent({
  name: "Funnel",
  props: funnelPropsSchema,
  description:
    'Ordered conversion steps, scaled to the first step, with step-to-step conversion and drop-off; the weakest step is flagged. A switch reads the rates step to step or from the start; basis "start" opens on the second. segments splits each step by plan, channel or cohort: Series("Enterprise", [...]) per segment, one value per step, summing to values (up to 8); like stacked Bars, a split funnel doesn\'t draw previous. shape "bars" (default) lists the steps as rows; "funnel" draws a left-to-right funnel whose height follows each step (it falls back to bars when the card is too narrow, under about 100px per step).',
  component: ({ props }) => (
    <Funnel
      {...props}
      segments={nodeList<{ name: string; values: (number | null)[] }>(props.segments)}
    />
  ),
});
