import { ThemeProvider, ToggleGroup, ToggleItem } from "openui-under-test";
import { createRoot } from "react-dom/client";
import { flags, mode } from "./choice-parity";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={mode}>
    {(["single", "multiple"] as const).flatMap((type) =>
      flags.map((disabled) => (
        <ToggleGroup
          key={`${type}/${disabled}`}
          {...(type === "single" ? { type, value: "a" } : { type, value: ["a"] })}
          disabled={disabled}
          data-parity-case={`${type}/${disabled ? "disabled" : "enabled"}/group`}
        >
          {(["a", "b"] as const).map((value) => (
            <ToggleItem
              key={value}
              value={value}
              data-parity-case={`${type}/${disabled ? "disabled" : "enabled"}/${value === "a" ? "on" : "off"}`}
            >
              {value === "a" ? "Selected" : "Other"}
            </ToggleItem>
          ))}
        </ToggleGroup>
      )),
    )}
  </ThemeProvider>,
);
