import { css } from "goober";
import { defaultLightTheme } from "../components/ThemeProvider/defaultTheme";
import { themeToCssVars } from "../components/ThemeProvider/utils";

if (typeof document !== "undefined") {
  // Establish the defaults layer before host layers, regardless of import order.
  const order = document.createElement("style");
  order.setAttribute("data-openui-layer-order", "");
  order.textContent = "@layer openui-defaults;";
  document.head.prepend(order);

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
