"use client";

import { Image as OpenUIImage } from "@openuidev/react-components";
import { defineComponent } from "@openuidev/react-lang";
import { ImageSchema } from "./schema";

export { ImageSchema } from "./schema";

export const Image = defineComponent({
  name: "Image",
  props: ImageSchema,
  description: "Image with alt text and optional URL",
  component: ({ props }) => (
    <OpenUIImage src={(props.src as string) || ""} alt={props.alt as string} />
  ),
});
