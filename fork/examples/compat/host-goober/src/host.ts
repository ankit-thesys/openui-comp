import { createElement } from "react";
import { extractCss, glob, setup, styled } from "goober";

// A deliberately visible prefixer proves that host setup does not replace the library's setup.
setup(
  createElement,
  (property, value) =>
    property === "user-select"
      ? `-webkit-user-select:${value};user-select:${value};--host-prefixer:active;`
      : `${property}:${value};`,
  undefined,
  (props) => {
    for (const key of Object.keys(props))
      if (key.startsWith("$")) Reflect.deleteProperty(props, key);
  },
);
glob`.host-global { color: rgb(17, 34, 51); }`;
// Goober extractCss consumes its sheet. Capture process-wide globals once so every response
// includes them; request-time styled rules are extracted after rendering in entry-server.
export const serverGlobals = typeof window === "undefined" ? extractCss() : "";
export const Host = styled("div")<{ $active: boolean }>`
  background-color: ${(props) => (props.$active ? "rgb(65, 43, 21)" : "rgb(21, 43, 65)")};
  padding: 13px;
  user-select: none;
`;
