// Label's owned asterisk and every required × disabled combination.
import { Label, ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";

const mode = new URLSearchParams(location.search).get("mode") === "dark" ? "dark" : "light";
createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={mode}>
    <Label data-parity-case="default">Name</Label>
    {[false, true].flatMap((disabled) =>
      [false, true].map((required) => (
        <Label
          key={`${disabled}/${required}`}
          data-parity-case={`${disabled ? "disabled" : "enabled"}/${required ? "required" : "optional"}`}
          data-parity-parts={JSON.stringify({ asterisk: ".openui-label-required-asterisk" })}
          disabled={disabled}
          required={required}
        >
          Name
        </Label>
      )),
    )}
  </ThemeProvider>,
);
