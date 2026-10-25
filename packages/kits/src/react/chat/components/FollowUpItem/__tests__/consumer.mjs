import { createRequire } from "node:module";
import path from "node:path";

// Point at the packed consumer when running outside the package workspace.
export const require = createRequire(
  process.env.KIT_CONSUMER
    ? path.resolve(process.env.KIT_CONSUMER, "package.json")
    : new URL("../../../../../../package.json", import.meta.url),
);
const testTools = process.env.KIT_TEST_TOOLS
  ? createRequire(path.resolve(process.env.KIT_TEST_TOOLS, "package.json"))
  : require;
const { JSDOM } = testTools("jsdom");
const dom = new JSDOM("<!doctype html><html><head></head><body></body></html>", {
  url: "http://localhost",
  pretendToBeVisual: true,
});
for (const name of [
  "window",
  "document",
  "HTMLElement",
  "DocumentFragment",
  "HTMLInputElement",
  "HTMLTextAreaElement",
  "Event",
  "MouseEvent",
]) {
  globalThis[name] = name === "window" ? dom.window : dom.window[name];
}
// Expose actual JSDOM browser APIs for Radix and animated public components.
globalThis.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
globalThis.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window);
globalThis.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window);
globalThis.MutationObserver = dom.window.MutationObserver;
globalThis.DOMParser = dom.window.DOMParser;
globalThis.HTMLFormElement = dom.window.HTMLFormElement;
globalThis.CustomEvent = dom.window.CustomEvent;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
export const React = require("react");
export const { createRoot } = require("react-dom/client");
export const { act } = React;
export const kit = require("@openuidev/kits/react/chat");
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
