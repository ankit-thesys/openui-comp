import { getComponentStyles } from "@openuidev/react-components";
import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { indexOutsideStrings, matchingBrace } from "./checks";

/**
 * Server-renders `elements` and selects their rules from the full public stylesheet by the
 * generated classes in their markup, including rules registered before this render.
 */
export function renderAndCollect(
  elements: ReactElement[],
  render = renderToString,
): { html: string; css: string } {
  const html = elements.map((element) => render(element)).join("");
  return { html, css: cssFor(html, getComponentStyles()) };
}

/** Rules whose generated classes occur in `html`, plus the keyframes their animations use. */
export function cssFor(html: string, sheet: string): string {
  const classes = new Set(
    [...html.matchAll(/\sclass="([^"]*)"/g)]
      .flatMap((match) => match[1]!.split(/\s+/))
      .filter((name) => /^go\d+$/.test(name)),
  );
  const usesClass = (selector: string) =>
    !selector.startsWith("@") &&
    [
      ...selector
        .replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, "")
        .matchAll(/\.(go\d+)(?![\w-])/g),
    ].some(([, name]) => classes.has(name!));
  const animations = new Set<string>();
  filterRules(sheet, (prelude, body) => {
    if (!usesClass(prelude)) return false;
    for (const name of animationNamesIn(body)) animations.add(name);
    return true;
  });
  return filterRules(sheet, (prelude) => {
    const keyframes = prelude.match(/^@(?:-webkit-)?keyframes\s+(?:([\w-]+)|"([^"]+)"|'([^']+)')$/);
    return keyframes
      ? animations.has(keyframes[1] ?? keyframes[2] ?? keyframes[3]!)
      : usesClass(prelude);
  });
}

const ANIMATION_FIELDS = new Map(
  [
    {
      field: "timing",
      keywords: ["linear", "ease", "ease-in", "ease-out", "ease-in-out", "step-start", "step-end"],
    },
    { field: "direction", keywords: ["normal", "reverse", "alternate", "alternate-reverse"] },
    { field: "fill", keywords: ["none", "forwards", "backwards", "both"] },
    { field: "state", keywords: ["running", "paused"] },
    { field: "iterations", keywords: ["infinite"] },
  ].flatMap(({ keywords, field }) => keywords.map((keyword) => [keyword, field] as const)),
);

function animationNamesIn(body: string): string[] {
  const names: string[] = [];
  let start = 0;
  while (start < body.length) {
    const end = indexOutsideStrings(body, start, ";");
    const declaration = body.slice(start, end === -1 ? body.length : end);
    const animation = declaration.match(/^\s*(?:-webkit-)?animation(-name)?\s*:\s*(.*)$/s);
    if (animation) {
      const fields = new Set<string>();
      for (const token of animationTokens(animation[2]!.replace(/\s*!important\s*$/i, ""))) {
        if (token === ",") {
          fields.clear();
          continue;
        }
        const quoted = token.startsWith('"') || token.startsWith("'");
        if (quoted) names.push(token.slice(1, -1));
        else {
          if (/^(initial|inherit|unset|revert|revert-layer)$/i.test(token)) continue;
          const field =
            ANIMATION_FIELDS.get(token.toLowerCase()) ??
            (/^(steps|cubic-bezier|linear)\(/i.test(token)
              ? "timing"
              : /^\d*\.?\d+$/.test(token)
                ? "iterations"
                : undefined);
          // A keyword fills its shorthand field first; a repeated one can be the animation name.
          if (!animation[1] && field !== undefined && !fields.has(field)) {
            fields.add(field);
            continue;
          }
          if (token.toLowerCase() !== "none" && /^[-_a-zA-Z][\w-]*$/.test(token)) names.push(token);
        }
      }
    }
    if (end === -1) break;
    start = end + 1;
  }
  return names;
}

// Whitespace and commas split animation values only outside functions and quoted names.
function animationTokens(value: string): string[] {
  const tokens: string[] = [];
  let start = 0;
  let depth = 0;
  let quote = "";
  for (let i = 0; i <= value.length; i++) {
    const char = value[i];
    if (quote) {
      if (char === "\\") i++;
      else if (char === quote) quote = "";
    } else if (char === '"' || char === "'") quote = char;
    else if (char === "(") depth++;
    else if (char === ")") depth--;
    else if (i === value.length || (depth === 0 && /[\s,]/.test(char!))) {
      if (i > start) tokens.push(value.slice(start, i));
      if (char === ",") tokens.push(char);
      start = i + 1;
    }
  }
  return tokens;
}

function filterRules(css: string, keep: (prelude: string, body: string) => boolean): string {
  let selected = "";
  let start = 0;
  while (start < css.length) {
    const open = indexOutsideStrings(css, start, "{;");
    if (open === -1) break;
    if (css[open] === ";") {
      start = open + 1;
      continue;
    }
    const close = matchingBrace(css, open);
    const prelude = css.slice(start, open).trim();
    const body = css.slice(open + 1, close);
    if (/^@(media|container|supports|layer)\b/.test(prelude)) {
      const children = filterRules(body, keep);
      if (children) selected += `${prelude}{${children}}`;
    } else if (keep(prelude, body)) selected += css.slice(start, close + 1);
    start = close + 1;
  }
  return selected;
}

/** Every `openui-*` class in `html`. */
export const stableClassesIn = (html: string) =>
  new Set(
    [...html.matchAll(/class="([^"]*)"/g)]
      .flatMap((match) => match[1]!.split(/\s+/))
      .filter((name) => name.startsWith("openui-")),
  );

/** The generated (`goN`) classes on every element of `html` that carries stable class `name`. */
export const generatedClassesOn = (html: string, name: string) =>
  new Set(
    [...html.matchAll(/class="([^"]*)"/g)]
      .map((match) => match[1]!.split(/\s+/))
      .filter((classes) => classes.includes(name))
      .flatMap((classes) => classes.filter((value) => /^go\d+$/.test(value))),
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
