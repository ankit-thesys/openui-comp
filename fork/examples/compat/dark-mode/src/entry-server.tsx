import { getComponentStyles } from "@openuidev/react-components/styles";
import { renderToString } from "react-dom/server";
import { App } from "./App";
export const mode = __COMPAT_MODE__;
export function render(initialTheme: "light" | "dark") {
  // The complete collector runs before rendering, as required by the SSR recipe.
  const sheet = getComponentStyles(mode === "layered" ? { layer: "openui" } : {});
  const html = renderToString(<App initialTheme={initialTheme} />);
  return { sheet, html };
}
