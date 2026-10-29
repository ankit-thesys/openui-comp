// PROTOTYPE, throwaway: a hook-free `css` whose cascade layer is applied when the sheet is
// written, not when a rule registers. Question: do module-level `css` calls that run before
// configureStyles() still end up in the configured layer, in the browser and on the server?
import { css as gooberCss } from "./vendor/goober.modern.js";

let rules = ""; // every rule goober registered through us, unlayered
let layer; // the app-wide layer, or undefined for unlayered
export const writes = []; // for the demo: each time the sheet text was rewritten

// Goober's getSheet(target): in a browser it calls target.querySelector("#_goober"), sets .nonce,
// checks .parentNode and appends to .firstChild.data; on a server it appends to target.data.
const sink = {
  get data() {
    return rules;
  },
  set data(next) {
    rules = next;
    write("register");
  },
};
const target = {
  querySelector: () => ({ parentNode: true, firstChild: sink }),
  get data() {
    return sink.data;
  },
  set data(next) {
    sink.data = next;
  },
};

export const sheetText = () => (layer ? `@layer ${layer}{${rules}}` : rules) || " ";

// Batched: rewriting the tag re-parses the whole sheet, so one rewrite per microtask, which still
// lands before the browser paints. (Unbatched, 1000 registrations took ~490 ms.)
let pending = false;
function write(reason) {
  writes.push({ reason, layer: layer ?? null, bytes: rules.length });
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
  tag.textContent = sheetText();
}

/** Public: returns a class name; the rule lands in whatever layer the app configures, whenever. */
export const css = gooberCss.bind({ target });
// goober's own `keyframes` is already bound (to {k: 1}), so rebinding it would drop `target`.
export const keyframes = gooberCss.bind({ target, k: 1 });

export function configureStyles(options) {
  layer = options.layer;
  write(`configure(${layer ?? "none"})`);
}

/** Server: render, then inline this. The layer wrapper is applied at collection time. */
export const getComponentStyles = () => sheetText();
