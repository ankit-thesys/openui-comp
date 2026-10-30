// Finds `css` bodies that a converted module shares byte for byte with another module. Goober
// hashes the template text, so identical bodies get one class and the position of whichever
// module registers first. Once modules register on import, that can move a rule ahead of its own
// module's siblings (#134: TextBlock's tones and Tag's, Sources' cursor and Calendar's).
import ts from "typescript";

// Each `css` tagged template without substitutions, by its text: one with `${…}` can produce
// different text per module even when the source matches, so it is left out.
function bodiesIn(path, text) {
  const found = [];
  const visit = (node) => {
    if (
      ts.isTaggedTemplateExpression(node) &&
      ts.isIdentifier(node.tag) &&
      node.tag.text === "css" &&
      ts.isNoSubstitutionTemplateLiteral(node.template)
    ) {
      const { line } = node.getSourceFile().getLineAndCharacterOfPosition(node.getStart());
      found.push({ body: node.template.text, line: line + 1 });
    }
    ts.forEachChild(node, visit);
  };
  visit(ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true));
  return found;
}

/**
 * For every body in a `converted` module that also appears in another module, its location and
 * the other modules' locations. `sources` holds every module's path and current text.
 */
export function sharedCssBodies(sources, converted) {
  const byBody = new Map();
  for (const { path, text } of sources)
    for (const { body, line } of bodiesIn(path, text)) {
      if (!body.trim()) continue;
      const places = byBody.get(body) ?? [];
      places.push({ path, line });
      byBody.set(body, places);
    }
  const shared = [];
  for (const places of byBody.values()) {
    const modules = new Set(places.map(({ path }) => path));
    if (modules.size < 2) continue;
    for (const place of places)
      if (converted.has(place.path))
        shared.push({ ...place, others: places.filter(({ path }) => path !== place.path) });
  }
  return shared;
}
