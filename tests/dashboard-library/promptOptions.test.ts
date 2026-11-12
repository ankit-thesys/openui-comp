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
  expect(examples).toHaveLength(3);
  expect(additionalRules.length).toBeGreaterThan(0);
});

test("the rules name only components the library has, and rule out the ones it lacks", () => {
  const rules = additionalRules.join("\n");
  const has = (name: string) => name in library.components;
  // Every component a rule tells the model to use.
  for (const name of [
    "Dashboard",
    "FilterBar",
    "Section",
    "Kpis",
    "Kpi",
    "Row",
    "Card",
    "Table",
    "Stat",
    "Goal",
    "KeyValues",
    "PeriodPicker",
    "DateRangeFilter",
    "ChipFilter",
    "SelectFilter",
    "MultiSelectFilter",
    "SearchFilter",
    "CompareToggle",
  ]) {
    expect(rules).toContain(name);
    expect(has(name), name).toBe(true);
  }
  // Every component a rule says the library does not have.
  for (const name of ["Button", "Select", "SelectItem", "Input", "Form", "FormControl", "Tabs"]) {
    expect(rules).toContain(name);
    expect(has(name), name).toBe(false);
  }
});

test("the rules are the reviewed ones", () => {
  expect(additionalRules).toMatchSnapshot();
});

for (const [index, example] of examples.entries()) {
  test(`prompt example ${index + 1} parses without dropped or invalid nodes`, () => {
    // root first, as the prompt asks, so the shell streams in before its data.
    expect(example.startsWith("root = Dashboard(")).toBe(true);
    const result = createParser(library.toJSONSchema(), "Dashboard").parse(example);
    expect(result.root?.typeName).toBe("Dashboard");
    expect(result.meta.errors).toEqual([]);
    expect(result.meta.incomplete).toBe(false);
    expect(result.meta.unresolved).toEqual([]);
    expect(result.meta.orphaned).toEqual([]);
  });
}

test("library.prompt(promptOptions) includes each example and rule", () => {
  const prompt = library.prompt(promptOptions);
  for (const example of examples) expect(prompt).toContain(example);
  for (const rule of additionalRules) expect(prompt).toContain(rule);
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
