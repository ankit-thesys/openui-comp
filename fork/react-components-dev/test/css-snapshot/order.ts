import { rulesOf, ruleViolation } from "../unit/contract/checks";
import { classLists, declarationRules, type Collection } from "./snapshot";

export type Provenance = Record<string, { module: string; stableClasses: string[] }[]>;

// Include longhands reset by the shorthands present in component rules. Keep the literal
// property too, so the report remains easy to compare with the declarations in a style module.
const sides = ["top", "right", "bottom", "left"];
const shorthands: Record<string, string[]> = {
  margin: sides.map((side) => `margin-${side}`),
  padding: sides.map((side) => `padding-${side}`),
  inset: sides,
  border: ["border-width", "border-style", "border-color", "border-image"],
  "border-width": sides.map((side) => `border-${side}-width`),
  "border-style": sides.map((side) => `border-${side}-style`),
  "border-color": sides.map((side) => `border-${side}-color`),
  "border-radius": ["top-left", "top-right", "bottom-right", "bottom-left"].map(
    (corner) => `border-${corner}-radius`,
  ),
  "border-image": ["source", "slice", "width", "outset", "repeat"].map(
    (part) => `border-image-${part}`,
  ),
  font: [
    "font-family",
    "font-size",
    "font-style",
    "font-weight",
    "font-stretch",
    "font-variant",
    "line-height",
  ],
  background: ["image", "position", "size", "repeat", "origin", "clip", "attachment", "color"].map(
    (part) => `background-${part}`,
  ),
  flex: ["flex-grow", "flex-shrink", "flex-basis"],
  "flex-flow": ["flex-direction", "flex-wrap"],
  gap: ["row-gap", "column-gap"],
  overflow: ["overflow-x", "overflow-y"],
  outline: ["outline-width", "outline-style", "outline-color"],
  transition: ["property", "duration", "timing-function", "delay"].map(
    (part) => `transition-${part}`,
  ),
  animation: [
    "name",
    "duration",
    "timing-function",
    "delay",
    "iteration-count",
    "direction",
    "fill-mode",
    "play-state",
  ].map((part) => `animation-${part}`),
};
for (const side of sides)
  shorthands[`border-${side}`] = ["width", "style", "color"].map(
    (part) => `border-${side}-${part}`,
  );
const propertyNames = (property: string): string[] => [
  property,
  ...(shorthands[property] ?? []).flatMap(propertyNames),
];

export function orderReport(
  collections: Record<string, Collection>,
  provenance: Provenance,
): string {
  const lines = [
    "# Cross-module style order report",
    "",
    "Recorded from the built contract fixtures. Each row identifies an element by its tag, stable",
    "classes and occurrence among classed elements. Rules include potential states, pseudo-elements",
    "and conditional branches, not only the state active at capture. Repeated identical rows are",
    "grouped with all occurrence indexes. Common physical shorthands also include the longhands",
    "they reset. Ancestor prose/SVG rules are excluded from the ancestor's properties. This is an",
    "order-risk inventory, not a computed-style verdict.",
    "",
  ];
  for (const [component, { html, sheet }] of Object.entries(collections)) {
    const propertiesByClass = new Map<string, Set<string>>();
    for (const rule of declarationRules(sheet)) {
      if (rule.selector.startsWith("@")) continue;
      for (const { selector } of rulesOf(`${rule.selector}{}`)) {
        if (!selector.startsWith(".go") || ruleViolation({ selector, layer: "" }, "") !== null)
          continue;
        const name = [...selector.matchAll(/\.(go\d+)\b/g)].at(-1)![1]!;
        const properties = propertiesByClass.get(name) ?? new Set<string>();
        for (const declaration of rule.declarations)
          for (const property of propertyNames(declaration.split(":")[0]!))
            properties.add(property);
        propertiesByClass.set(name, properties);
      }
    }
    const grouped = new Map<string, number[]>();
    for (const [index, { tag, classes }] of classLists(html).entries()) {
      const generated = classes.filter((name) => /^go\d+$/.test(name));
      const byModule = new Map<string, Set<string>>();
      for (const name of generated) {
        if (!provenance[name]) throw new Error(`${component}: no style module for ${name}`);
        const properties = propertiesByClass.get(name) ?? new Set<string>();
        const origins = provenance[name]!.filter(({ stableClasses }) =>
          stableClasses.some((stable) => classes.includes(stable)),
        );
        if (!origins.length)
          throw new Error(`${component}: no module context for ${name} on ${classes.join(" ")}`);
        for (const { module } of origins) {
          const set = byModule.get(module) ?? new Set<string>();
          for (const property of properties) set.add(property);
          byModule.set(module, set);
        }
      }
      if (byModule.size < 2) continue;
      const modules = [...byModule.keys()].sort();
      const collisions: string[] = [];
      for (const [i, left] of modules.entries()) {
        for (const right of modules.slice(i + 1)) {
          const overlap = [...byModule.get(left)!]
            .filter((property) => byModule.get(right)!.has(property))
            .sort();
          if (overlap.length) collisions.push(`${left} ↔ ${right}: ${overlap.join(", ")}`);
        }
      }
      const stable = classes.filter((name) => !/^go\d+$/.test(name)).join(".");
      const description = `\`${tag}.${stable}\`\n\nModules: ${modules.map((module) => `\`${module}\``).join(", ")}\n\n${collisions.length ? collisions.map((collision) => `- ${collision}`).join("\n") : "Shared properties: none."}`;
      const occurrences = grouped.get(description) ?? [];
      occurrences.push(index);
      grouped.set(description, occurrences);
    }
    lines.push(`## ${component}`, "");
    if (!grouped.size) lines.push("No element carries rules from multiple style modules.", "");
    for (const [description, indexes] of grouped)
      lines.push(`Elements ${indexes.join(", ")}: ${description}`, "");
  }
  return lines.join("\n");
}
