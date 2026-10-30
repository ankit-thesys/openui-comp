import { css } from "goober";
import { defaultLightTheme } from "../components/ThemeProvider/defaultTheme";
import { themeToCssVars } from "../components/ThemeProvider/utils";
import { createStyleTag } from "./styleTag";

if (typeof document !== "undefined") {
  // Establish the defaults layer before host layers, regardless of import order.
  const order = createStyleTag();
  order.setAttribute("data-openui-layer-order", "");
  order.textContent = "@layer openui-defaults;";
  document.head.prepend(order);

  // Token defaults have their own target, separate from component rules and the host's Goober.
  let sheet = document.getElementById("openui-defaults");
  if (!sheet) {
    sheet = createStyleTag();
    sheet.id = "openui-defaults";
    order.after(sheet);
  }
  if (!sheet.firstChild) sheet.textContent = " ";

  const defaultsCss = css.bind({ target: { querySelector: () => sheet } });
  const rootClass = defaultsCss`
    @layer openui-defaults {
      :where(&:root) {
        ${themeToCssVars({ ...defaultLightTheme })}
      }
    }
  `;
  document.documentElement.classList.add(rootClass);
}
