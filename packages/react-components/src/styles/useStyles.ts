"use client";

import { useInsertionEffect } from "react";
import { css, flushComponentStyles } from "./css";

/** The `css` tag handed to style factories during the migration. */
export type StyleCss = (strings: TemplateStringsArray, ...values: (string | number)[]) => string;

/** A style module's factory: `css` rules in, generated class names out. */
export type StyleFactory<T> = (css: StyleCss) => T;

const cache = new WeakMap<StyleFactory<unknown>, unknown>();

/** Returns a component's generated classes, registering its rules on first use. Internal shim. */
export function useStyles<T>(factory: StyleFactory<T>): T {
  // Rules registered while rendering would otherwise reach the sheet a microtask after the
  // commit, so a layout effect that measures (column widths, positions) would see none of them
  // and transitions would start from unstyled values. Insertion effects run before those.
  useInsertionEffect(flushComponentStyles);
  if (!cache.has(factory)) cache.set(factory, factory(css));
  return cache.get(factory) as T;
}
