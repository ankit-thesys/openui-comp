// Both the group layout and each item's owned parts, in every checked/disabled combination.
import { SwitchGroup, SwitchItem, ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";
import { ChoiceCase, flags, mode, selector, variants } from "./choice-parity";

const parts = {
  thumb: selector("openui-switch-item-thumb", "openui-switch-item-thumb"),
  content: selector("openui-switch-item-content", "openui-switch-item-content"),
  label: selector("openui-switch-item-label", "openui-switch-item-label"),
  description: selector("openui-switch-item-description", "openui-switch-item-description"),
  container: ".openui-switch-item-container",
};
const controlParts = { thumb: parts.thumb };

createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={mode}>
    {variants.map((variant) => (
      <div
        key={variant}
        style={{ width: 280 }}
        data-parity-case={`${variant}/group`}
        data-parity-parts={JSON.stringify({
          group: selector("openui-switch-group", "openui-switch-group"),
        })}
      >
        <SwitchGroup variant={variant}>
          <SwitchItem checked label="Selected" description="Details" />
          <SwitchItem label="Other" />
        </SwitchGroup>
      </div>
    ))}
    {flags.flatMap((checked) =>
      flags.map((disabled) => (
        <ChoiceCase
          key={`${checked}/${disabled}`}
          id={`${checked ? "checked" : "unchecked"}/${disabled ? "disabled" : "enabled"}`}
          parts={parts}
          controlParts={controlParts}
        >
          <SwitchItem checked={checked} disabled={disabled} label="Choice" description="Details" />
        </ChoiceCase>
      )),
    )}
  </ThemeProvider>,
);
