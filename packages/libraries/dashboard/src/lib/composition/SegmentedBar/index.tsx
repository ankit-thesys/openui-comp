"use client";
import { defineComponent } from "@openuidev/react-lang";
import { SegmentedBar } from "../../../components/composition/SegmentedBar";
import { segmentedBarPropsSchema } from "./schema";
export const SegmentedBarComponent = defineComponent({
  name: "SegmentedBar",
  props: segmentedBarPropsSchema,
  description:
    "Part of a whole as one bar with a legend of values and shares; up to 8 parts. Inside a headline tile, use Kpi split instead.",
  component: ({ props }) => <SegmentedBar {...props} />,
});
