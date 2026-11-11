// Server-renders dashboard trees in plain Node, the way a server does: no window, no document.
// Run by the browser tests' `serverRender` command (vitest.config.ts), which then hydrates the
// HTML in the browser. Usage: node ssr/render.mjs <18|19> '<json specs>'; prints JSON HTML strings.
import module from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const [react, json] = process.argv.slice(2);
const specs = JSON.parse(json);

if (react === "18") {
  // Every `react` and `react-dom` import or require, the library's and react-dom's own included,
  // resolves to the react-18 and react-dom-18 aliases, as the React 18 browser project does.
  if (typeof module.registerHooks !== "function") {
    throw new Error("The React 18 server render needs Node 22.15+ (module.registerHooks).");
  }
  const here = pathToFileURL(fileURLToPath(new URL("../package.json", import.meta.url))).href;
  module.registerHooks({
    resolve(specifier, context, next) {
      const match = /^(react-dom|react)(\/.*)?$/.exec(specifier);
      if (!match) return next(specifier, context);
      return next(`${match[1]}-18${match[2] ?? ""}`, { ...context, parentURL: here });
    },
  });
}

const { createElement } = await import("react");
const { renderToString } = await import("react-dom/server");
const { Renderer } = await import("@openuidev/react-lang");
const { library, ThemeProvider } = await import("@openuidev/dashboard-library-next");

const html = specs.map((spec) => {
  const dashboard = createElement(Renderer, { library, response: spec.program });
  return renderToString(
    spec.provider
      ? createElement(ThemeProvider, { mode: spec.mode, lightTheme: spec.lightTheme }, dashboard)
      : dashboard,
  );
});
process.stdout.write(JSON.stringify(html));
