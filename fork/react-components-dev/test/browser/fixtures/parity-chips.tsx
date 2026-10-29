import { Chips, ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";
import { flags, mode, selector } from "./choice-parity";

const Icon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
  </svg>
);
const parts = Object.fromEntries(
  ["icon", "text"].map((part) => [
    part,
    selector(`openui-chip-item__${part}`, `openui-chips-item-${part}`),
  ]),
);

createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={mode}>
    {(["single", "multiple"] as const).flatMap((type) =>
      flags.map((disabled) => (
        <div
          key={`${type}/${disabled}`}
          data-parity-case={`${type}/${disabled}/group`}
          data-parity-parts={JSON.stringify({ group: ".openui-chips" })}
        >
          <Chips
            type={type}
            disabled={disabled}
            selected={["a", "c"]}
            items={[
              { value: "a", label: "Selected", icon: <Icon /> },
              { value: "b", label: "Other", icon: <Icon /> },
              { value: "c", label: "Selected disabled", disabled: true, icon: <Icon /> },
              { value: "d", label: "Disabled", disabled: true },
            ]}
            ref={(root) => {
              root?.querySelectorAll("button").forEach((button, i) => {
                button.dataset["parityCase"] = `${type}/${disabled}/item-${i}`;
                button.dataset["parityParts"] = JSON.stringify({ ...parts, svg: "svg" });
                button.dataset["parityProperties"] =
                  '["outline-color","outline-style","outline-width","outline-offset"]';
              });
            }}
          />
        </div>
      )),
    )}
  </ThemeProvider>,
);
