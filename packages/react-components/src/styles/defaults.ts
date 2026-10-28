import { css } from "goober";
import { defaultLightTheme } from "../components/ThemeProvider/defaultTheme";
import { themeToCssVars } from "../components/ThemeProvider/utils";

if (typeof document !== "undefined") {
  // Establish the defaults layer before host layers, regardless of import order.
  const order = document.createElement("style");
  order.setAttribute("data-openui-layer-order", "");
  order.textContent = "@layer openui-defaults;";
  document.head.prepend(order);

  // Put Goober's sheet right after it, ahead of app CSS, so equal-weight app rules win. Goober
  // would otherwise append it to <head> on this module's first `css` call below. A sheet that
  // already exists, such as one a host placed itself, is left where it is.
  const existing = document.getElementById("_goober");
  if (!existing) {
    const sheet = document.createElement("style");
    sheet.id = "_goober";
    sheet.textContent = " "; // Goober writes rules into this text node.
    order.after(sheet);
  } else if (!existing.firstChild) {
    // Goober writes into the first text node and crashes on an empty tag.
    existing.textContent = " ";
  }

  // Normal css registration avoids glob's replacement of host global styles.
  const rootClass = css`
    @layer openui-defaults {
      :where(&:root) {
        ${themeToCssVars({ ...defaultLightTheme })}
      }
    }
  `;
  document.documentElement.classList.add(rootClass);
}
