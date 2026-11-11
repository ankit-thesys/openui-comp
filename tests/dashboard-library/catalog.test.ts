import { library } from "@openuidev/dashboard-library";
import { createParser } from "@openuidev/react-lang";
import { expect, test } from "vitest";
import { catalogComponents, HIS_COMPONENTS } from "./catalogCoverage";
import { catalogFixtures } from "./fixtures";
import { kpis, metricsProgram } from "./fixtures/metrics";

const parser = createParser(library.toJSONSchema(), "Dashboard");

for (const fixture of [
  ...catalogFixtures,
  { name: "compact Kpis", program: kpis(8) },
  { name: "lead strip and Stat", program: metricsProgram },
]) {
  test(`catalog program ${fixture.name} parses without dropped nodes`, () => {
    const result = parser.parse(fixture.program);
    expect(result.root?.typeName).toBe("Dashboard");
    expect(result.meta.errors).toEqual([]);
    expect(result.meta.incomplete).toBe(false);
    expect(result.meta.unresolved).toEqual([]);
  });
}

/** What his Card holds, in his order (components/layout.tsx): written out here, not imported. */
const HIS_CARD_CONTENT = [
  "Stat",
  "TimeSeries",
  "SmallMultiples",
  "Bars",
  "Dumbbell",
  "Distribution",
  "Donut",
  "Treemap",
  "Waterfall",
  "Intervals",
  "StatusTimeline",
  "Flow",
  "Scatter",
  "GeoMap",
  "PointMap",
  "Funnel",
  "Cohorts",
  "Heatmap",
  "Table",
  "Leaderboard",
  "Goal",
  "SegmentedBar",
  "KeyValues",
];

/** The component names in one argument of a signature: "content: (A | B)[]" or "content: A[]". */
function slot(prompt: string, component: string, argument: string): string[] {
  const line = prompt.split("\n").find((text) => text.startsWith(`${component}(`))!;
  const match = new RegExp(`${argument}\\??: \\(?([\\w |]+?)\\)?\\[\\]`).exec(line);
  return match ? match[1]!.split(" | ") : [];
}

// Every group adds to Card's content, so this checks his rule rather than a list: whatever is
// registered so far, in his order. A group ticket never needs to edit it.
test("the prompt offers his slots, in his order, whatever is registered", () => {
  // The parser doesn't check which components sit in a slot; the prompt is what tells the model.
  const prompt = library.prompt();
  const content = slot(prompt, "Card", "content");
  expect(content[0]).toBe("Stat");
  expect(content.every((name) => HIS_CARD_CONTENT.includes(name))).toBe(true);
  const order = content.map((name) => HIS_CARD_CONTENT.indexOf(name));
  expect(order).toEqual([...order].sort((a, b) => a - b));
  expect(slot(prompt, "Card", "controls")).toEqual(["ChipFilter", "SelectFilter"]);
  expect(slot(prompt, "Section", "rows")).toEqual(["Kpis", "Row"]);
  expect(slot(prompt, "Dashboard", "children")).toEqual(["FilterBar", "Section"]);
});

test("each component is registered and listed once", () => {
  const prompt = library.prompt();
  const signatures = prompt
    .split("\n")
    .map((line) => /^([A-Z]\w*)\(/.exec(line)?.[1])
    .filter((name): name is string => !!name);
  expect(signatures.length).toBeGreaterThan(0);
  expect(new Set(signatures).size).toBe(signatures.length);
});

test("every registered component appears in a valid catalog fixture", () => {
  const covered = new Set(
    catalogFixtures.flatMap((fixture) => [...catalogComponents(fixture.program)]),
  );
  const missing = Object.keys(library.components).filter((name) => !covered.has(name));
  expect(missing, "Registered components missing from the catalog").toEqual([]);
});

test("the library registers all 41 of his components", () => {
  const registered = Object.keys(library.components);
  expect(HIS_COMPONENTS).toHaveLength(41);
  expect(
    HIS_COMPONENTS.filter((name) => !registered.includes(name)),
    "Components still to port",
  ).toEqual([]);
  expect(registered).toHaveLength(41);
});
