import { createParser } from "@openuidev/react-lang";
import { describe, expect, it } from "vitest";
import * as lib from "../lib";
import { library, promptOptions } from "../lib";
import { programs } from "./helpers/cases";

const registered = Object.keys(library.components);

describe("library", () => {
  it("registers 55 components in 6 groups, with Col as root", () => {
    expect(registered).toHaveLength(55);
    expect(library.root).toBe("Col");
    expect(lib.baseComponentGroups).toHaveLength(6);
  });

  it("has 59 functions and one action", () => {
    expect(Object.keys(lib.functions)).toHaveLength(59);
    expect(lib.actions.map((action) => action.name)).toEqual(["CopyToClipboard"]);
  });

  it("exports every definition, so a host can build its own library from them", () => {
    expect(lib.baseComponents.map((component) => component.name).sort()).toEqual([...registered].sort());
  });
});

describe("system prompt", () => {
  it("only changes on purpose", async () => {
    await expect(library.prompt(promptOptions)).toMatchFileSnapshot("./__snapshots__/prompt.txt");
  });
});

describe("programs", () => {
  const parser = createParser(library.toJSONSchema(), library.root);

  it.each(programs)("$id parses cleanly", ({ code }) => {
    const { root, meta } = parser.parse(code);
    expect(meta.errors).toEqual([]);
    expect(meta.unresolved).toEqual([]);
    expect(root).not.toBeNull();
  });

  it("name every registered component", () => {
    const used = new Set(
      programs.flatMap(({ code }) => [...code.matchAll(/\b([A-Z][A-Za-z0-9]*)\s*\(/g)].map((match) => match[1])),
    );
    expect(registered.filter((name) => !used.has(name))).toEqual([]);
  });
});
