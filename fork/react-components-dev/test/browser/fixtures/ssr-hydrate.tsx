// Hydrates the Buttons ssr.spec.ts server-renders, in the app-wide layer the server page names on
// `#ssr-layer[data-layer]` (none without it), then renders a Tag only after hydration, so its rules register late on the client.
import { Button, configureStyles, Tag } from "openui-under-test";
import { useEffect, useState } from "react";
import { hydrateRoot } from "react-dom/client";

configureStyles({ layer: document.getElementById("ssr-layer")?.dataset["layer"] });

function App() {
  const [late, setLate] = useState(false);
  useEffect(() => setLate(true), []);
  return (
    <>
      <Button data-testid="default">Default</Button>
      <Button data-testid="custom" variant="secondary" size="small" tone="destructive">
        Custom
      </Button>
      {late && (
        <div data-testid="late">
          <Tag text="Late" />
        </div>
      )}
    </>
  );
}

hydrateRoot(document.getElementById("root")!, <App />);
