// Default and both button-group variants; children are public Buttons in both bundles.
import { Button, Buttons, ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";

const mode = new URLSearchParams(location.search).get("mode") === "dark" ? "dark" : "light";
const children = (
  <>
    <Button data-parity-part="first">Save</Button>
    <Button data-parity-part="second" variant="secondary">
      Cancel
    </Button>
  </>
);
createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={mode}>
    <Buttons data-parity-case="default">{children}</Buttons>
    {(["horizontal", "vertical"] as const).map((variant) => (
      <Buttons key={variant} data-parity-case={variant} variant={variant}>
        {children}
      </Buttons>
    ))}
  </ThemeProvider>,
);
