"use client";

import { Label as OpenUILabel } from "@openuidev/react-components";
import { defineComponent } from "@openuidev/react-lang";
import { LabelSchema } from "./schema";

export { LabelSchema } from "./schema";

export const Label = defineComponent({
  name: "Label",
  props: LabelSchema,
  description: "Text label",
  component: ({ props }) => <OpenUILabel>{props.text as string}</OpenUILabel>,
});
