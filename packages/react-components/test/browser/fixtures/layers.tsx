// Buttons in and out of layer mode for the cssLayer spec.
// `?layer=<name>` sets the outer provider's cssLayer; without it the provider has none.
import { Button, ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";

const layer = new URLSearchParams(location.search).get("layer") ?? undefined;

createRoot(document.getElementById("root")!).render(
  <>
    <Button data-testid="outside">Outside</Button>
    <ThemeProvider cssLayer={layer}>
      <Button data-testid="default">Default</Button>
      <Button
        data-testid="icon"
        variant="secondary"
        size="small"
        tone="destructive"
        iconLeft={
          <svg viewBox="0 0 24 24" width="24" height="24">
            <circle cx="12" cy="12" r="10" />
          </svg>
        }
      >
        Icon
      </Button>
      <Button data-testid="disabled" variant="tertiary" disabled>
        Disabled
      </Button>
      <Button data-testid="utility" className="bg-red-500">
        Utility
      </Button>
      <Button data-testid="important-utility" className="!bg-red-500">
        Important utility
      </Button>
      <ThemeProvider>
        <Button data-testid="inherited">Inherited</Button>
      </ThemeProvider>
      <ThemeProvider cssLayer="nested">
        <Button data-testid="overridden">Overridden</Button>
      </ThemeProvider>
    </ThemeProvider>
  </>,
);
