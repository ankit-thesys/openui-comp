import { css as gooberCss } from "goober";
import { createElement, type ReactNode } from "react";
import { DEFAULTS_HREF, DEFAULTS_PRECEDENCE, DEFAULTS_RULE } from "./defaults";
import { createStyleTag } from "./styleTag";

// The browser's sheet. It is only ever appended to, never rewritten.
const SHEET_ID = "openui-styles";
// The precedence of component rules in React's hoisted tags, and the marker React's head hydration
// skips; the browser sheet carries it too.
const PRECEDENCE = "openui";
// A layer name, or a dotted path of them such as `app.openui`, as `@layer` accepts.
const LAYER_NAME = /^-?[a-zA-Z_][\w-]*(\.-?[a-zA-Z_][\w-]*)*$/;

type Store = {
  // Every rule Goober has registered, unlayered.
  rules: string;
  // How much of `rules` is already on the page. An older copy of this module writes from here.
  written: number;
  emitted: boolean;
  // The layer of the rules last written to the page.
  emittedLayer: string | undefined;
  scheduled: boolean;
  layer: string | undefined;
  // Each generated class's own rule text, and which of those classes are keyframes.
  classes: Record<string, string>;
  keyframes: Record<string, true>;
  // Classes in registration order, and how many of them the browser has written or skipped.
  order: string[];
  considered: number;
};

// One store per page, shared by every copy of this module (an ESM and a CJS build, or two
// versions). Each copy's Goober then finds rules another copy registered and skips them. A store
// an older copy created lacks the per-class records, so they are added to it.
const STORE = Symbol.for("@openuidev/react-components/styles");
const store = ((globalThis as { [STORE]?: Partial<Store> })[STORE] ??= {
  rules: "",
  written: 0,
  emitted: false,
  emittedLayer: undefined,
  scheduled: false,
  layer: undefined,
}) as Store;
store.classes ??= {};
store.keyframes ??= {};
store.order ??= [];
store.considered ??= 0;

// Goober 2.1.19 also tells the browser from the server by `window`.
const inBrowser = () => typeof window === "object";

// Blocks with the same layer name join into one layer, so each write is wrapped on its own.
const wrap = (text: string, name = store.layer) =>
  name && text ? `@layer ${name}{${text}}` : text;

// React's hoisted tags from a server render, e.g. <style data-precedence="openui" data-href="go1 go2">.
const hoistedTags = (precedence: string) => `style[data-precedence="${precedence}"][data-href]`;

// Classes the server put on the page. Read on every write: Suspense boundaries stream more tags.
function servedClasses(): Record<string, true> {
  const found: Record<string, true> = {};
  document.querySelectorAll(hoistedTags(PRECEDENCE)).forEach((tag) => {
    for (const name of tag.getAttribute("data-href")!.split(" ")) found[name] = true;
  });
  return found;
}

function write() {
  // A server-rendered page that is still streaming may yet send Suspense boundaries' tags, so the
  // browser writes once the document is complete and skips their classes too.
  if (document.readyState === "loading" && document.querySelector(hoistedTags(PRECEDENCE))) {
    document.addEventListener("DOMContentLoaded", write, { once: true });
    return;
  }
  store.scheduled = false;
  const served = servedClasses();
  let fresh = "";
  for (; store.considered < store.order.length; store.considered++) {
    const name = store.order[store.considered]!;
    if (!served[name]) fresh += store.classes[name];
  }
  // Every registered rule is now written or served, so an older copy has nothing left to write.
  store.written = store.rules.length;
  if (!fresh) return;
  let tag = document.getElementById(SHEET_ID);
  if (!tag) {
    tag = createStyleTag();
    tag.id = SHEET_ID;
    tag.setAttribute("data-precedence", PRECEDENCE);
    // After the server's component rules, else the token defaults, else first in <head>.
    const tags = document.querySelectorAll(hoistedTags(PRECEDENCE));
    const anchor =
      tags[tags.length - 1] ??
      document.getElementById("openui-defaults") ??
      document.querySelector(`style[data-precedence="${DEFAULTS_PRECEDENCE}"]`);
    if (anchor) anchor.after(tag);
    else document.head.prepend(tag);
  }
  const nonce = (window as Window & { __nonce__?: string }).__nonce__;
  if (nonce && tag.nonce !== nonce) tag.nonce = nonce;
  tag.append(wrap(fresh));
  store.emitted = true;
  store.emittedLayer = store.layer;
}

