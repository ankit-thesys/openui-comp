"use client";

import { Separator as OpenUISeparator } from "@openuidev/react-components";
import { defineComponent } from "@openuidev/react-lang";
import { SeparatorSchema } from "./schema";

export * from "./schema";

export const Separator = defineComponent({
  name: "Separator",
  props: SeparatorSchema,
  description: "Visual divider between content sections",
  component: ({ props }) => (
    <OpenUISeparator
      orientation={props.orientation as "horizontal" | "vertical" | undefined}
      decorative={props.decorative as boolean | undefined}
    />
  ),
});
