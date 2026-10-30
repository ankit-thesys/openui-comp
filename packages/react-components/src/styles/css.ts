import { css as gooberCss } from "goober";

const SHEET_ID = "openui-styles";
// A registry flush is `STREAM_START…STREAM_END`, so the browser can tell a tag whose text is still
// arriving (split across network chunks) from a complete one, the first tag included.
const STREAM_START = "/*openui-stream*/";
const STREAM_END = "/*openui-stream-end*/";

let rules = "";
// Rules this module copy registered since its last write, in registration order.
let pending: string[] = [];
let scheduled = false;
let seeded = false;
// The first tag's rules are in `rules`. Waits while that tag is still streaming in.
let adopted = false;
// The app-wide cascade layer (configureStyles). It wraps the sheet when it is written, so rules
// registered before configureStyles, at import time, end up in the layer too.
let layer: string | undefined;
// configureStyles changed the layer, so the sheet needs rewriting even with no new rule.
let relayer = false;

// A layer name, or a dotted path of them such as `app.openui`, as `@layer` accepts.
const LAYER_NAME = /^-?[a-zA-Z_][\w-]*(\.-?[a-zA-Z_][\w-]*)*$/;

const wrapped = (text: string) => (layer && text ? `@layer ${layer}{${text}}` : text);

// Goober 2.1.19 also tells the browser from the server by `window`, so both sides agree on where
// rules go even when a server boundary stubs `document`.
const inBrowser = () => typeof window === "object";

const sheetText = (tag: Element) => {
  let text = (tag.textContent ?? "").trim();
  if (text.startsWith(STREAM_START)) text = text.slice(STREAM_START.length);
  return text.endsWith(STREAM_END) ? text.slice(0, -STREAM_END.length).trim() : text;
};

// The parser only appends at the end of the document, so a tag with anything after it is closed.
function lastParsed(tag: Element): boolean {
  let node: Node = document.documentElement;
  while (node.lastChild) node = node.lastChild;
  return node === tag || tag.contains(node);
}

// A registry tag the parser has not finished: its start marker without the end marker. An empty
// tag, or one holding part of the start marker, may still be receiving its text only while it is
// the last thing parsed; a host's reserved sheet with markup after it is complete, so client
// rules are not held back until the document finishes loading.
function streaming(tag: Element): boolean {
  const text = tag.textContent ?? "";
  if (text.startsWith(STREAM_START)) return !text.trimEnd().endsWith(STREAM_END);
  if (document.readyState !== "loading" || !lastParsed(tag)) return false;
  return !text || STREAM_START.startsWith(text);
}

// Takes the first tag's rules into the store once its text is complete.
function adopt(): boolean {
  if (adopted) return true;
  const tag = document.getElementById(SHEET_ID);
  if (tag && streaming(tag)) return false;
  adopted = true;
  if (tag) rules = serverRules(sheetText(tag)) + rules;
  return true;
}
const streamedSheets = () => document.querySelectorAll<HTMLStyleElement>(`style#${SHEET_ID}`);

// Split only between complete top-level rules. A css call can emit a base rule, states, media
// queries and keyframes together; the server and client may have registered overlapping groups.
function ruleBlocks(text: string): string[] {
  const blocks: string[] = [];
  let start = 0;
  let depth = 0;
  let quote = "";
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quote) {
      if (char === "\\") i++;
      else if (char === quote) quote = "";
    } else if (char === "/" && text[i + 1] === "*") {
      const end = text.indexOf("*/", i + 2);
      i = end < 0 ? text.length : end + 1;
    } else if (char === "\\") i++;
    else if (char === '"' || char === "'") quote = char;
    else if (char === "{") depth++;
    else if ((char === "}" && --depth === 0) || (char === ";" && depth === 0)) {
      blocks.push(text.slice(start, i + 1));
      start = i + 1;
    }
  }
  if (start < text.length) blocks.push(text.slice(start));
  return blocks;
}

