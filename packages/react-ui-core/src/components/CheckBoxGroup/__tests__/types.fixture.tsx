import {
  Buttons,
  CheckBoxGroup,
  CheckBoxItem,
  FormControl,
  Hint,
  IconButton,
  Label,
  LayoutContextProvider,
  RadioGroup,
  RadioItem,
  SwitchGroup,
  SwitchItem,
  ToggleGroup,
  ToggleItem,
  useLayoutContext,
  type ButtonsProps,
  type CheckBoxGroupProps,
  type CheckBoxItemProps,
  type FormControlProps,
  type HintProps,
  type IconButtonProps,
  type LabelProps,
  type RadioGroupProps,
  type RadioItemProps,
  type SwitchGroupProps,
  type SwitchItemProps,
  type ToggleGroupProps,
  type ToggleItemProps,
} from "@openuidev/react-ui-core";
import { createRef } from "react";
const buttonRef = createRef<HTMLButtonElement>();
const labelRef = createRef<HTMLLabelElement>();
const divRef = createRef<HTMLDivElement>();
const icon: IconButtonProps = {
  icon: <svg />,
  asChild: true,
  size: "3-extra-small",
  shape: "circle",
  appearance: "destructive",
  type: "button",
  style: { padding: 3 },
};
const checkbox: CheckBoxItemProps = {
  checked: true,
  onChange: (v) => v.valueOf(),
  label: "Check",
  required: true,
  name: "check",
};
const radio: RadioItemProps = { value: "a", label: "Radio" };
const toggle: ToggleItemProps = { value: "a", children: "Toggle" };
const switchItem: SwitchItemProps = {
  checked: false,
  onChange: (v) => v.valueOf(),
  label: "Switch",
};
const label: LabelProps = { children: "Label", htmlFor: "field", required: true };
const hint: HintProps = { children: "Hint", hasError: true, role: "alert" };
const form: FormControlProps = { children: <Hint {...hint} />, hasError: true };
const checks: CheckBoxGroupProps = { children: <CheckBoxItem {...checkbox} />, variant: "card" };
const radios: RadioGroupProps = {
  children: <RadioItem {...radio} />,
  value: "a",
  onValueChange: (v) => v.toUpperCase(),
  orientation: "horizontal",
};
const switches: SwitchGroupProps = { children: <SwitchItem {...switchItem} />, variant: "sunk" };
const toggles: ToggleGroupProps = {
  type: "multiple",
  children: <ToggleItem {...toggle} />,
  value: ["a"],
  onValueChange: (v) => v.map((x) => x.toUpperCase()),
};
const buttons: ButtonsProps = { children: <IconButton {...icon} />, variant: "vertical" };
export const forms = (
  <LayoutContextProvider layout="mobile">
    <Buttons {...buttons} ref={divRef} />
    <Label {...label} ref={labelRef} />
    <FormControl {...form} ref={divRef} />
    <CheckBoxGroup {...checks} />
    <CheckBoxItem {...checkbox} ref={buttonRef} />
    <RadioGroup {...radios} />
    <RadioItem {...radio} ref={buttonRef} />
    <SwitchGroup {...switches} />
    <SwitchItem {...switchItem} ref={buttonRef} />
    <ToggleGroup {...toggles} />
    <ToggleItem {...toggle} />
  </LayoutContextProvider>
);
export function LayoutConsumer() {
  return <div>{useLayoutContext().layout}</div>;
}
// @ts-expect-error Extraction introduces no sx API.
export const noSx = <IconButton icon={<svg />} sx={{ padding: 3 }} />;
