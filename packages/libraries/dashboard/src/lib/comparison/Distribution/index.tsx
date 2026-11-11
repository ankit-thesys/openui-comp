"use client";
import { defineComponent, type ComponentRenderProps } from "@openuidev/react-lang";
import { Distribution } from "../../../components/comparison/Distribution";
import { distributionPropsSchema, type DistributionSchemaProps } from "./schema";

export const DistributionComponent = defineComponent({
  name: "Distribution",
  props: distributionPropsSchema,
  description:
    "Spread, not just the average: one box plot per category: whiskers min to max, box the middle 50% (q1 to q3), line the median. For latency, order value, session length, deal size.",
  component: DistributionView,
});

function DistributionView({ props }: ComponentRenderProps<DistributionSchemaProps>) {
  return <Distribution {...props} />;
}
