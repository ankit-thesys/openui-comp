import { Button } from "openui-under-test";
import { Suspense, useEffect, useState } from "react";

// A whole document React renders: Button in the shell, and a Button variant the shell does not use
// inside a Suspense boundary, so its rules stream with the boundary (#178). With `emptyShell` the
// shell renders no component, so the token defaults also arrive only with the boundary.
export function ServerRulesApp({ wait, emptyShell }: { wait?: () => void; emptyShell?: boolean }) {
  const [hydrated, setHydrated] = useState(false);
  const [more, setMore] = useState(false);
  useEffect(() => setHydrated(true), []);
  function Late() {
    wait?.();
    return (
      <Button data-testid="late" variant="secondary" size="small" iconLeft={<span>+</span>}>
        Late component
      </Button>
    );
  }
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>server-rules</title>
      </head>
      <body>
        <main data-hydrated={hydrated}>
          {emptyShell ? null : (
            <Button data-testid="early" onClick={() => setMore(true)}>
              Early component
            </Button>
          )}
          <Suspense fallback={<p data-testid="fallback">Waiting</p>}>
            <Late />
          </Suspense>
          {/* Rendered only in the browser, after a click: its rules come from the browser sheet. */}
          {more ? (
            <Button data-testid="more" variant="tertiary" tone="destructive">
              Browser only
            </Button>
          ) : null}
        </main>
      </body>
    </html>
  );
}
