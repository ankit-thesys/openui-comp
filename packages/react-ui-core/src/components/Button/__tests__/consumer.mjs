import { createRequire } from "node:module";
import path from "node:path";

// Point at the packed consumer when running outside the package workspace.
export const require = createRequire(
  path.resolve(process.env.CORE_CONSUMER || "packages/react-ui-core", "package.json"),
);
const testTools = process.env.CORE_TEST_TOOLS
  ? createRequire(path.resolve(process.env.CORE_TEST_TOOLS, "package.json"))
  : require;
const { JSDOM } = testTools("jsdom");
const dom = new JSDOM("<!doctype html><html><head></head><body></body></html>", {
  url: "http://localhost",
});
for (const name of [
  "window",
  "document",
  "HTMLElement",
  "HTMLInputElement",
  "HTMLTextAreaElement",
  "Event",
  "MouseEvent",
]) {
  globalThis[name] = name === "window" ? dom.window : dom.window[name];
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
export const React = require("react");
export const { createRoot } = require("react-dom/client");
export const { act } = React;
export const core = require("@openuidev/react-ui-core");

export async function mount(element) {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  await act(async () => root.render(element));
  return {
    container,
    async render(next) {
      await act(async () => root.render(next));
    },
    async close() {
      await act(async () => root.unmount());
      container.remove();
    },
  };
}
