/**
 * Empty-data behaviour: every family rendered with `data={[]}`.
 *
 * This is recorded, not prescribed. The families do NOT share one empty
 * contract, and the differences below are the baseline fact a migration has to
 * either preserve or deliberately change. Each case records its own markup
 * under evidence/ssr/<Family>.empty.html.
 */
import { describe, expect, it } from "vitest";
import { FAMILIES } from "../fixtures/families";
import { countMarks, renderAndRecord } from "../fixtures/ssr";

/** Families that render the shared "No data available" placeholder. */
const PLACEHOLDER_TEXT = "No data available";

const results: Array<{ name: string; placeholder: boolean; marks: number; bytes: number }> = [];

describe("empty data", () => {
  it.each(FAMILIES.map((f) => [f.name, f] as const))("%s renders without throwing", (name, f) => {
    expect(() => renderAndRecord(`${name}.empty`, f.renderEmpty!())).not.toThrow();
  });

  it.each(FAMILIES.map((f) => [f.name, f] as const))("%s empty-state shape", (name, f) => {
    const html = renderAndRecord(`${name}.empty`, f.renderEmpty!());
    const placeholder = html.includes(PLACEHOLDER_TEXT);
    results.push({ name, placeholder, marks: countMarks(html), bytes: html.length });
    // The one invariant every family must hold: an empty dataset must not
    // produce a chart full of marks drawn from nothing.
    if (!placeholder) {
      expect(
        countMarks(html),
        `${name} shows no placeholder AND draws ${countMarks(html)} marks`,
      ).toBeLessThan(12);
    }
    expect(html.length).toBeGreaterThan(0);
  });

  it("records which families use the shared placeholder", () => {
    // Snapshot of the real split, so a migration notices if a family changes
    // which side it is on. Asserting the exact partition makes the difference
    // visible rather than silently tolerated.
    const withPlaceholder = results.filter((r) => r.placeholder).map((r) => r.name).sort();
    const without = results.filter((r) => !r.placeholder).map((r) => r.name).sort();
    expect({ withPlaceholder, without }).toMatchSnapshot();
  });
});
