import { getComponentStyles } from "@openuidev/react-components";
import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";

/**
 * Server-renders `elements` and returns their markup and the CSS registered while rendering:
 * the part of the package's cumulative `getComponentStyles()` sheet that the render added.
 */
export function renderAndCollect(elements: ReactElement[]): { html: string; css: string } {
  const before = getComponentStyles().trim();
  const html = elements.map((element) => renderToString(element)).join("");
  const after = getComponentStyles().trim();
  if (!after.startsWith(before)) throw new Error("getComponentStyles() is no longer cumulative.");
  return { html, css: after.slice(before.length) };
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
