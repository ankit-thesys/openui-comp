import { defineComponent } from "@openuidev/react-lang";
import { referencePropsSchema } from "./schema";

export const ReferenceComponent = defineComponent({
  name: "Reference",
  props: referencePropsSchema,
  description:
    'A target or SLO line: Reference("Target", 99.5). axis "x" draws a vertical line (Scatter only), e.g. an average on the x measure.',
  component: () => null,
});
