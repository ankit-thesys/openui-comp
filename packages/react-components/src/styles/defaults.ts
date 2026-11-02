import { defaultLightTheme } from "../components/ThemeProvider/defaultTheme";
import { themeToCssVars } from "../components/ThemeProvider/utils";
import { createStyleTag } from "./styleTag";

// The token defaults as one rule, which server renders send in their own hoisted tag.
export const DEFAULTS_HREF = "openui-defaults";
export const DEFAULTS_PRECEDENCE = "openui-defaults";
export const DEFAULTS_RULE = `@layer openui-defaults;@layer openui-defaults{:where(:root){${themeToCssVars({ ...defaultLightTheme })}}}`;

// A server render already sent the defaults, in the hoisted tag React wrote.
const servedDefaults = () =>
  document.querySelector(
    `style[data-precedence="${DEFAULTS_PRECEDENCE}"][data-href~="${DEFAULTS_HREF}"]`,
  );

if (typeof document !== "undefined" && !servedDefaults()) {
  // These tags go first in <head>, before React hydrates a server-rendered document (React Router,
  // TanStack Start, Next). React hydrates <head> by position and would match the app's own first
  // <style> against them, failing on the text; it skips styles marked `data-precedence`, its own
  // hoisted-sheet marker, and keeps them when it re-renders the document.

  // Establish the defaults layer before host layers, regardless of import order.
  const order = createStyleTag();
  order.setAttribute("data-openui-layer-order", "");
  order.setAttribute("data-precedence", DEFAULTS_PRECEDENCE);
  order.textContent = "@layer openui-defaults;";
  document.head.prepend(order);

  // Token defaults have their own tag, separate from component rules and the host's Goober. They
  // apply to :root itself, so the library never adds a class to the app's <html>, which a
  // server-rendered document would report as a hydration mismatch.
  let sheet = document.getElementById("openui-defaults");
  if (!sheet) {
    sheet = createStyleTag();
    sheet.id = "openui-defaults";
    order.after(sheet);
  }
  sheet.setAttribute("data-precedence", DEFAULTS_PRECEDENCE);
  const rule = `@layer openui-defaults{:where(:root){${themeToCssVars({ ...defaultLightTheme })}}}`;
  if (!(sheet.textContent ?? "").includes(rule)) sheet.append(rule);

  // A server-rendered page still streaming may yet send the defaults with a Suspense boundary, when
  // its shell rendered no component. Once the document is complete, the browser's copy goes.
  if (document.readyState === "loading") {
    const copy = sheet;
    document.addEventListener(
      "DOMContentLoaded",
      () => {
        if (!servedDefaults()) return;
        order.remove();
        copy.remove();
      },
      { once: true },
    );
  }
}