// Before hydration, the server's tags move to the start of <head>, in their order, ahead of app
// CSS: React places them after app stylesheets it has already seen, and inside the container when
// it renders one rather than the whole document. React's hydration skips tags marked
// data-precedence.
if (typeof document !== "undefined") {
  const moved = document.createDocumentFragment();
  document
    .querySelectorAll(`${hoistedTags(DEFAULTS_PRECEDENCE)}, ${hoistedTags(PRECEDENCE)}`)
    .forEach((tag) => moved.append(tag));
  document.head.prepend(moved);
}

const sink = {
  get data() {
    return store.rules;
  },
  set data(next: string) {
    store.rules = next;
    if (inBrowser() && !store.scheduled) {
      store.scheduled = true;
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

// Records the rule text each new class adds. Goober appends a class's rules in one write; a class
// another copy of this module registered adds nothing and keeps that copy's record.
function recording(bound: Css, keyframe: boolean): Css {
  return ((...args: Parameters<Css>) => {
    const before = store.rules.length;
    const name = bound(...args);
    if (!(name in store.classes)) {
      store.classes[name] = store.rules.slice(before);
      if (keyframe) store.keyframes[name] = true;
      store.order.push(name);
    }
    return name;
  }) as Css;
}

export const css: Css = recording(gooberCss.bind({ target }), false);
// Goober's exported keyframes is already bound, so rebinding it would discard our target.
export const keyframes: Keyframes = recording(gooberCss.bind({ target, k: 1 }), true);

const hoisted = (href: string, precedence: string, text: string) =>
  createElement("style", { key: href, href, precedence }, text);

/**
 * The rules of the generated classes in `classNames`, for server renders. Pass an element's final
 * class string; stable and app classes are ignored. On the server, React hoists the tags into
 * <head>, writes each class once per page and merges a flush's tags into one. Renders nothing in
 * browsers, where the component sheet has every imported rule.
 */
export function styleRules(...classNames: Array<string | false | null | undefined>): ReactNode {
  if (inBrowser()) return null;
  const names: string[] = [];
  const add = (name: string) => {
    if (!store.classes[name] || names.includes(name)) return;
    names.push(name);
    // Keyframes a rule animates with travel with it.
    for (const used of store.classes[name].match(/go\d+/g) ?? [])
      if (store.keyframes[used]) add(used);
  };
  for (const className of classNames) if (className) className.split(" ").forEach(add);
  if (!names.length) return null;
  return [
    hoisted(DEFAULTS_HREF, DEFAULTS_PRECEDENCE, DEFAULTS_RULE),
    ...names.map((name) => hoisted(name, PRECEDENCE, wrap(store.classes[name]!))),
  ];
}

export type ConfigureStylesOptions = {
  /** App-wide cascade layer, or undefined for unlayered component rules. */
  layer?: string;
};

// Bundlers replace `process.env.NODE_ENV` but leave `process` undefined, so a `typeof process`
// check would silence browser builds. An unbundled browser or a CDN ESM build has no `process`.
// Keep the dot form: Vite's dev server does not replace `process.env["NODE_ENV"]`.
function development(): boolean {
  try {
    return process.env.NODE_ENV !== "production";
  } catch {
    return false;
  }
}

/** Sets the cascade layer for component rules. Call it once in the app entry, before rendering. */
export function configureStyles(options: ConfigureStylesOptions): void {
  if (options.layer !== undefined && !LAYER_NAME.test(options.layer)) {
    if (development()) {
      console.warn(
        `[OpenUI] configureStyles layer "${options.layer}" is not a cascade layer name. It is ignored.`,
      );
    }
    return;
  }
  if (
    store.emitted &&
    options.layer !== store.layer &&
    options.layer !== store.emittedLayer &&
    development()
  ) {
    console.warn(
      "[OpenUI] configureStyles was called after component rules were written. " +
        "Existing page rules cannot be re-layered. Configure once in the app entry, before rendering.",
    );
  }
  store.layer = options.layer;
}
