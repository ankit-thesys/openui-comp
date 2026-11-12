import * as pkg from "@openuidev/dashboard-library";
import { createParser } from "@openuidev/react-lang";
import { expect, test } from "vitest";

const { additionalRules, componentGroups, dashboardComponents, examples, library, promptOptions } =
  pkg;

test("the package exports the library, its theme and its prompt pieces", () => {
  expect(Object.keys(pkg).sort()).toEqual([
    "ThemeProvider",
    "additionalRules",
    "componentGroups",
    "dashboardComponents",
    "examples",
    "library",
    "promptOptions",
  ]);
});

test("promptOptions carries the examples and rules it exports", () => {
  expect(promptOptions.examples).toBe(examples);
  expect(promptOptions.additionalRules).toBe(additionalRules);
  expect(examples).toHaveLength(2);
  // The dashboard's rules are notes on its component groups, which the prompt already carries.
  expect(additionalRules).toEqual([]);
});

for (const [index, example] of examples.entries()) {
  test(`prompt example ${index + 1} parses without dropped or invalid nodes`, () => {
    const result = createParser(library.toJSONSchema(), "Dashboard").parse(example);
    expect(result.root?.typeName).toBe("Dashboard");
    expect(result.meta.errors).toEqual([]);
    expect(result.meta.incomplete).toBe(false);
    expect(result.meta.unresolved).toEqual([]);
    expect(result.meta.orphaned).toEqual([]);
  });
}

test("library.prompt(promptOptions) includes each example", () => {
  const prompt = library.prompt(promptOptions);
  for (const example of examples) expect(prompt).toContain(example);
});

test("dashboardComponents and componentGroups describe the same 41 components as the library", () => {
  const names = dashboardComponents.map((component) => component.name);
  expect(names).toEqual(Object.keys(library.components));
  expect(names).toHaveLength(41);
  expect(componentGroups.map((group) => group.name)).toEqual([
    "Structure",
    "Filters",
    "Metrics",
    "Tables",
    "Trends",
    "Comparison",
    "Composition",
    "Flow",
    "Relationships",
    "Maps",
  ]);
  expect(componentGroups.flatMap((group) => group.components).sort()).toEqual([...names].sort());
});
