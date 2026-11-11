"use client";

import { defineComponent, type ComponentRenderProps } from "@openuidev/react-lang";
import { Stat } from "../../../components/metrics/Stat";
import { statPropsSchema, type StatSchemaProps } from "./schema";

export const StatComponent = defineComponent({
  name: "Stat",
  props: statPropsSchema,
  description: "Headline number at the top of a Card, with change vs previous.",
  component: StatView,
});

function StatView({ props }: ComponentRenderProps<StatSchemaProps>) {
  return <Stat {...props} />;
}
