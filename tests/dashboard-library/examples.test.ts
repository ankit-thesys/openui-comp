import { library } from "@openuidev/dashboard-library-next";
import { createParser } from "@openuidev/react-lang";
import { expect, test } from "vitest";
import { EXAMPLES } from "./fixtures/examples";

for (const example of EXAMPLES) {
  test(`${example.title} parses without dropped or invalid nodes`, () => {
    const parser = createParser(library.toJSONSchema(), "Dashboard");
    const result = parser.parse(example.source);
    expect(result.root?.typeName).toBe("Dashboard");
    expect(result.meta.errors).toEqual([]);
    expect(result.meta.incomplete).toBe(false);
    expect(result.meta.unresolved).toEqual([]);
    expect(result.meta.orphaned).toEqual([]);
  });
}
