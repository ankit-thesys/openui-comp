"use client";

import { createContext, useContext, useInsertionEffect } from "react";
import { css, flushComponentStyles } from "./css";

/** The `css` tag handed to style factories: Goober's, or one wrapping each rule in a layer. */
export type StyleCss = (strings: TemplateStringsArray, ...values: (string | number)[]) => string;

/** A style module's factory: `css` rules in, generated class names out. */
export type StyleFactory<T> = (css: StyleCss) => T;

/** The cascade layer for component rules, set by ThemeProvider's `cssLayer`; unlayered if unset. */
export const CssLayerContext = createContext<string | undefined>(undefined);

// Joins a tagged template as Goober's own `compile` does for the string values factories use.
const joined = (strings: TemplateStringsArray, values: (string | number)[]) =>
  strings.reduce((out, string, i) => out + string + (values[i] ?? ""), "");

// `&` keeps every selector a single generated class, inside the layer block.
const layered =
  (layer: string): StyleCss =>
  (strings, ...values) =>
    css(`@layer ${layer}{&{${joined(strings, values)}}}`);

// Results per cascade layer, then per factory, so each rule registers once per layer: the first
// time a component using it renders there. A layer gets its own generated classes.
const cache = new Map<string | undefined, WeakMap<StyleFactory<unknown>, unknown>>();

const stylesFor = <T>(factory: StyleFactory<T>, layer: string | undefined): T => {
  let byFactory = cache.get(layer);
  if (!byFactory) cache.set(layer, (byFactory = new WeakMap()));
  if (!byFactory.has(factory)) byFactory.set(factory, factory(layer ? layered(layer) : css));
  return byFactory.get(factory) as T;
};

/**
 * Returns a component's generated classes, registering its rules on first use, in the cascade
 * layer of the nearest ThemeProvider with `cssLayer`. Internal: style factories and their class
 * names are not part of the public API.
 */
export function useStyles<T>(factory: StyleFactory<T>): T {
  // Rules registered while rendering would otherwise reach the sheet a microtask after the
  // commit, so a layout effect that measures (column widths, positions) would see none of them
  // and transitions would start from unstyled values. Insertion effects run before those.
  useInsertionEffect(flushComponentStyles);
  return stylesFor(factory, useContext(CssLayerContext) || undefined);
}