// A sheet written in layer mode, by the server or another module copy, is one `@layer <name>{…}`
// around all its rules. Seeding and merging work on the rules inside, so the next write wraps
// them once instead of nesting a second layer. Anything else, including a sheet whose first
// block closes before its end, is returned unchanged.
function serverRules(text: string): string {
  const open = /^@layer\s+[^\s{};,]+\s*\{/.exec(text);
  if (!open) return text;
  let depth = 0;
  let quote = "";
  for (let i = open[0].length - 1; i < text.length; i++) {
    const char = text[i];
    if (quote) {
      if (char === "\\") i++;
      else if (char === quote) quote = "";
    } else if (char === '"' || char === "'") quote = char;
    else if (char === "{") depth++;
    else if (char === "}" && --depth === 0)
      return i === text.length - 1 ? text.slice(open[0].length, i) : text;
  }
  return text;
}

// A server-rendered sheet, or one another copy of the module wrote, already holds rules. Start
// from them, so Goober's `indexOf` dedupe skips those rules and no write drops them.
function seed() {
  if (seeded || !inBrowser()) return;
  seeded = true;
  adopt();
  // Streaming may continue after this module loads. Watch the whole document because later
  // flushes can arrive in the body, and a parser can add a style's text after adding the element.
  const observer = new MutationObserver((records) => {
    if (
      // Until the first tag is adopted, any parsed node may be what completes it.
      !adopted ||
      records.some(
        (record) =>
          (record.target instanceof Element && record.target.matches(`style#${SHEET_ID}`)) ||
          (record.target.parentElement?.matches(`style#${SHEET_ID}`) ?? false) ||
          [...record.addedNodes].some(
            (node) =>
              node instanceof Element &&
              (node.matches(`style#${SHEET_ID}`) || node.querySelector(`style#${SHEET_ID}`)),
          ),
      )
    )
      scheduleWrite();
  });
  observer.observe(document.documentElement, {
    childList: true,
    characterData: true,
    subtree: true,
  });
  // An empty first tag waits for the parser; the end of loading settles it.
  if (document.readyState === "loading")
    document.addEventListener("readystatechange", () => scheduleWrite(), { once: true });
  if (streamedSheets().length > 1) scheduleWrite();
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
  if (!inBrowser()) return;
  seed();
  // Never touch the first tag mid-parse: replacing its text would put the rest of the payload
  // after ours. Pending rules wait; the observer reschedules as the text arrives.
  if (!adopt()) return;
  const tags = [...streamedSheets()];
  const complete = tags.filter(
    (tag, index) => index > 0 && (tag.textContent ?? "").trim().endsWith(STREAM_END),
  );
  if (!pending.length && !relayer && !complete.length) return;
  const tag = sheetTag();
  // Keep the first sheet's position ahead of app CSS. Later streamed tags and other module
  // copies join it, with each complete rule present once even if hydration registered it first.
  const merged = new Set(ruleBlocks(serverRules(sheetText(tag))));
  for (const later of complete) {
    for (const rule of ruleBlocks(serverRules(sheetText(later)))) merged.add(rule);
  }
  for (const group of pending) for (const rule of ruleBlocks(group)) merged.add(rule);
  const text = [...merged].join("");
  pending = [];
  relayer = false;
  rules = text;
  if (tag.textContent !== wrapped(text)) tag.textContent = wrapped(text);
  for (const later of complete) later.remove();
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

export type ConfigureStylesOptions = {
  /** App-wide cascade layer, or undefined for unlayered component rules. */
  layer?: string;
};

/** Sets the layer for the whole component sheet, including rules already registered. */
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
  relayer = true;
  scheduleWrite();
}

/** Returns every component rule registered so far, ready for <style id="openui-styles">. */
export const getComponentStyles = (): string => {
  seed();
  return wrapped(rules) || " ";
};

export type StyleRegistry = {
  /** New layer-wrapped rules between start and end comments; empty if nothing new after a flush. */
  flush(): string;
};

/** Create once per server response. Collection never drains the cumulative component sheet. */
export function createStyleRegistry(): StyleRegistry {
  let emitted = 0;
  let first = true;
  return {
    flush() {
      const text = rules.slice(emitted);
      emitted = rules.length;
      const result = wrapped(text) || (first ? " " : "");
      first = false;
      // Transport can split even a style tag across chunks. The browser must not read, rewrite or
      // remove it before its entire CSS payload arrives, so keep both comments when inlining.
      return result ? STREAM_START + result + STREAM_END : "";
    },
  };
}
