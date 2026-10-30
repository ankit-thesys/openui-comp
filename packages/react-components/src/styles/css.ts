import { css as gooberCss } from "goober";

// The browser's sheet. It is only ever appended to, never rewritten.
const SHEET_ID = "openui-styles";
// Server-rendered sheets: <ComponentStyles> (React gives it data-href), a hand-written tag with the
// attribute, or plain HTML using the browser's own id. The browser only reads them.
const SERVER_SHEET = `style[data-href="${SHEET_ID}"], style[data-openui-styles], style#${SHEET_ID}`;
// A layer name, or a dotted path of them such as `app.openui`, as `@layer` accepts.
const LAYER_NAME = /^-?[a-zA-Z_][\w-]*(\.-?[a-zA-Z_][\w-]*)*$/;

// Every rule Goober has registered, unlayered. In the browser it starts with the server sheet.
let rules = "";
// How much of `rules` is already on the page.
let written = 0;
let seeded = false;
let scheduled = false;
let layer: string | undefined;

// Goober 2.1.19 also tells the browser from the server by `window`.
const inBrowser = () => typeof window === "object";

// Blocks with the same layer name join into one layer, so each write is wrapped on its own.
const wrap = (text: string, name = layer) => (name && text ? `@layer ${name}{${text}}` : text);

// The server sheet holds every rule verbatim, layered or not, so Goober's indexOf dedupe skips
// them and the browser writes only what the server did not send.
function seed() {
  if (seeded || !inBrowser()) return;
  seeded = true;
  for (const tag of document.querySelectorAll(SERVER_SHEET)) {
    const text = tag.textContent ?? "";
    rules += text;
    // A layered server sheet names its layer; rules the browser adds go in the same one.
    layer ??= /^@layer ([^\s{]+)\{/.exec(text)?.[1];
  }
  written = rules.length;
}

function write() {
  scheduled = false;
  const fresh = rules.slice(written);
  written = rules.length;
  if (!fresh) return;
  let tag = document.getElementById(SHEET_ID);
  if (!tag) {
    tag = document.createElement("style");
    tag.id = SHEET_ID;
    // After the server sheet or the token defaults; otherwise first in <head>, ahead of app CSS.
    const anchor = [...document.querySelectorAll(`${SERVER_SHEET}, #openui-defaults`)].pop();
    if (anchor) anchor.after(tag);
    else document.head.prepend(tag);
  }
  const nonce = (window as Window & { __nonce__?: string }).__nonce__;
  if (nonce && tag.nonce !== nonce) tag.nonce = nonce;
  tag.append(wrap(fresh));
}

const sink = {
  get data() {
    seed();
    return rules;
  },
  set data(next: string) {
    seed();
    rules = next;
    if (inBrowser() && !scheduled) {
      scheduled = true;
      queueMicrotask(write);
    }
  },
};

// Goober 2.1.19 reads querySelector(…).firstChild.data in browsers and target.data on the server.
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

export type ConfigureStylesOptions = {
  /** App-wide cascade layer, or undefined for unlayered component rules. */
  layer?: string;
};

/** Sets the cascade layer for component rules. Call it once in the app entry, before rendering. */
export function configureStyles(options: ConfigureStylesOptions): void {
  if (options.layer !== undefined && !LAYER_NAME.test(options.layer)) {
    if (typeof process !== "undefined" && process.env?.["NODE_ENV"] !== "production") {
      console.warn(
        `[OpenUI] configureStyles layer "${options.layer}" is not a cascade layer name. It is ignored.`,
      );
    }
    return;
  }
  layer = options.layer;
}

/**
 * Every component rule registered so far, for `<style data-openui-styles>` in server HTML.
 * Pass the layer to wrap them in, and the same name as `data-layer` so browser rules match.
 */
export const getComponentStyles = (options: ConfigureStylesOptions = {}): string => {
  seed();
  return wrap(rules, options.layer ?? layer) || " ";
};
