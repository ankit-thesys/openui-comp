import * as core from "@openuidev/react-ui-core";
import assert from "node:assert/strict";
import test from "node:test";

test("core exposes extracted controls through the public root", () => {
  for (const name of [
    "Button",
    "Input",
    "TextArea",
    "Buttons",
    "IconButton",
    "Label",
    "FormControl",
    "Hint",
    "CheckBoxGroup",
    "CheckBoxItem",
    "RadioGroup",
    "RadioItem",
    "SwitchGroup",
    "SwitchItem",
    "ToggleGroup",
    "ToggleItem",
    "Calendar",
    "DatePicker",
    "Select",
    "SelectTrigger",
    "SelectContent",
    "SelectGroup",
    "SelectLabel",
    "SelectItem",
    "SelectSeparator",
    "SelectValue",
    "Slider",
    "SliderBlock",
    "Chips",
    "LayoutContext",
    "LayoutContextProvider",
    "useLayoutContext",
  ])
    assert(core[name], `Missing root component: ${name}`);
  assert.equal("FormControlProvider" in core, false);
  assert.equal("useFormControlContext" in core, false);
});
