import { indexOutsideStrings, matchingBrace } from "../unit/contract/checks";
import { cssFor } from "../unit/contract/collect";
import type { Provenance } from "./order";

export interface Collection {
  html: string;
  sheet: string;
}

export interface DeclarationRule {
  selector: string;
  conditions: string[];
  declarations: string[];
  /** The cascade layer around the rule, however many wrappers express it. Absent when unlayered. */
  layer?: string;
}

export interface Snapshot {
  /** Normalized markup split before each tag, so a diff lands on the changed element. */
  markup: string[];
  rules: Record<string, DeclarationRule[]>;
  /** Per element and style module, its generated rules in sheet (registration) order. */
  order: string[];
}

// Layer-mode samples keep only the rules and their order: the layer API around the markup changes
// with the app-wide layer (#131), while each rule's declarations and its layer must not.
export type LayerSnapshot = Omit<Snapshot, "markup">;

export function declarationRules(
  css: string,
  conditions: string[] = [],
  layer?: string,
): DeclarationRule[] {
  const rules: DeclarationRule[] = [];
  let start = 0;
  while (start < css.length) {
    const open = indexOutsideStrings(css, start, "{;");
    if (open === -1) break;
    if (css[open] === ";") {
      start = open + 1;
      continue;
    }
    const close = matchingBrace(css, open);
    const selector = css.slice(start, open).trim();
    const body = css.slice(open + 1, close);
    if (selector.startsWith("@layer")) {
      // Record the layer, not its wrappers: one per rule or one around the sheet is the same.
      const name = selector.slice("@layer".length).trim();
      rules.push(...declarationRules(body, conditions, layer ? `${layer}.${name}` : name));
    } else if (/^@(media|supports|container)\b/.test(selector)) {
      rules.push(...declarationRules(body, [...conditions, selector], layer));
    } else {
      const declarations: string[] = [];
      let from = 0;
      while (from < body.length) {
        const end = indexOutsideStrings(body, from, ";");
        const declaration = body.slice(from, end === -1 ? body.length : end).trim();
        if (declaration) declarations.push(declaration);
        if (end === -1) break;
        from = end + 1;
      }
      rules.push({ selector, conditions, declarations, ...(layer ? { layer } : {}) });
    }
    start = close + 1;
  }
  return rules;
}

export function classLists(html: string) {
  return [...html.matchAll(/<([\w-]+)\b[^>]*?\sclass="([^"]*)"[^>]*>/g)].map((match) => ({
    tag: match[1]!,
    classes: match[2]!.split(/\s+/).filter(Boolean),
  }));
}

// Names are anchored to stable markup and class slots, never to the declaration's hash. Keeping
// distinct slots (rather than replacing every hash with "go") preserves selector relationships.
export function snapshot({ html, sheet }: Collection, provenance: Provenance): Snapshot {
  const aliases = new Map<string, string>();
  const counts = new Map<string, number>();
  for (const { classes } of classLists(html)) {
    const stable = classes.filter((name) => name.startsWith("openui-") && !name.includes("--"));
    const anchor = stable.join("+");
    for (const name of classes.filter((name) => /^go\d+$/.test(name))) {
      if (aliases.has(name)) continue;
      if (!anchor) throw new Error(`Generated class ${name} has no stable class in its markup.`);
      const slot = counts.get(anchor) ?? 0;
      aliases.set(name, `${anchor}#${slot}`);
      counts.set(anchor, slot + 1);
    }
  }
  const css = cssFor(html, sheet);
  for (const [, name] of css.matchAll(/@(?:-webkit-)?keyframes\s+(go\d+)\b/g)) {
    if (!aliases.has(name!)) aliases.set(name!, `keyframe#${aliases.size}`);
  }
  const normalize = (value: string) =>
    value.replace(/\bgo\d+\b/g, (name) => {
      const alias = aliases.get(name);
      if (!alias) throw new Error(`Unmapped generated name ${name}.`);
      return alias;
    });
  // Equal-weight rules on one element resolve by sheet order, which the keyed rules below lose.
  // Within one style module that order must survive the migration (ADR 0002); across modules it
  // becomes import order, so cross-module pairs are left to the order report.
  const position = new Map<string, number>();
  declarationRules(css).forEach(({ selector }, index) => {
    for (const [, name] of selector.matchAll(/\.(go\d+)\b/g))
      if (!position.has(name!)) position.set(name!, index);
  });
  const order = new Set<string>();
  for (const { classes } of classLists(html)) {
    const byModule = new Map<string, string[]>();
    for (const name of classes.filter((name) => /^go\d+$/.test(name))) {
      const modules = (provenance[name] ?? [])
        .filter(({ stableClasses }) => stableClasses.some((stable) => classes.includes(stable)))
        .map(({ module }) => module);
      // A class the provenance scan cannot place still gets an order entry, so the comparison
      // shows the change rather than stopping here.
      if (!modules.length) modules.push("(unattributed)");
      for (const module of modules) byModule.set(module, [...(byModule.get(module) ?? []), name]);
    }
    for (const [module, names] of byModule)
      if (names.length > 1)
        order.add(
          `${module}: ${names
            .sort((a, b) => (position.get(a) ?? Infinity) - (position.get(b) ?? Infinity))
            .map((name) => aliases.get(name))
            .join(" < ")}`,
        );
  }
  const rules: Snapshot["rules"] = {};
  for (const rule of declarationRules(css)) {
    const owner = rule.selector.match(/\.(go\d+)\b/)?.[1];
    const key = owner ? aliases.get(owner)! : "@keyframes";
    (rules[key] ??= []).push({
      selector: normalize(rule.selector),
      conditions: rule.conditions,
      declarations: rule.declarations.map(normalize),
      ...(rule.layer ? { layer: rule.layer } : {}),
    });
  }
  // React's opaque instance IDs differ between independent roots and browser navigations. Keep
  // references linked while normalizing their allocation counters; all other markup stays exact.
  const ids = new Map<string, string>();
  const markup = normalize(html)
    .replace(/(?:_R_[\w-]*_|_r_[\w-]*_|:r[\w-]+:)/g, (id) => {
      if (!ids.has(id)) ids.set(id, `react-id-${ids.size}`);
      return ids.get(id)!;
    })
    .split(/(?=<)/);
  return {
    markup,
    rules: Object.fromEntries(Object.entries(rules).sort(([a], [b]) => a.localeCompare(b))),
    order: [...order].sort(),
  };
}
