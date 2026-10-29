import {
  CheckBoxGroup,
  CheckBoxItem,
  Chips,
  RadioGroup,
  RadioItem,
  SwitchGroup,
  SwitchItem,
  ToggleGroup,
  ToggleItem,
} from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";

it("exposes checkbox group defaults and independently styled item parts", () => {
  const html = renderToString(
    <CheckBoxGroup>
      <CheckBoxItem checked label="Choice" description="Details" className="consumer" />
    </CheckBoxGroup>,
  );
  expect(html).toContain("openui-check-box-group--variant-clear");
  expect(html).toMatch(/class="[^"]*openui-check-box-item [^"]*consumer/);
  expect(html).toContain("openui-check-box-item-icon");
  expect(html).toContain('data-state="checked"');
  expect(html).not.toContain("openui-checkbox-");
});

it("exposes radio controls and each owned SVG part without legacy root aliases", () => {
  const html = renderToString(
    <RadioGroup defaultValue="a">
      <RadioItem value="a" label="Choice" description="Details" className="consumer" />
    </RadioGroup>,
  );
  expect(html).toContain("openui-radio-group--variant-clear");
  expect(html).toMatch(/class="[^"]*openui-radio-item [^"]*consumer/);
  expect(html).toContain("openui-radio-item-path");
  expect(html).not.toContain("openui-radio-item-root");
});

it("exposes switch defaults and a thumb whose state follows its control", () => {
  const html = renderToString(
    <SwitchGroup>
      <SwitchItem checked label="Choice" className="consumer" />
    </SwitchGroup>,
  );
  expect(html).toContain("openui-switch-group--variant-clear");
  expect(html).toMatch(/class="[^"]*openui-switch-item [^"]*consumer/);
  expect(html).toMatch(/data-state="checked" class="[^"]*openui-switch-item-thumb/);
  expect(html).not.toContain("openui-switch-item-root");
});

it("exposes toggle group and item classes while keeping on/off as Radix states", () => {
  const html = renderToString(
    <ToggleGroup type="single" defaultValue="a">
      <ToggleItem value="a">Choice</ToggleItem>
    </ToggleGroup>,
  );
  expect(html).toMatch(/class="[^"]*openui-toggle-group"/);
  expect(html).toMatch(/class="[^"]*openui-toggle-item"/);
  expect(html).toContain('data-state="on"');
  expect(html).not.toContain("openui-toggle-item-root");
});

it("exposes chip parts with selected and disabled attributes instead of state classes", () => {
  const html = renderToString(
    <Chips
      selected={["a"]}
      items={[
        { value: "a", label: "Selected", icon: <svg /> },
        { value: "b", label: "Disabled", disabled: true },
      ]}
    />,
  );
  expect(html).toContain("openui-chips-item-icon");
  expect(html).toContain("openui-chips-item-text");
  expect(html).toContain('aria-selected="true"');
  expect(html).not.toContain("--selected");
  expect(html).not.toContain("--disabled");
  expect(html).not.toContain("openui-chips-root");
});
