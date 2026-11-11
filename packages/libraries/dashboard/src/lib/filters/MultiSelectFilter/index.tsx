"use client";
import {
  defineComponent,
  useIsStreaming,
  useStateField,
  type ComponentRenderProps,
} from "@openuidev/react-lang";
import { MultiSelectFilter } from "../../../components/filters/MultiSelectFilter";
import { options } from "../../../components/filters/options";
import { multiSelectFilterPropsSchema, type MultiSelectFilterSchemaProps } from "./schema";
export const MultiSelectFilterComponent = defineComponent({
  name: "MultiSelectFilter",
  props: multiSelectFilterPropsSchema,
  description:
    "Dropdown with checkboxes; the value is an array of selected values ([] means all). For live data, pass its $variable into query arguments; with data written into the program, use ChipFilter or SelectFilter.",
  component: MultiSelectFilterView,
});
function MultiSelectFilterView({ props }: ComponentRenderProps<MultiSelectFilterSchemaProps>) {
  const streaming = useIsStreaming();
  const field = useStateField(props.name, props.value);
  return (
    <MultiSelectFilter
      {...props}
      value={field.value}
      onChange={field.setValue}
      streaming={streaming}
      options={options(props.options)}
    />
  );
}
