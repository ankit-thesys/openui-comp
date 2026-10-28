import { extractCss } from "goober";
import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";

/**
 * Server-renders `elements` and returns their markup and the CSS registered while rendering.
 *
 * Reads Goober's server sheet directly for now: drains it, renders, then takes what was added.
 * Switch to the package's public `getComponentStyles()` once it lands, diffing its cumulative
 * output before and after the render instead.
 */
export function renderAndCollect(elements: ReactElement[]): { html: string; css: string } {
  extractCss();
  const html = elements.map((element) => renderToString(element)).join("");
  return { html, css: extractCss() };
}

/** Every `openui-*` class in `html`. */
export const stableClassesIn = (html: string) =>
  new Set(
    [...html.matchAll(/class="([^"]*)"/g)]
      .flatMap((match) => match[1]!.split(/\s+/))
      .filter((name) => name.startsWith("openui-")),
  );

type StableNames = Record<string, string | Record<string, string>>;

/** Every value of the given `names` constants, whose axis objects nest one level deep. */
export const namesIn = (constants: StableNames[]) =>
  new Set(
    constants.flatMap((names) =>
      Object.values(names).flatMap((value) =>
        typeof value === "string" ? [value] : Object.values(value),
      ),
    ),
  );

/** The roots and parts in the given `names` constants: the blocks modifiers may attach to. */
export const blocksIn = (constants: StableNames[]) =>
  new Set(
    constants.flatMap((names) =>
      Object.values(names).filter((value): value is string => typeof value === "string"),
    ),
  );
