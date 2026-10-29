// Both the group layout and each item's owned parts, in every checked/disabled combination.
import { CheckBoxGroup, CheckBoxItem, ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";
import { ChoiceCase, flags, mode, selector, variants } from "./choice-parity";

const parts = {
  indicator: selector("openui-checkbox-item-indicator", "openui-check-box-item-indicator"),
  icon: selector("openui-checkbox-item-indicator svg", "openui-check-box-item-icon"),
  check: selector("openui-checkbox-item-indicator path", "openui-check-box-item-check"),
  content: selector("openui-checkbox-item-content", "openui-check-box-item-content"),
  label: selector("openui-checkbox-item-label", "openui-check-box-item-label"),
  description: selector("openui-checkbox-item-description", "openui-check-box-item-description"),
  container: selector("openui-checkbox-item-container", "openui-check-box-item-container"),
};
const controlParts = { indicator: parts.indicator, icon: parts.icon, check: parts.check };

createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={mode}>
    {variants.map((variant) => (
      <div
        key={variant}
        style={{ width: 280 }}
        data-parity-case={`${variant}/group`}
        data-parity-parts={JSON.stringify({
          group: selector("openui-checkbox-group", "openui-check-box-group"),
        })}
      >
        <CheckBoxGroup variant={variant}>
          <CheckBoxItem checked label="Selected" description="Details" />
          <CheckBoxItem label="Other" />
        </CheckBoxGroup>
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
          <CheckBoxItem
            checked={checked}
            disabled={disabled}
            label="Choice"
            description="Details"
          />
        </ChoiceCase>
      )),
    )}
  </ThemeProvider>,
);
