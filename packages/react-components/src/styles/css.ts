import { css as gooberCss } from "goober";
import { createElement, type ReactNode } from "react";
import { DEFAULTS_RULE } from "./defaults";
import { createStyleTag } from "./styleTag";

// The browser's sheet. It is only ever appended to, never rewritten.
const SHEET_ID = "openui-styles";
// A layer name, or a dotted path of them such as `app.openui`, as `@layer` accepts.
const LAYER_NAME = /^-?[a-zA-Z_][\w-]*(\.-?[a-zA-Z_][\w-]*)*$/;

type Store = {
  // Every rule Goober has registered, unlayered.
  rules: string;
  // How much of `rules` is already on the page.
  written: number;
  emitted: boolean;
  // The layer of the rules last written to the page.
  emittedLayer: string | undefined;
  scheduled: boolean;
  layer: string | undefined;
  // PROTOTYPE: each class's own rule text, and which classes are keyframes.
  fragments: Record<string, string>;
  keyframes: Record<string, true>;
  // Classes in registration order; `next` is how many the browser has considered.
  order: string[];
  next: number;
  // Classes a server-rendered page already carries in React's hoisted tags.
  served: Record<string, true> | undefined;
  order_?: string | undefined;
};

// One store per page, shared by every copy of this module (an ESM and a CJS build, or two
// versions). Each copy's Goober then finds rules another copy registered and skips them.
const STORE = Symbol.for("@openuidev/react-components/styles");
const store: Store = ((globalThis as { [STORE]?: Store })[STORE] ??= {
  rules: "",
  written: 0,
  emitted: false,
  emittedLayer: undefined,
  scheduled: false,
  layer: undefined,
  fragments: {},
  keyframes: {},
  order: [],
  next: 0,
  served: undefined,
});

// Goober 2.1.19 also tells the browser from the server by `window`.
const inBrowser = () => typeof window === "object";

// Blocks with the same layer name join into one layer, so each write is wrapped on its own.
const wrap = (text: string, name = store.layer) =>
  name && text ? `@layer ${name}{${text}}` : text;

// React's hoisted component tags from a server render, e.g. data-href="openui go1 go2".
const SERVED = 'style[data-precedence="openui"]';

function served(): Record<string, true> {
  if (store.served) return store.served;
  const found: Record<string, true> = {};
  document.querySelectorAll(SERVED).forEach((tag) => {
    for (const href of (tag.getAttribute("data-href") ?? "").split(" ")) found[href] = true;
  });
  return (store.served = found);
}

function write() {
  store.scheduled = false;
  const skip = served();
  let fresh = "";
  for (; store.next < store.order.length; store.next++) {
    const name = store.order[store.next]!;
    if (!skip[name]) fresh += store.fragments[name];
  }
  store.written = store.rules.length;
  if (!fresh) return;
  let tag = document.getElementById(SHEET_ID);
  if (!tag) {
    tag = createStyleTag();
    tag.id = SHEET_ID;
    // React skips tags marked data-precedence when it hydrates <head>.
    tag.setAttribute("data-precedence", "openui");
    // After the server's component tags, else the token defaults, else first in <head>.
    const tags = document.querySelectorAll(SERVED);
    const anchor = tags[tags.length - 1] ?? document.getElementById("openui-defaults");
    if (anchor) anchor.after(tag);
    else document.head.prepend(tag);
  }
  const nonce = (window as Window & { __nonce__?: string }).__nonce__;
  if (nonce && tag.nonce !== nonce) tag.nonce = nonce;
  // The layer order goes before the first layer block, wherever the tag sits.
  if (store.order_ && !store.emitted) tag.append(`@layer ${store.order_};`);
  tag.append(wrap(fresh));
  store.emitted = true;
  store.emittedLayer = store.layer;
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

// Records the rule text each call adds under its class name.
function recording(bound: Css, keyframe: boolean): Css {
  return ((...args: Parameters<Css>) => {
    const before = store.rules.length;
    const name = bound(...args);
    if (!(name in store.fragments)) {
      // Goober appends a new rule; an empty difference means another copy registered it.
      store.fragments[name] = store.rules.slice(before);
      if (keyframe) store.keyframes[name] = true;
      store.order.push(name);
    }
    return name;
  }) as Css;
}

export const css: Css = recording(gooberCss.bind({ target }), false);
// Goober's exported keyframes is already bound, so rebinding it would discard our target.
export const keyframes: Keyframes = recording(gooberCss.bind({ target, k: 1 }), true);

type StyleSource = string | false | null | undefined | { [key: string]: StyleSource };

function collect(source: StyleSource, into: string[]) {
  if (!source) return;
  if (typeof source === "string") {
    for (const name of source.split(" ")) {
      if (!store.fragments[name] || into.includes(name)) continue;
      into.push(name);
      // Keyframes a rule animates with travel with it.
      for (const used of store.fragments[name].match(/go[\w-]+/g) ?? [])
        if (store.keyframes[used] && !into.includes(used)) into.push(used);
    }
    return;
  }
  for (const key in source) collect(source[key], into);
}

/**
 * PROTOTYPE. On the server, one hoisted `<style>` per component class in `sources` (class strings
 * or a whole style module); React writes each once per page, merged per flush. Null in browsers,
 * where the component sheet already has every imported rule.
 */
export function styleRules(...sources: StyleSource[]): ReactNode {
  if (inBrowser()) return null;
  const names: string[] = [];
  for (const source of sources) collect(source, names);
  const defaults = createElement(
    "style",
    { key: "openui-defaults", href: "openui-defaults", precedence: "openui-defaults" },
    (store.order_ ? `@layer ${store.order_};` : "") + DEFAULTS_RULE,
  );
  return [
    defaults,
    ...names.map((name) =>
      createElement(
        "style",
        { key: name, href: name, precedence: "openui" },
        wrap(store.fragments[name]!),
      ),
    ),
  ];
}

export type ConfigureStylesOptions = {
  /** App-wide cascade layer, or undefined for unlayered component rules. */
  layer?: string;
  /** PROTOTYPE: the app's whole layer order, e.g. "theme, base, openui, components, utilities". */
  order?: string;
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
  store.order_ = options.order;
}

const defaultsTag = () =>
  createElement(
    "style",
    { key: "openui-defaults", href: "openui-defaults", precedence: "openui-defaults" },
    (store.order_ ? `@layer ${store.order_};` : "") + DEFAULTS_RULE,
  );

/**
 * PROTOTYPE. Rendered once at the top of the document's <head>: claims the place of the component
 * rules (React adds later rules of the same precedence after it) ahead of app CSS, and declares
 * the configured layer order before any component layer block.
 */
export function OpenUIStyles(): ReactNode {
  return [
    store.order_
      ? createElement(
          "style",
          { key: "order", href: "openui-order", precedence: "openui-defaults" },
          `@layer ${store.order_};`,
        )
      : null,
    defaultsTag(),
    createElement("style", { key: "anchor", href: "openui-anchor", precedence: "openui" }, "/**/"),
  ];
}

// Server-rendered component tags go first in <head>, ahead of app CSS, before hydration: React
// renders them after app stylesheets it has already seen (Next's), and into the container when it
// renders one rather than the whole document. It skips data-precedence tags when hydrating.
if (typeof document !== "undefined") {
  const tags = document.querySelectorAll('style[data-precedence^="openui"]');
  const first = document.head.firstChild;
  tags.forEach((tag) => document.head.insertBefore(tag, first));
}
