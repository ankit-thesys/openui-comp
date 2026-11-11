"use client";
import { defineComponent } from "@openuidev/react-lang";
import { Donut } from "../../../components/composition/Donut";
import { donutPropsSchema } from "./schema";
export const DonutComponent = defineComponent({
  name: "Donut",
  props: donutPropsSchema,
  description:
    "Part of a whole with the total as the headline, up to 8 parts; past 8, the smallest fold into Other. For a compact strip, use SegmentedBar.",
  component: ({ props }) => <Donut {...props} />,
});
