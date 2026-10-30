import { css as gooberCss } from "goober";

const SHEET_ID = "openui-styles";

let rules = "";
// Rules this module copy registered since its last write, in registration order.
let pending: string[] = [];
let scheduled = false;
let seeded = false;

// Goober 2.1.19 also tells the browser from the server by `window`, so both sides agree on where
// rules go even when a server boundary stubs `document`.
const inBrowser = () => typeof window === "object";

const sheetText = (tag: Element) => (tag.textContent ?? "").trim();

// A server-rendered sheet, or one another copy of the module wrote, already holds rules. Start
// from them, so Goober's `indexOf` dedupe skips those rules and no write drops them.
function seed() {
  if (seeded || !inBrowser()) return;
  seeded = true;
  const tag = document.getElementById(SHEET_ID);
  if (tag) rules = sheetText(tag) + rules;
}

function sheetTag(): HTMLElement {
  let tag = document.getElementById(SHEET_ID);
  if (!tag) {
    tag = document.createElement("style");
    tag.id = SHEET_ID;
    // After the token defaults and their layer-order tag, so `openui-defaults` stays the first
    // layer; otherwise first in <head>, ahead of app stylesheets.
    const defaults = document.getElementById("openui-defaults");
    if (defaults) defaults.after(tag);
    else document.head.prepend(tag);
  }
  const nonce = (window as Window & { __nonce__?: string }).__nonce__;
  if (nonce && tag.nonce !== nonce) tag.nonce = nonce;
  return tag;
}

function scheduleWrite() {
  if (!inBrowser() || scheduled) return;
  scheduled = true;
  queueMicrotask(flushComponentStyles);
}

/**
 * Writes the rules registered since the last write to the page's sheet, in one write. Internal:
 * besides the microtask, React commits call it before layout effects, so code that measures
 * during a commit sees the rules its own render registered.
 */
export function flushComponentStyles() {
  scheduled = false;
  if (!inBrowser() || !pending.length) return;
  const tag = sheetTag();
  // Another module copy may have written since; append only what the sheet lacks.
  let text = sheetText(tag);
  for (const rule of pending) if (!text.includes(rule)) text += rule;
  pending = [];
  rules = text;
  tag.textContent = text;
}

const sink = {
  get data() {
    seed();
    return rules;
  },
  set data(next: string) {
    seed();
    if (inBrowser()) pending.push(next.startsWith(rules) ? next.slice(rules.length) : next);
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
export const getComponentStyles = (): string => {
  seed();
  return rules || " ";
};
