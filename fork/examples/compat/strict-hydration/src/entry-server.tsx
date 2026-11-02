import "./configure";
import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { App } from "./App";
export const mode = __COMPAT_MODE__;
export function render(initialTheme: "light" | "dark") {
  // Component rules travel in React's hoisted tags inside `html` (#178); no separate sheet.
  const sheet = "";
  const html = renderToString(
    <StrictMode>
      <App initialTheme={initialTheme} />
    </StrictMode>,
  );
  return { sheet, html };
}
