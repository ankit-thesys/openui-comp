import { css as gooberCss } from "goober";

let rules = "";
let pending = false;

function scheduleWrite() {
  if (typeof document === "undefined" || pending) return;
  pending = true;
  queueMicrotask(flush);
}

function flush() {
  pending = false;
  let tag = document.getElementById("openui-styles");
  if (!tag) {
    tag = Object.assign(document.createElement("style"), { id: "openui-styles" });
    document.head.prepend(tag);
  }
  tag.textContent = getComponentStyles();
}

const sink = {
  get data() {
    return rules;
  },
  set data(next: string) {
    rules = next;
    scheduleWrite();
  },
};

// Goober 2.1.19 reads firstChild.data in browsers and target.data on the server.
const target = {
  querySelector: () => ({ parentNode: true, firstChild: sink }),
  get data() {
    return sink.data;
  },
  set data(next: string) {
    sink.data = next;
  },
};

export type Css = typeof gooberCss;
export type Keyframes = typeof gooberCss;

export const css: Css = gooberCss.bind({ target });
// Goober's exported keyframes is already bound, so rebinding it would discard our target.
export const keyframes: Keyframes = gooberCss.bind({ target, k: 1 });

/** Returns every component rule registered so far, ready for <style id="openui-styles">. */
export const getComponentStyles = (): string => rules || " ";
