// TextArea's default and every invalid × disabled combination, with its default row count.
import { TextArea, ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";

const mode = new URLSearchParams(location.search).get("mode") === "dark" ? "dark" : "light";
createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={mode}>
    <TextArea data-parity-case="default" placeholder="Details" />
    {[false, true].flatMap((hasError) =>
      [false, true].map((disabled) => (
        <TextArea
          key={`${hasError}/${disabled}`}
          data-parity-case={`${hasError ? "invalid" : "valid"}/${disabled ? "disabled" : "enabled"}`}
          hasError={hasError}
          disabled={disabled}
          placeholder="Details"
          defaultValue="A few details"
        />
      )),
    )}
    <TextArea data-parity-case="rows-5" rows={5} defaultValue="More details" />
  </ThemeProvider>,
);
