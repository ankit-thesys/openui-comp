import { createParser } from "@openuidev/react-lang";
import { describe, expect, it } from "vitest";
import * as lib from "../lib";
import { openuiDashboardLibrary, openuiDashboardPromptOptions } from "../lib";
import { cases } from "./helpers/cases";
import { lintPrompt } from "./helpers/promptLint";

const registered = Object.keys(openuiDashboardLibrary.components);
const prompt = openuiDashboardLibrary.prompt(openuiDashboardPromptOptions);

describe("library", () => {
  it("exports the public names", () => {
    expect(Object.keys(lib).sort()).toEqual([
      "dashboardComponents",
      "openuiDashboardAdditionalRules",
      "openuiDashboardComponentGroups",
      "openuiDashboardExamples",
      "openuiDashboardLibrary",
      "openuiDashboardPromptOptions",
    ]);
  });

  it("registers 48 components with Dashboard as root", () => {
    expect(registered).toHaveLength(48);
    expect(openuiDashboardLibrary.root).toBe("Dashboard");
    expect(lib.openuiDashboardComponentGroups).toHaveLength(6);
  });
});

describe("system prompt", () => {
  it("only changes on purpose", async () => {
    await expect(prompt).toMatchFileSnapshot("./__snapshots__/prompt.txt");
  });

  it("makes no claim about argument order that its signatures contradict", () => {
    const { checked, problems } = lintPrompt(prompt);
    expect(checked).toBeGreaterThan(0);
    expect(problems).toEqual([]);
  });

  it("linter catches the defects the prompt used to ship", () => {
    const sig =
      "PieChart(labels: string[], values: number[], variant?: string, legend?: string, height?: number, appearance?: string)";
    const wrongOrdinal = `${sig}\nalways pass appearance "semiCircular" as the fifth PieChart argument`;
    expect(lintPrompt(wrongOrdinal).problems).toHaveLength(1);

    const card =
      "OverviewCardItem(title: string, subtitle?: string, icon?: string, imageSrc?: string, imageAlt?: string, value?: string)";
    const wrongList = `${card}\nuse OverviewCardItem(title, subtitle, icon, imageSrc, value)`;
    expect(lintPrompt(wrongList).problems).toHaveLength(1);
  });
});

describe("programs", () => {
  const parser = createParser(openuiDashboardLibrary.toJSONSchema(), openuiDashboardLibrary.root);

  it.each(cases)("$id parses cleanly", ({ program }) => {
    const { root, meta } = parser.parse(program);
    expect(meta.errors).toEqual([]);
    expect(meta.unresolved).toEqual([]);
    expect(root?.typeName).toBe("Dashboard");
  });

  it("name every registered component", () => {
    const used = new Set(
      cases.flatMap(({ program }) =>
        [...program.matchAll(/\b([A-Z][A-Za-z0-9]*)\s*\(/g)].map((match) => match[1]),
      ),
    );
    expect(registered.filter((name) => !used.has(name))).toEqual([]);
  });
});
