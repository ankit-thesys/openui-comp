// Public package fixture for #91 overrides, state transitions, layers and lazy registration.
import {
  Buttons,
  FormControl,
  Hint,
  Input,
  Label,
  TextArea,
  ThemeProvider,
} from "openui-under-test";
import { useState } from "react";
import { createRoot } from "react-dom/client";

const params = new URLSearchParams(location.search);
function Fields() {
  const [hasError, setHasError] = useState(true);
  return (
    <>
      <button data-testid="toggle-invalid" onClick={() => setHasError((value) => !value)}>
        Toggle invalid
      </button>
      <FormControl hasError={hasError}>
        <Label data-testid="label" htmlFor="name" required>
          Name
        </Label>
        <Label data-testid="disabled-label" disabled>
          Disabled name
        </Label>
        <Input data-testid="input" id="name" placeholder="Name" />
        <Input data-testid="small" size="small" />
        <Input data-testid="large" size="large" />
        <Input data-testid="disabled-input" disabled />
        <Input data-testid="valid-input" hasError={false} />
        <TextArea data-testid="text-area" placeholder="Details" />
        <TextArea data-testid="disabled-text-area" disabled />
        <TextArea data-testid="valid-text-area" hasError={false} />
        <Hint data-testid="hint">Check the field</Hint>
        <Hint data-testid="valid-hint" hasError={false}>
          Details
        </Hint>
      </FormControl>
      <Buttons data-testid="horizontal">
        <button>Save</button>
        <button>Cancel</button>
      </Buttons>
      <Buttons data-testid="vertical" variant="vertical">
        <button>Save</button>
        <button>Cancel</button>
      </Buttons>
      <input data-testid="plain" />
    </>
  );
}
const mount = () =>
  createRoot(document.getElementById("root")!).render(
    <ThemeProvider
      cssLayer={params.get("layer") || undefined}
      mode={params.get("mode") === "dark" ? "dark" : "light"}
    >
      <Fields />
    </ThemeProvider>,
  );
if (params.has("lazy")) window.mountFixture = mount;
else mount();
