import { library } from "@openuidev/dashboard-library-next";
import { createParser } from "@openuidev/react-lang";
import { expect, test } from "vitest";
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

test("the prompt offers his slots: Stat in a Card, Kpis in a Section, a FilterBar first", () => {
  // The parser doesn't check which components sit in a slot; the prompt is what tells the model.
  const prompt = library.prompt();
  expect(prompt).toContain("Card(title: string, content: Stat[], ");
  expect(prompt).toContain("Section(title: string, rows: (Kpis | Row)[], ");
  expect(prompt).toContain("Dashboard(children: (FilterBar | Section)[])");
});
