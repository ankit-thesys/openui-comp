"use client";

import { defineComponent, type ComponentRenderProps } from "@openuidev/react-lang";
import { TextBlockView } from "../../../components/TextBlockView";
import { textBlockPropsSchema, type TextBlockProps } from "./schema";
function TextBlockRenderer({ props }: ComponentRenderProps<TextBlockProps>) {
  return <TextBlockView {...props} />;
}

export const TextBlockComponent = defineComponent({
  name: "TextBlock",
  props: textBlockPropsSchema,
  description: "",
  component: TextBlockRenderer,
});

export type { TextBlockProps } from "./schema";
