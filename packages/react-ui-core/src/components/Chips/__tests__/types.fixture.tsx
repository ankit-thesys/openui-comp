import {
  Calendar,
  Chips,
  DatePicker,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  SliderBlock,
  type CalendarProps,
  type ChipsItem,
  type ChipsProps,
  type DatePickerProps,
  type SelectContentProps,
  type SelectProps,
  type SliderBlockProps,
  type SliderProps,
} from "@openuidev/react-ui-core";
import React, { createRef } from "react";

const items: ChipsItem[] = [
  { value: "a", label: "Alpha", icon: <span>Icon</span>, disabled: false },
];
const chips: ChipsProps = {
  items,
  selected: ["a"],
  type: "single",
  onToggle: (value) => value.toUpperCase(),
  className: "custom",
  style: { gap: 18 },
};
const select: SelectProps = {
  size: "sm",
  defaultValue: "a",
  onValueChange: (value) => value.toUpperCase(),
};
const content: SelectContentProps = { position: "popper", sideOffset: 4, style: { zIndex: 42 } };
const slider: SliderProps = {
  variant: "discrete",
  min: 0,
  max: 100,
  step: 5,
  defaultValue: [20, 80],
  onValueChange: (values) => values.map((value) => value + 1),
  leftContent: "Min",
};
const block: SliderBlockProps = { ...slider, label: "Volume", isStreaming: false };
const calendar: CalendarProps = {
  mode: "single",
  selected: new Date(2026, 9, 15),
  onSelect: (date) => date?.getDate(),
  classNames: { root: "custom" },
  disabled: [new Date(2026, 9, 20)],
};
const picker: DatePickerProps = {
  mode: "range",
  selectedRangeDates: { from: new Date(2026, 9, 15), to: new Date(2026, 9, 20) },
  setSelectedRangeDates: (range) => range?.from?.getDate(),
  isOpen: false,
  setIsOpen: (open) => !open,
};
export const controls = (
  <>
    <Chips {...chips} ref={createRef<HTMLDivElement>()} />
    <Select {...select}>
      <SelectTrigger ref={createRef<HTMLButtonElement>()}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent {...content}>
        <SelectItem value="a" showTick textValue="First">
          Alpha
        </SelectItem>
      </SelectContent>
    </Select>
    <Slider {...slider} ref={createRef<React.ComponentRef<typeof Slider>>()} />
    <SliderBlock {...block} />
    <Calendar {...calendar} ref={createRef<HTMLDivElement>()} />
    <DatePicker {...picker} />
  </>
);
// @ts-expect-error no new styling API
export const invalidChips: ChipsProps = { items, sx: { color: "red" } };
// @ts-expect-error preserve the existing size names
export const invalidSelect: SelectProps = { size: "small" };
