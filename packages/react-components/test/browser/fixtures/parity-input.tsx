// Every size × invalid × disabled combination. Mouse press also focuses enabled fields.
// The same props run against #72; attributes and classes are the migration, not the visuals.
import { Input, ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";

const mode = new URLSearchParams(location.search).get("mode") === "dark" ? "dark" : "light";
createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={mode}>
    <Input data-parity-case="default" placeholder="Name" />
    {(["small", "medium", "large"] as const).flatMap((size) =>
      [false, true].flatMap((hasError) =>
        [false, true].map((disabled) => (
          <Input
            key={`${size}/${hasError}/${disabled}`}
            data-parity-case={`${size}/${hasError ? "invalid" : "valid"}/${disabled ? "disabled" : "enabled"}`}
            size={size}
            hasError={hasError}
            disabled={disabled}
            placeholder="Name"
            defaultValue="Ada"
          />
        )),
      ),
    )}
  </ThemeProvider>,
);
