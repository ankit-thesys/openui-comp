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

// The filters and the prop each is connected through ($binding<string> in its signature).
const BINDING: Record<string, string> = {
  PeriodPicker: "value",
  DateRangeFilter: "value",
  ChipFilter: "value",
  SelectFilter: "value",
  MultiSelectFilter: "value",
  SearchFilter: "value",
};

type Wiring = {
  filters: { filter: string; binding: unknown }[];
  refs: string[];
  types: string[];
  previous: number;
};

function wiring(source: string): Wiring {
  const result = createParser(library.toJSONSchema(), "Dashboard").parse(source);
  const found: Wiring = { filters: [], refs: [], types: [], previous: 0 };
  (function walk(node: unknown) {
    if (Array.isArray(node)) return node.forEach(walk);
    if (!node || typeof node !== "object") return;
    const record = node as Record<string, unknown>;
    if (record["k"] === "StateRef" && typeof record["n"] === "string") found.refs.push(record["n"]);
    const typeName = record["typeName"];
    if (record["type"] === "element" && typeof typeName === "string") {
      found.types.push(typeName);
      const props = (record["props"] ?? {}) as Record<string, unknown>;
      const prop = BINDING[typeName];
      if (prop) found.filters.push({ filter: typeName, binding: props[prop] });
      if (props["previous"] !== undefined && props["previous"] !== null) found.previous += 1;
    }
    Object.values(record).forEach(walk);
  })([result.root, result.queryStatements]);
  return found;
}

// A model copies the examples, so a filter in one must be wired the way the rules ask: bound
// through its $binding, its $variable read by something it changes, and a CompareToggle backed
// by previous values. Each of these, left out, drew a control that changed nothing.
for (const [index, example] of examples.entries()) {
  test(`prompt example ${index + 1} wires every filter to what it changes`, () => {
    const { filters, refs, types, previous } = wiring(example);
    for (const { filter, binding } of filters) {
      expect(binding, `${filter} has no $binding`).toMatchObject({ k: "StateRef" });
      const name = (binding as { n: string }).n;
      // One reference is the filter's own binding; another is whatever it changes.
      expect(
        refs.filter((ref) => ref === name).length,
        `${filter} ${name} is never read`,
      ).toBeGreaterThan(1);
    }
    if (types.includes("CompareToggle")) expect(previous).toBeGreaterThan(0);
  });
}

test("the wiring check catches a filter left unbound or unread", () => {
  const unbound = wiring(
    `$q = ""\nroot = Dashboard([FilterBar([SearchFilter("q", "Search")]), Section("S", [Row([Card("T", [Table([Column("A", ["x"], "primary")], 10, false, $q)], "full")])])])`,
  );
  expect(unbound.filters[0]?.binding).toBeUndefined();
  const unread = wiring(
    `$n = "30"\nroot = Dashboard([FilterBar([ChipFilter("n", [{value: "10"}, {value: "30"}], $n, "Show")]), Section("S", [Row([Card("T", [Table([Column("A", ["x"], "primary")], 10)], "full")])])])`,
  );
  expect(unread.refs.filter((ref) => ref === "$n")).toHaveLength(1);
});
