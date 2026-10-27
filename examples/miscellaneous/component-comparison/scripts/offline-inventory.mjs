import fs from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { createParser } from "@openuidev/lang-core";
import { demoSource, directExamples } from "../src/offline-fixture.mjs";

export function inspectFixture(spec) {
  const entries = new Map();
  const parser = createParser(spec.schema, spec.root);
  const results = [];
  for (const example of [
    { name: "Shared response", source: demoSource },
    ...directExamples,
  ]) {
    const parsed = parser.parse(example.source);
    results.push({ example: example.name, ...parsed.meta });
    function visit(value, path = "root", parent = null) {
      if (!value || typeof value !== "object") return;
      if (value.type === "element") {
        if (!entries.has(value.typeName))
          entries.set(value.typeName, {
            name: value.typeName,
            example: example.name,
            delivery:
              example.name === "Shared response"
                ? "instant and local stream"
                : "direct",
            nested: parent !== null,
            parent,
            path,
          });
        for (const [key, child] of Object.entries(value.props))
          visit(child, `${path}.${value.typeName}.${key}`, value.typeName);
      } else if (Array.isArray(value))
        value.forEach((child, i) => visit(child, `${path}[${i}]`, parent));
      else
        for (const [key, child] of Object.entries(value))
          visit(child, `${path}.${key}`, parent);
    }
    visit(parsed.root);
  }
  return {
    entries: [...entries.values()].sort((a, b) => a.name.localeCompare(b.name)),
    results,
  };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const spec = JSON.parse(
    await fs.readFile(".generated/migrated.json", "utf8"),
  );
  await fs.writeFile(
    "offline-inventory.json",
    JSON.stringify(inspectFixture(spec).entries, null, 2) + "\n",
  );
}
