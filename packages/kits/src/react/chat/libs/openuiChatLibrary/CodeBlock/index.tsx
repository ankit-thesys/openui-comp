"use client";

import { defineComponent } from "@openuidev/react-lang";
import { CodeBlock as OpenUICodeBlock } from "@openuidev/react-ui-core";
import { CodeBlockSchema } from "./schema";

export { CodeBlockSchema } from "./schema";

export const CodeBlock = defineComponent({
  name: "CodeBlock",
  props: CodeBlockSchema,
  description: "Syntax-highlighted code block",
  component: ({ props }) => (
    <OpenUICodeBlock language={props.language as string} codeString={props.codeString as string} />
  ),
});
