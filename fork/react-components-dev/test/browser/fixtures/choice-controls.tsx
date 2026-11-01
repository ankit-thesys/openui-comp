import {
  CheckBoxGroup,
  CheckBoxItem,
  Chips,
  configureStyles,
  RadioGroup,
  RadioItem,
  SwitchGroup,
  SwitchItem,
  ThemeProvider,
  ToggleGroup,
  ToggleItem,
} from "openui-under-test";
import { useState } from "react";
import { createRoot } from "react-dom/client";

const params = new URLSearchParams(location.search);
configureStyles({ layer: params.has("layer") ? "openui" : undefined });
const disabled = params.has("disabled");
const Icon = () => (
  <svg width="24" height="24">
    <circle cx="12" cy="12" r="10" />
  </svg>
);

function Choices() {
  const [checkbox, setCheckbox] = useState(true);
  const [radio, setRadio] = useState("a");
  const [switchValue, setSwitch] = useState(true);
  const [toggle, setToggle] = useState("a");
  const [selected, setSelected] = useState(["a"]);
  return (
    <ThemeProvider>
      <section data-testid="check-box">
        <CheckBoxGroup variant="card" className="consumer-group">
          <CheckBoxItem
            checked={checkbox}
            onChange={setCheckbox}
            disabled={disabled}
            label="Check"
            description="Details"
            className="consumer-control"
          />
          <CheckBoxItem checked={false} label="Unchecked" />
        </CheckBoxGroup>
      </section>
      <section data-testid="radio">
        <RadioGroup
          variant="card"
          value={radio}
          onValueChange={setRadio}
          className="consumer-group"
        >
          <RadioItem
            value="a"
            disabled={disabled}
            label="Radio"
            description="Details"
            className="consumer-control"
          />
          <RadioItem value="b" label="Unchecked" />
        </RadioGroup>
      </section>
      <section data-testid="switch">
        <SwitchGroup variant="card" className="consumer-group">
          <SwitchItem
            checked={switchValue}
            onChange={setSwitch}
            disabled={disabled}
            label="Switch"
            description="Details"
            className="consumer-control"
          />
          <SwitchItem checked={false} label="Unchecked" />
        </SwitchGroup>
      </section>
      <section data-testid="toggle">
        <ToggleGroup
          type="single"
          value={toggle}
          onValueChange={setToggle}
          className="consumer-group"
        >
          <ToggleItem value="a" disabled={disabled} className="consumer-control">
            Toggle
          </ToggleItem>
          <ToggleItem value="b">Unchecked</ToggleItem>
        </ToggleGroup>
      </section>
      <section data-testid="chips">
        <Chips
          disabled={disabled}
          selected={selected}
          onToggle={(value) =>
            setSelected((values) =>
              values.includes(value) ? values.filter((v) => v !== value) : [...values, value],
            )
          }
          items={[
            { value: "a", label: "Chip", icon: <Icon /> },
            { value: "b", label: "Unchecked" },
          ]}
        />
      </section>
    </ThemeProvider>
  );
}

const mount = () => createRoot(document.getElementById("root")!).render(<Choices />);
if (params.has("lazy")) window.mountFixture = mount;
else mount();
