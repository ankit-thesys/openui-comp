// The styling contract as code: which library selectors and stable class names are allowed.
// See test/README.md, "Styling contract".

const AT_RULES_WITH_RULES = /^@(media|container|supports)\b/;

/** A style rule's selector and the cascade layer it sits in: a dotted path for nested layers,
 * `<anonymous>` for an unnamed one, `""` when unlayered. */
export interface Rule {
  selector: string;
  layer: string;
}

/** Every style rule in `css`, including rules inside @media, @container, @supports and @layer
 * blocks. @keyframes and other at-rules are skipped. */
export const rulesOf = (css: string): Rule[] => rulesIn(css, "");

function rulesIn(css: string, layer: string): Rule[] {
  const rules: Rule[] = [];
  let i = 0;
  while (i < css.length) {
    const open = indexOutsideStrings(css, i, "{;");
    if (open === -1) break;
    if (css[open] === ";") {
      i = open + 1; // statement at-rule such as `@layer a, b;`
      continue;
    }
    const close = matchingBrace(css, open);
    const prelude = css.slice(i, open).trim();
    const body = css.slice(open + 1, close);
    const layerName = prelude.match(/^@layer(?![\w-])\s*([\s\S]*)$/);
    if (layerName) {
      const name = layerName[1] || "<anonymous>";
      rules.push(...rulesIn(body, layer ? `${layer}.${name}` : name));
    } else if (AT_RULES_WITH_RULES.test(prelude)) rules.push(...rulesIn(body, layer));
    else if (!prelude.startsWith("@"))
      rules.push(...splitList(prelude).map((selector) => ({ selector, layer })));
    i = close + 1;
  }
  return rules;
}

/** Top-level selectors of every style rule in `css`; see {@link rulesOf}. */
export const selectorsOf = (css: string): string[] => rulesOf(css).map((rule) => rule.selector);

/** Index of the first of `chars` at or after `from`, skipping quoted strings; -1 if none. */
const indexOutsideStrings = (css: string, from: number, chars: string) => {
  let quote = "";
  for (let i = from; i < css.length; i++) {
    const char = css[i]!;
    if (quote) {
      if (char === "\\") i++;
      else if (char === quote) quote = "";
    } else if (char === '"' || char === "'") quote = char;
    else if (chars.includes(char)) return i;
  }
  return -1;
};

/** Index of the `}` closing the block opened at `open`, skipping quoted strings. */
const matchingBrace = (css: string, open: number) => {
  let depth = 1;
  let i = open;
  while (depth > 0) {
    i = indexOutsideStrings(css, i + 1, "{}");
    if (i === -1) return css.length;
    depth += css[i] === "{" ? 1 : -1;
  }
  return i;
};

const splitList = (list: string) => {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < list.length; i++) {
    if (list[i] === "(") depth++;
    if (list[i] === ")") depth--;
    if (list[i] === "," && depth === 0) {
      parts.push(list.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(list.slice(start).trim());
  return parts.filter(Boolean);
};

const GENERATED = String.raw`\.go\d+`;
const STATE = [
  String.raw`:(?:hover|focus-visible|active|disabled|first-child|last-child|checked|placeholder-shown|focus-within)`,
  String.raw`\[(?:data|aria)-[a-z-]+(?:=(?:"[^"]*"|'[^']*'|[\w-]+))?\]`,
  String.raw`::(?:before|after|placeholder|-webkit-scrollbar)`,
].join("|");

const ONE_CLASS = new RegExp(`^${GENERATED}$`);
const CLASS_AND_STATE = new RegExp(`^${GENERATED}(?:${STATE})$`);
const SIBLINGS = new RegExp(`^${GENERATED}\\s*\\+\\s*${GENERATED}$`);
const ZERO_WEIGHT = new RegExp(`^:where\\(${GENERATED}\\)\\s*(.+)$`);
// Inside a zero-weight rule: type selectors, combinators and structural pseudo-classes only.
const STRUCTURAL =
  /^:(?:first-child|last-child|only-child|first-of-type|last-of-type|nth-child|nth-of-type|nth-last-child|has|not|is)$/;
const PSEUDO_ELEMENT = /^::(?:before|after|marker)$/;

/** Why `selector` breaks the library's selector budget, or `null` when it is allowed. */
export function selectorViolation(selector: string): string | null {
  const compact = selector.trim();
  if (ONE_CLASS.test(compact) || CLASS_AND_STATE.test(compact) || SIBLINGS.test(compact)) {
    return null;
  }
  const zeroWeight = compact.match(ZERO_WEIGHT);
  if (zeroWeight) {
    const rest = zeroWeight[1]!;
    if (/[.#[]/.test(rest)) return "zero-weight rule targets a class, id or attribute";
    for (const pseudo of rest.match(/::?[a-z-]+/g) ?? []) {
      if (!STRUCTURAL.test(pseudo) && !PSEUDO_ELEMENT.test(pseudo)) {
        return `zero-weight rule uses ${pseudo}; only structural pseudo-classes are allowed`;
      }
    }
    return null;
  }
  return "not one generated class plus at most one state, a sibling pair or a zero-weight rule";
}

/** Why `rule` breaks the contract when every library rule must sit in `layer` (`""` for default
 * mode), or `null` when it is allowed: the layer must match exactly and the selector must keep
 * the budget. */
export function ruleViolation(rule: Rule, layer: string): string | null {
  if (rule.layer !== layer) {
    const where = (name: string) => (name ? `layer ${name}` : "no layer");
    return `in ${where(rule.layer)}, expected ${where(layer)}`;
  }
  return selectorViolation(rule.selector);
}

const GRAMMAR = /^openui(-[a-z0-9]+)+(--[a-z0-9]+(-[a-z0-9]+)*)?$/;

/** Why stable class `name` breaks the naming grammar, or `null` when it is allowed. `blocks` are
 * the documented roots and parts a modifier may attach to. */
export function classViolation(name: string, blocks: ReadonlySet<string>): string | null {
  if (!GRAMMAR.test(name)) return "does not match openui-<block>[--<axis>-<value>]";
  const [block, modifier] = name.split("--");
  if (modifier === undefined) return null;
  return blocks.has(block!) ? null : `modifier on ${block}, which is not a documented root or part`;
}
