// FormControl does not forward arbitrary attributes, so the case names its root within a section.
import { FormControl, Hint, Input, Label, TextArea, ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";

declare const __PARITY_BASELINE__: boolean;
const mode = new URLSearchParams(location.search).get("mode") === "dark" ? "dark" : "light";
const parts = JSON.stringify({
  root: ".openui-form-control",
  hint: __PARITY_BASELINE__ ? ".openui-hint" : ".openui-form-control-hint",
  label: ".openui-label",
  asterisk: ".openui-label-required-asterisk",
  input: ".openui-input",
  textArea: __PARITY_BASELINE__ ? ".openui-textarea" : ".openui-text-area",
});
createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={mode}>
    {[false, true].map((hasError) => (
      <section
        key={String(hasError)}
        data-parity-case={`context/${hasError}`}
        data-parity-parts={parts}
      >
        <FormControl hasError={hasError}>
          <Label required>Name</Label>
          <Input placeholder="Name" />
          <TextArea placeholder="Details" />
          <Hint>Details</Hint>
        </FormControl>
      </section>
    ))}
    <section data-parity-case="default" data-parity-parts={parts}>
      <FormControl>
        <Label>Name</Label>
        <Input />
        <Hint>Details</Hint>
      </FormControl>
    </section>
    <section data-parity-case="explicit-false" data-parity-parts={parts}>
      <FormControl hasError>
        <Label disabled required>
          Name
        </Label>
        <Input hasError={false} />
        <TextArea hasError={false} />
        <Hint hasError={false}>Details</Hint>
      </FormControl>
    </section>
  </ThemeProvider>,
);
