"use client";

import { CardHeader as OpenUICardHeader } from "@openuidev/react-components";
import { defineComponent } from "@openuidev/react-lang";
import { CardHeaderSchema } from "./schema";

export { CardHeaderSchema } from "./schema";

export const CardHeader = defineComponent({
  name: "CardHeader",
  props: CardHeaderSchema,
  description: "Header with optional title and subtitle",
  component: ({ props }) => <OpenUICardHeader title={props.title} subtitle={props.subtitle} />,
});
