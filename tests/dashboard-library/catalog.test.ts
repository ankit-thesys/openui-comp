import { library } from "@openuidev/dashboard-library-next";
import { createParser } from "@openuidev/react-lang";
import { expect, test } from "vitest";
import { kpis, metricFixtures, metricsProgram } from "./catalog.fixtures";

const parser = createParser(library.toJSONSchema(), "Dashboard");
for (const fixture of [
  ...metricFixtures,
  { name: "compact Kpis", program: kpis(8) },
  { name: "lead strip and Stat", program: metricsProgram },
  {
    name: "Kpis inside Card",
    program:
      'root = Dashboard([Section("", [Row([Card("Summary", [Kpis([Kpi("Users", 1284)])])])])])',
  },
]) {
  test(`catalog program ${fixture.name} parses without dropped nodes`, () => {
    const result = parser.parse(fixture.program);
    expect(result.root?.typeName).toBe("Dashboard");
    expect(result.meta.errors).toEqual([]);
    expect(result.meta.incomplete).toBe(false);
    expect(result.meta.unresolved).toEqual([]);
  });
}
