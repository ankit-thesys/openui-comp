import { Button } from "@openuidev/react-components";
import { hydrateRoot } from "react-dom/client";

// Hydrates the whole document with React's development build, as `next dev` does, after the
// package (and with it the token defaults) has evaluated. Only development builds report an
// attribute React did not render, so this catches what a production bundle cannot. Its markup
// must match the static page document.spec.ts serves.
const Document = () => (
  <html lang="en">
    <head />
    <body>
      <main id="app">Document</main>
    </body>
  </html>
);
(window as Window & { packageLoaded?: boolean }).packageLoaded = Button !== undefined;
hydrateRoot(document, <Document />, {
  onRecoverableError: (error) => console.error(error),
});
(window as Window & { hydrated?: boolean }).hydrated = true;
