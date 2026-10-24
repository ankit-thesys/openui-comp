import * as Core from "@openuidev/react-ui-core";
import { useState } from "react";
import { createRoot } from "react-dom/client";
function App() {
  const [disabled, setDisabled] = useState(false),
    [mode, setMode] = useState("none"),
    [overrides, setOverrides] = useState(false),
    [visible, setVisible] = useState(true),
    [variant, setVariant] = useState("clear");
  Object.assign(window, { setDisabled, setMode, setOverrides, setVisible, setVariant });
  const framework = new URLSearchParams(location.search).get("framework");
  const className = overrides
    ? framework === "tailwind3"
      ? "!bg-red-500 !text-white !p-8 !rounded-none !border-0 hover:!bg-green-500 disabled:!bg-gray-500 disabled:!cursor-wait"
      : framework === "tailwind4"
        ? "bg-red-500! text-white! p-8! rounded-none! border-0! hover:bg-green-500! disabled:bg-gray-500! disabled:cursor-wait!"
        : "explicit"
    : undefined;
  const body = (
    <div id="zone">
      <Core.Buttons variant="horizontal">
        <Core.Button disabled={disabled}>Save</Core.Button>
        <Core.IconButton
          id="icon-target"
          icon={
            <svg viewBox="0 0 10 10">
              <path d="M0 0h10v10H0z" />
            </svg>
          }
          disabled={disabled}
          className={className}
          aria-label="Action"
        />
      </Core.Buttons>
      <Core.Buttons variant="vertical">
        <Core.Button>Other</Core.Button>
      </Core.Buttons>
      {(["primary", "secondary", "tertiary"] as const).map((v) => (
        <Core.IconButton
          key={v}
          variant={v}
          appearance="destructive"
          disabled={disabled}
          icon={<svg />}
          aria-label={v}
        />
      ))}
      {(["3-extra-small", "2-extra-small", "extra-small", "small", "medium", "large"] as const).map(
        (size) => (
          <Core.IconButton
            key={size}
            size={size}
            shape="square"
            disabled={disabled}
            icon={<svg />}
            aria-label={size}
          />
        ),
      )}
      <Core.IconButton shape="circle" disabled={disabled} icon={<svg />} aria-label="circle" />
      <Core.FormControl hasError>
        <Core.Label htmlFor="input" required disabled={disabled}>
          Email
        </Core.Label>
        <Core.Input id="input" disabled={disabled} />
        <Core.Hint>Invalid</Core.Hint>
        <Core.Hint hasError={false}>Help</Core.Hint>
      </Core.FormControl>
      <Core.CheckBoxGroup variant={variant as any}>
        <Core.CheckBoxItem
          label="Unchecked"
          description="Checkbox description"
          disabled={disabled}
          className={className}
        />
        <Core.CheckBoxItem label="Checked" checked disabled={disabled} />
      </Core.CheckBoxGroup>
      <Core.RadioGroup variant={variant as any} defaultValue="b" disabled={disabled}>
        <Core.RadioItem
          label="Radio A"
          description="Radio description"
          value="a"
          className={className}
        />
        <Core.RadioItem label="Radio B" value="b" />
      </Core.RadioGroup>
      <Core.SwitchGroup variant={variant as any}>
        <Core.SwitchItem
          label="Switch off"
          description="Switch description"
          disabled={disabled}
          className={className}
        />
        <Core.SwitchItem label="Switch on" checked disabled={disabled} />
      </Core.SwitchGroup>
      <Core.ToggleGroup type="multiple" defaultValue={["b"]} disabled={disabled}>
        <Core.ToggleItem value="a" className={className}>
          Toggle A
        </Core.ToggleItem>
        <Core.ToggleItem value="b">Toggle B</Core.ToggleItem>
      </Core.ToggleGroup>
    </div>
  );
  return (
    <>
      <button id="start">Start</button>
      <div id="unrelated">Host content</div>
      {visible &&
        (mode === "none" ? (
          body
        ) : (
          <Core.ThemeProvider
            mode={mode.includes("dark") ? "dark" : "light"}
            theme={
              mode.startsWith("custom")
                ? {
                    interactiveAccentDefault: "rgb(150,50,100)",
                    spaceM: "18px",
                    textNeutralPrimary: "rgb(40,70,90)",
                  }
                : undefined
            }
          >
            {body}
          </Core.ThemeProvider>
        ))}
    </>
  );
}
createRoot(document.getElementById("app")!).render(<App />);
