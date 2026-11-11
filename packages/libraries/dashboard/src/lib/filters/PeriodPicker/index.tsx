"use client";
import {
  defineComponent,
  useIsStreaming,
  useStateField,
  type ComponentRenderProps,
} from "@openuidev/react-lang";
import { options } from "../../../components/filters/options";
import { PeriodPicker } from "../../../components/filters/PeriodPicker";
import { periodPickerPropsSchema, type PeriodPickerSchemaProps } from "./schema";
export const PeriodPickerComponent = defineComponent({
  name: "PeriodPicker",
  props: periodPickerPropsSchema,
  description:
    'Segmented control for a few date presets, e.g. [{value: "7d", label: "7D"}, {value: "30d", label: "30D"}]. Pass its $variable into query arguments (live data), or key written-in data by preset.',
  component: PeriodPickerView,
});
function PeriodPickerView({ props }: ComponentRenderProps<PeriodPickerSchemaProps>) {
  const streaming = useIsStreaming();
  const field = useStateField(props.name, props.value);
  return (
    <PeriodPicker
      {...props}
      value={field.value}
      onChange={field.setValue}
      streaming={streaming}
      options={options(props.options)}
    />
  );
}
