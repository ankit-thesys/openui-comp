import { indexOutsideStrings, matchingBrace } from "../unit/contract/checks";
import { cssFor } from "../unit/contract/collect";

export interface Collection {
  html: string;
  sheet: string;
}

export interface DeclarationRule {
  selector: string;
  conditions: string[];
  declarations: string[];
}

export interface Snapshot {
  markup: string;
  rules: Record<string, DeclarationRule[]>;
}

export function declarationRules(css: string, conditions: string[] = []): DeclarationRule[] {
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
    if (/^@(layer|media|supports|container)\b/.test(selector)) {
      rules.push(
        ...declarationRules(
          body,
          selector.startsWith("@layer") ? conditions : [...conditions, selector],
        ),
      );
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
      rules.push({ selector, conditions, declarations });
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
export function snapshot({ html, sheet }: Collection): Snapshot {
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
  const rules: Snapshot["rules"] = {};
  for (const rule of declarationRules(css)) {
    const owner = rule.selector.match(/\.(go\d+)\b/)?.[1];
    const key = owner ? aliases.get(owner)! : "@keyframes";
    (rules[key] ??= []).push({
      selector: normalize(rule.selector),
      conditions: rule.conditions,
      declarations: rule.declarations.map(normalize),
    });
  }
  // React's opaque instance IDs differ between independent roots and browser navigations. Keep
  // references linked while normalizing their allocation counters; all other markup stays exact.
  const ids = new Map<string, string>();
  const markup = normalize(html).replace(/(?:_R_[\w-]*_|_r_[\w-]*_|:r[\w-]+:)/g, (id) => {
    if (!ids.has(id)) ids.set(id, `react-id-${ids.size}`);
    return ids.get(id)!;
  });
  return {
    markup,
    rules: Object.fromEntries(Object.entries(rules).sort(([a], [b]) => a.localeCompare(b))),
  };
}
