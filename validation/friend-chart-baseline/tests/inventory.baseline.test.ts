/**
 * The inventory is DERIVED FROM SOURCE, not from documentation, and this test
 * is what keeps it honest: it parses the package's own chart barrel and fails
 * if any exported chart component is missing from the fixture registry.
 *
 * So "every family is covered" is not a claim in a markdown file that can rot —
 * it is an assertion that breaks the moment a family is added or renamed.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import * as Charts from "../../../packages/react-ui/src/components/Charts";
import { FAMILY_NAMES } from "../fixtures/families";

const BARREL = fileURLToPath(
  new URL("../../../packages/react-ui/src/components/Charts/index.ts", import.meta.url),
);

/** Value (non-type) exports of the chart barrel, read from the file itself. */
function declaredValueExports(): string[] {
  const src = readFileSync(BARREL, "utf8");
  const names: string[] = [];
  // `export { A, B } from "./X";` — but NOT `export type { ... }`.
  for (const m of src.matchAll(/export\s+(?!type\b)\{([^}]*)\}\s+from/g)) {
    for (const part of (m[1] ?? "").split(",")) {
      const name = part.trim().split(/\s+as\s+/).pop()?.trim();
      if (name) names.push(name);
    }
  }
  return [...new Set(names)].sort();
}

/**
 * Exported values that are NOT chart components, each with the reason it is
 * excluded from the per-family render matrix. Listing them explicitly (rather
 * than filtering by a name pattern) means a newly added export cannot slip
 * through unnoticed — it will fail the completeness test until classified.
 */
const NON_FAMILY_EXPORTS: Record<string, string> = {
  LegendStoreProvider: "Context provider for the shared legend store, not a chart.",
  useLegendEntry: "Hook for publishing a legend entry.",
  StackedLegend: "Standalone legend renderer driven by the legend store.",
  CHART_CLASS_PREFIX: "String constant used to build class names.",
  calculateScatterDomain: "ScatterChart helper function.",
  formatScatterTooltipValue: "ScatterChart helper function.",
  getScatterDatasets: "ScatterChart helper function.",
  transformScatterData: "ScatterChart helper function.",
};

describe("inventory completeness", () => {
  it("every chart component exported by the barrel is in the fixture registry", () => {
    const declared = declaredValueExports();
    const families = declared.filter((n) => !(n in NON_FAMILY_EXPORTS));
    const missing = families.filter((n) => !FAMILY_NAMES.includes(n));
    expect(missing, "exported chart components with no fixture case").toEqual([]);
  });

  it("the registry invents nothing: every entry is a real export", () => {
    const declared = declaredValueExports();
    const unknown = FAMILY_NAMES.filter((n) => !declared.includes(n));
    expect(unknown, "registry entries that the barrel does not export").toEqual([]);
  });

  it("every declared value export actually resolves at runtime", () => {
    for (const name of declaredValueExports()) {
      expect(Charts, `Charts.${name}`).toHaveProperty(name);
      expect((Charts as Record<string, unknown>)[name], `Charts.${name} is defined`).toBeDefined();
    }
  });

  it("records the exact family count covered", () => {
    // 19 components across 14 source directories: the extra five are the
    // thin wrappers (Area/Line/Bar Condensed, HorizontalBarChart,
    // SingleStackedBar) that preset props on a sibling.
    expect(FAMILY_NAMES).toHaveLength(19);
    expect(declaredValueExports().filter((n) => !(n in NON_FAMILY_EXPORTS))).toHaveLength(19);
  });

  it("non-family exports are all accounted for with a reason", () => {
    const declared = declaredValueExports();
    const unclassified = Object.keys(NON_FAMILY_EXPORTS).filter((n) => !declared.includes(n));
    expect(unclassified, "classified exports that no longer exist").toEqual([]);
  });
});
