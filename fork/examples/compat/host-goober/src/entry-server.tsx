import "./configure";
import { renderToString } from "react-dom/server";
import { extractCss } from "goober";
import { App } from "./app";
import { serverGlobals } from "./host";
import { compatMode } from "./mode";

export function render() {
  const componentCss = "";
  const html = renderToString(<App />);
  const hostCss = serverGlobals + extractCss();
  return { html, componentCss, hostCss, mode: compatMode };
}
