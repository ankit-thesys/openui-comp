import { componentGroups, intelligentComponents, library } from "@openuidev/intelligent-ui-library";
import { createParser } from "@openuidev/react-lang";
import { expect, test } from "@playwright/test";
import gallery from "../fixtures/gallery.json" with { type: "json" };

// The counts the library ships with (#199): a change here is a change to the library's surface.
const registered = Object.keys(library.components);

test.describe("the library's surface", () => {
  test("registers 52 components in 6 groups, with Col as root", () => {
    // 55 until f9d86dd5 removed Map, MapMarker and SearchImage.
    expect(registered).toHaveLength(52);
    expect(library.root).toBe("Col");
    expect(componentGroups).toHaveLength(6);
  });

  test("puts every component in exactly one group", () => {
    const grouped = componentGroups.flatMap((group) => group.components);
    expect([...grouped].sort()).toEqual([...registered].sort());
  });

  test("has 59 @functions and one action, CopyToClipboard", () => {
    expect(Object.keys(library.functions ?? {})).toHaveLength(59);
    expect(Object.keys(library.actions ?? {})).toEqual(["CopyToClipboard"]);
  });

  test("exports every definition, so a host can build its own library from them", () => {
    expect(intelligentComponents.map((component) => component.name).sort()).toEqual(
      [...registered].sort(),
    );
  });
});

test.describe("the gallery programs", () => {
  const parser = createParser(library.toJSONSchema(), library.root);

  test("each parse cleanly", () => {
    const problems = gallery.flatMap(({ id, code }) => {
      const { root, meta } = parser.parse(code);
      const found = [
        ...meta.errors.map((error) => `error: ${JSON.stringify(error)}`),
        ...meta.unresolved.map((name) => `unresolved: ${name}`),
        ...(root ? [] : ["no root"]),
      ];
      return found.map((problem) => `${id}: ${problem}`);
    });
    expect(problems).toEqual([]);
  });

  test("name every registered component", () => {
    const used = new Set(
      gallery.flatMap(({ code }) =>
        [...code.matchAll(/\b([A-Z][A-Za-z0-9]*)\s*\(/g)].map((match) => match[1]),
      ),
    );
    expect(registered.filter((name) => !used.has(name))).toEqual([]);
  });
});
