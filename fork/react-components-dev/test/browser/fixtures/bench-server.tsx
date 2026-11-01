// Server-renders the bench app with either package, as an SSR app's server would. Bundled for Node
// by build-fixtures.ts, because Playwright compiles JSX in spec files for component testing.
import * as reactComponents from "openui-under-test";
import { renderToString } from "react-dom/server";
import * as reactUi from "react-ui-under-test";
import { makeApp, type Mode } from "./bench-app";

export type Package = "react-components" | "react-ui";

const setups = {
  "react-components": {
    namespace: reactComponents,
    bundle: "bench",
    // README "Server-rendered styles": render first, then collect, then the sheet first in <head>.
    head: () => `<style id="openui-styles">${reactComponents.getComponentStyles()}</style>`,
  },
  "react-ui": {
    namespace: reactUi,
    bundle: "bench-react-ui",
    head: () => `<link rel="stylesheet" href="/react-ui.css">`,
  },
};

export function serverPage(pkg: Package, mode: Mode) {
  const { namespace, bundle, head } = setups[pkg];
  const App = makeApp(namespace);
  const html = renderToString(<App initialMode={mode} />);
  return (
    `<!doctype html><html><head><meta charset="utf-8">${head()}` +
    // react-lang auto-mounts its devtools in development; their onboarding dialog takes focus
    // and the first Escape. Opting out keeps both packages' interactions comparable.
    `<script>globalThis[Symbol.for("openui.devtools.autoMount")] = true;</script>` +
    `</head><body><div id="root" data-mode="${mode}">${html}</div>` +
    `<script type="module" src="/${bundle}.js"></script></body></html>`
  );
}
