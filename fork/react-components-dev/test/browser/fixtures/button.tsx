// Buttons for the override, placement and registration specs.
// `?lazy=1` waits for `window.mountFixture()` so a spec can inspect the page before Button renders.
import { Button } from "openui-under-test";
import { createRoot } from "react-dom/client";

const Icon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24">
    <circle cx="12" cy="12" r="10" />
  </svg>
);

const mount = () =>
  createRoot(document.getElementById("root")!).render(
    <>
      <Button data-testid="default">Default</Button>
      <Button
        data-testid="custom"
        variant="secondary"
        size="small"
        tone="destructive"
        iconLeft={<Icon />}
      >
        Custom
      </Button>
      <button type="button" data-testid="plain">
        Plain
      </button>
    </>,
  );

declare global {
  interface Window {
    mountFixture: () => void;
  }
}

if (new URLSearchParams(location.search).has("lazy")) window.mountFixture = mount;
else mount();
