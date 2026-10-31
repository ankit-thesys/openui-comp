import { getComponentStyles } from "@openuidev/react-components";
import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { indexOutsideStrings, matchingBrace } from "./checks";

/**
 * Server-renders `elements` and selects their rules from the full public stylesheet by the
 * generated classes in their markup, including rules registered before this render. Until the
 * migration moves registration to import time, also check newly registered client-only parts.
 */
export function renderAndCollect(
  elements: ReactElement[],
  render = renderToString,
): { html: string; css: string } {
  const before = getComponentStyles();
  const html = elements.map((element) => render(element)).join("");
  return { html, css: cssFor(html, getComponentStyles(), before) };
}

/** Rules used by `html` or added during its render, plus the keyframes their animations use. */
export function cssFor(html: string, sheet: string, before?: string): string {
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
  const registered = new Set<string>();
  const identity = (prelude: string, body: string, wrappers: string[]) =>
    JSON.stringify([wrappers, prelude, body]);
  filterRules(before ?? "", (prelude, body, wrappers) => {
    registered.add(identity(prelude, body, wrappers));
    return false;
  });
  // Compare rules rather than string prefixes: a cumulative sheet can grow inside one layer.
  const added = (prelude: string, body: string, wrappers: string[]) =>
    before !== undefined && !registered.has(identity(prelude, body, wrappers));
  const usesRule = (prelude: string, body: string, wrappers: string[]) =>
    !prelude.startsWith("@") && (usesClass(prelude) || added(prelude, body, wrappers));
  const bodies: string[] = [];
  const variables = new Map<string, Set<string>>();
  filterRules(sheet, (prelude, body, wrappers) => {
    if (!usesRule(prelude, body, wrappers)) return false;
    bodies.push(body);
    for (const [, name, value] of body.matchAll(/(?:^|;)\s*(--[\w-]+)\s*:\s*([^;]+)/g)) {
      const values = variables.get(name!) ?? new Set<string>();
      values.add(value!.trim());
      variables.set(name!, values);
    }
    return true;
  });
  const animations = new Set(bodies.flatMap((body) => animationNamesIn(body, variables)));
  const resolved = new Set<string>();
  const selected = filterRules(sheet, (prelude, body, wrappers) => {
    const keyframes = prelude.match(/^@(?:-webkit-)?keyframes\s+(?:([\w-]+)|"([^"]+)"|'([^']+)')$/);
    if (!keyframes) return usesRule(prelude, body, wrappers);
    const name = keyframes[1] ?? keyframes[2] ?? keyframes[3]!;
    if (!animations.has(name) && !added(prelude, body, wrappers)) return false;
    resolved.add(name);
    return true;
  });
  const missing = [...animations].filter((name) => !resolved.has(name));
  if (missing.length) throw new Error(`Missing @keyframes: ${missing.sort().join(", ")}`);
  return selected;
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

function animationNamesIn(body: string, variables: Map<string, Set<string>>): string[] {
  const names: string[] = [];
  let start = 0;
  while (start < body.length) {
    const end = indexOutsideStrings(body, start, ";");
    const declaration = body.slice(start, end === -1 ? body.length : end);
    const animation = declaration.match(/^\s*(?:-webkit-)?animation(-name)?\s*:\s*(.*)$/s);
    if (animation) {
      for (const value of animationValues(
        animation[2]!.replace(/\s*!important\s*$/i, ""),
        variables,
      )) {
        const fields = new Set<string>();
        for (const token of animationTokens(value)) {
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
            if (token.toLowerCase() !== "none" && /^[-_a-zA-Z][\w-]*$/.test(token))
              names.push(token);
          }
        }
      }
    }
    if (end === -1) break;
    start = end + 1;
  }
  return names;
}

// An animation variable can have several state-dependent values. Check every possible name,
// including fallbacks, without following cycles between custom properties.
function animationValues(
  value: string,
  variables: Map<string, Set<string>>,
  seen = new Set<string>(),
): string[] {
  let values = [""];
  for (const token of animationTokens(value)) {
    const variable = token.match(/^var\(\s*(--[\w-]+)\s*(?:,([\s\S]*))?\)$/);
    let alternatives = [token];
    if (variable) {
      const [, name, fallback] = variable;
      const next = new Set([...seen, name!]);
      alternatives = seen.has(name!)
        ? []
        : [...(variables.get(name!) ?? []), ...(fallback ? [fallback] : [])].flatMap((entry) =>
            animationValues(entry, variables, next),
          );
      if (!alternatives.length) alternatives = [""];
    }
    values = values.flatMap((prefix) => alternatives.map((entry) => `${prefix} ${entry}`));
  }
  return values;
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

function filterRules(
  css: string,
  keep: (prelude: string, body: string, wrappers: string[]) => boolean,
  wrappers: string[] = [],
): string {
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
      const children = filterRules(body, keep, [...wrappers, prelude]);
      if (children) selected += `${prelude}{${children}}`;
    } else if (keep(prelude, body, wrappers)) selected += css.slice(start, close + 1);
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
