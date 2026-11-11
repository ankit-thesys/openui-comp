"use client";
import { defineComponent, type ComponentRenderProps } from "@openuidev/react-lang";
import { Scatter } from "../../../components/relationships/Scatter";
import { nodeList } from "../../../shared/values";
import type { ReferenceProps } from "../../../trends/charts";
import { scatterPropsSchema, type ScatterSchemaProps } from "./schema";
export const ScatterComponent = defineComponent({
  name: "Scatter",
  props: scatterPropsSchema,
  description:
    'Two measures per item, e.g. campaigns by spend and ROAS sized by signups (sizeLabel names the size, e.g. "Signups"). Up to 8 groups, each with its own colour and shape; past eight, the smallest fold into Other. A point with a null x or y isn\'t drawn and is named under the chart. Up to 10 points label themselves. references draw targets or averages: Reference("Avg spend", 12000, "x") is vertical, a y reference horizontal; together they split the plot into quadrants.',
  component: function ScatterView({ props }: ComponentRenderProps<ScatterSchemaProps>) {
    return <Scatter {...props} references={nodeList<ReferenceProps>(props.references)} />;
  },
});
