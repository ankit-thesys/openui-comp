import { renderToString } from "react-dom/server";
import { extractCss } from "goober";
import { getComponentStyles } from "@openuidev/react-components/styles";
import { App } from "./app";
import { serverGlobals } from "./host";
import { compatMode } from "./mode";

export function render() {
  const componentCss = getComponentStyles({
    layer: compatMode === "layered" ? "openui" : undefined,
  });
  const html = renderToString(<App />);
  const hostCss = serverGlobals + extractCss();
  if (
    getComponentStyles({ layer: compatMode === "layered" ? "openui" : undefined }) !== componentCss
  )
    throw new Error("Host extractCss changed the library sheet");
  return { html, componentCss, hostCss, mode: compatMode };
}
