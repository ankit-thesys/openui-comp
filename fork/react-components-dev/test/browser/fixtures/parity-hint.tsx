// Hint works standalone and in context; explicit false overrides inherited invalid state.
import { FormControl, Hint, ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";

const mode = new URLSearchParams(location.search).get("mode") === "dark" ? "dark" : "light";
createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={mode}>
    <Hint data-parity-case="standalone/default">Details</Hint>
    {[false, true].map((hasError) => (
      <Hint key={String(hasError)} data-parity-case={`standalone/${hasError}`} hasError={hasError}>
        Details
      </Hint>
    ))}
    <FormControl hasError>
      <Hint data-parity-case="inherited/invalid">Check the field</Hint>
      <Hint data-parity-case="inherited/explicit-false" hasError={false}>
        Details
      </Hint>
    </FormControl>
  </ThemeProvider>,
);
