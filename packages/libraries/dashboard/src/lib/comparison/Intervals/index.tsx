"use client";
import { defineComponent, type ComponentRenderProps } from "@openuidev/react-lang";
import { Intervals } from "../../../components/comparison/Intervals";
import { intervalsPropsSchema, type IntervalsSchemaProps } from "./schema";

export const IntervalsComponent = defineComponent({
  name: "Intervals",
  props: intervalsPropsSchema,
  description:
    'Estimates with confidence intervals (forest plot), e.g. experiment lift. An interval clear of the baseline (default 0) is a clear effect: green when better, red when worse, by goodWhen (default "up"; "neutral" colours both sides alike). Intervals that cross the baseline stay grey.',
  component: IntervalsView,
});

function IntervalsView({ props }: ComponentRenderProps<IntervalsSchemaProps>) {
  return <Intervals {...props} />;
}
