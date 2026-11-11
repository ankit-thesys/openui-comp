"use client";
import { defineComponent, type ComponentRenderProps } from "@openuidev/react-lang";
import { useMemo } from "react";
import { Bars } from "../../../components/comparison/Bars";
import type { ReferenceProps, SeriesProps } from "../../../components/comparison/comparisonData";
import { nodeList } from "../../../shared/values";
import { barsPropsSchema, type BarsSchemaProps } from "./schema";

export const BarsComponent = defineComponent({
  name: "Bars",
  props: barsPropsSchema,
  description:
    'Values across categories. For periods such as weeks or months, use TimeSeries with type "bar". Horizontal (default) for long labels and rankings; vertical for short labels and ordered buckets (histograms). Several series group side by side, or stack (stacked "percent" for each part\'s share). references draw lines such as a 1.0x break-even. diverging [aboveLabel, belowLabel] colours one series by sign around zero, e.g. ["Ahead of plan", "Behind plan"].',
  component: BarsView,
});

function BarsView({ props }: ComponentRenderProps<BarsSchemaProps>) {
  const series = useMemo(() => nodeList<SeriesProps>(props.series), [props.series]);
  const references = nodeList<ReferenceProps>(props.references);
  return <Bars {...props} series={series} references={references} />;
}
