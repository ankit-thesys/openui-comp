/**
 * Default-render evidence: every exported chart family, on the deterministic
 * datasets, with its default props.
 *
 * Each family's markup is recorded under evidence/ssr/<Family>.html so a
 * migration reviewer can diff a new implementation's output against the
 * baseline byte for byte. The assertions below are deliberately about
 * OBSERVABLE output — root class, mark counts, rendered label text — and never
 * about internal state, hook calls or component structure.
 */
import { describe, expect, it } from "vitest";
import { FAMILIES } from "../fixtures/families";
import { countMarks, isDegeneratePath, renderAndRecord, textNodes } from "../fixtures/ssr";

describe("default render", () => {
  it.each(FAMILIES.map((f) => [f.name, f] as const))("%s renders its container", (name, family) => {
    const html = renderAndRecord(name, family.render());

    // The family's own container class is present somewhere in the tree. It is
    // not always the ROOT: PieChart/RadialChart default to
    // `legendVariant="stacked"`, which wraps them in a shared legend container.
    expect(html).toContain(family.chartClass);
    expect(html).not.toContain(`${family.chartClass} openui-chart-empty`);
  });

  it.each(FAMILIES.map((f) => [f.name, f] as const))("%s draws marks", (name, family) => {
    const html = renderAndRecord(name, family.render());
    // SegmentedBar/SingleStackedBar draw with CSS divs, not SVG marks, so the
    // floor is per-technology rather than a single global number.
    const marks = countMarks(html);
    if (family.chartClass === "openui-segmented-bar-container") {
      const segments = (html.match(/openui-segmented-bar-segment"/g) ?? []).length;
      expect(segments, `${name} should draw one div per segment`).toBe(4);
    } else {
      expect(marks, `${name} should draw at least one SVG mark`).toBeGreaterThan(0);
    }
  });

  it.each(FAMILIES.map((f) => [f.name, f] as const))(
    "%s draws no degenerate zero-area paths",
    (name, family) => {
      const html = renderAndRecord(name, family.render());
      const ds = [...html.matchAll(/ d="([^"]*)"/g)].map((m) => m[1] ?? "");
      // A share-of-total family emits `M0,-rL0,0Z` stubs when every value
      // resolves to 0 — the signature of a mis-wired `dataKey`. Real default
      // cases must not contain them.
      const degenerate = ds.filter(isDegeneratePath);
      expect(degenerate, `${name} emitted degenerate slice paths`).toEqual([]);
    },
  );

  it("row-shaped families print their category labels", () => {
    // The six months are the x-axis categories; a family that renders category
    // text must render all six, in data order.
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const withCategories = ["AreaChart", "LineChart", "BarChart", "RadarChart", "HeatmapChart"];
    for (const name of withCategories) {
      const family = FAMILIES.find((f) => f.name === name)!;
      const texts = textNodes(renderAndRecord(name, family.render()));
      const found = months.filter((m) => texts.includes(m));
      expect(found, `${name} category labels`).toEqual(months);
    }
  });

  it("share-of-total families print their segment labels and shares", () => {
    const family = FAMILIES.find((f) => f.name === "SegmentedBar")!;
    const html = renderAndRecord("SegmentedBar", family.render());
    // 400/300/200/100 of 1000 → exact, not rounded-and-hoped-for.
    for (const pct of ["40.0", "30.0", "20.0", "10.0"]) expect(html).toContain(pct);
    for (const b of ["Chrome", "Safari", "Firefox", "Edge"]) expect(html).toContain(b);
  });
});
