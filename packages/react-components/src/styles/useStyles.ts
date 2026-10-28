import { css } from "goober";

/** Goober's `css`, as handed to style factories. */
export type StyleCss = typeof css;

/** A style module's factory: `css` rules in, generated class names out. */
export type StyleFactory<T> = (css: StyleCss) => T;

// Results per cascade layer, then per factory, so each rule registers once: the first time a
// component using it renders. Every rule is unlayered (`undefined`) until ThemeProvider gains
// `cssLayer`, which adds a layer-wrapping `css` for named layers.
const cache = new Map<string | undefined, WeakMap<StyleFactory<unknown>, unknown>>();

const stylesFor = <T>(factory: StyleFactory<T>, layer: string | undefined): T => {
  let byFactory = cache.get(layer);
  if (!byFactory) cache.set(layer, (byFactory = new WeakMap()));
  if (!byFactory.has(factory)) byFactory.set(factory, factory(css));
  return byFactory.get(factory) as T;
};

/**
 * Returns a component's generated classes, registering its rules on first use. Internal: style
 * factories and their class names are not part of the public API.
 */
export function useStyles<T>(factory: StyleFactory<T>): T {
  return stylesFor(factory, undefined);
}
