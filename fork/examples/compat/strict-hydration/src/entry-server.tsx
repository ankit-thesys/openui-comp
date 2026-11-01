import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { App } from "./App";
export const mode = __COMPAT_MODE__;
export function render(initialTheme: "light" | "dark") {
  // #1523 has no server rendering: the browser writes component rules.
  const sheet = "";
  const html = renderToString(
    <StrictMode>
      <App initialTheme={initialTheme} />
    </StrictMode>,
  );
  return { sheet, html };
}
