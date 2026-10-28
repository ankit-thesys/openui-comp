// Both the group layout and each item's owned parts, in every checked/disabled combination.
import { RadioGroup, RadioItem, ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";
import { ChoiceCase, flags, mode, selector, variants } from "./choice-parity";

const parts = {
  svg: selector("openui-radio-item-svg", "openui-radio-item-svg"),
  path: selector("openui-radio-item-svg-path", "openui-radio-item-path"),
  border: selector("openui-radio-item-svg-border", "openui-radio-item-border"),
  inner: selector("openui-radio-item-svg-inner", "openui-radio-item-inner"),
  content: selector("openui-radio-item-content", "openui-radio-item-content"),
  label: selector("openui-radio-item-label", "openui-radio-item-label"),
  description: selector("openui-radio-item-description", "openui-radio-item-description"),
  container: ".openui-radio-item-container",
};
const controlParts = { svg: parts.svg, path: parts.path, border: parts.border, inner: parts.inner };

createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={mode}>
    {variants.map((variant) => (
      <div
        key={variant}
        style={{ width: 280 }}
        data-parity-case={`${variant}/group`}
        data-parity-parts={JSON.stringify({
          group: selector("openui-radio-group", "openui-radio-group"),
        })}
      >
        <RadioGroup variant={variant} value="a">
          <RadioItem value="a" label="Selected" description="Details" />
          <RadioItem value="b" label="Other" />
        </RadioGroup>
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
          <RadioGroup value={checked ? "a" : "other"}>
            <RadioItem value="a" disabled={disabled} label="Choice" description="Details" />
          </RadioGroup>
        </ChoiceCase>
      )),
    )}
  </ThemeProvider>,
);
