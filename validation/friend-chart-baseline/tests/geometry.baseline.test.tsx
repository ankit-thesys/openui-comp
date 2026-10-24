/**
 * Observable-geometry assertions.
 *
 * These check drawn coordinates against values derived from the fixture data
 * independently — not against whatever the component happened to emit. Where a
 * number is a recorded baseline rather than a derivable truth it is called out
 * in a comment, so a reviewer can tell the two apart.
 */
import { describe, expect, it } from "vitest";
import {
  PieChart,
  ScatterChart,
  SegmentedBar,
} from "../../../packages/react-ui/src/components/Charts";
import { MULTI_SERIES_ROWS, SCATTER_DATASETS, SHARE_ROWS, SIZES } from "../fixtures/datasets";
import { FAMILIES } from "../fixtures/families";
import { attrValues, countTag, renderAndRecord } from "../fixtures/ssr";

const share = SHARE_ROWS as unknown as Array<Record<string, string | number>>;
const render = (name: string, el: React.ReactElement) => renderAndRecord(name, el);

describe("PieChart slice geometry", () => {
  /**
   * The pie starts at 12 o'clock and sweeps clockwise, so the boundary between
   * slice i and i+1 sits at the cumulative share angle:
   *   theta = 2*PI * (cumulative value / total)
   *   x =  r * sin(theta)      y = -r * cos(theta)
   * r is read from the emitted path (the radius the component chose); the
   * ANGLES are derived from the data alone, which is the part under test.
   */
  it("places every slice boundary at its cumulative share angle", () => {
    const html = render("PieChart.geometry", (
      <PieChart data={share} categoryKey="browser" dataKey="visitors" {...SIZES.square} />
    ));

    // Arc commands: "M<x0>,<y0>A<r>,<r>,0,<laf>,1,<x1>,<y1>L0,0Z"
    const arcs = [
      ...html.matchAll(
        /M(-?[\d.]+),(-?[\d.]+)A([\d.]+),[\d.]+,\d+,(\d),1,(-?[\d.]+),(-?[\d.]+)L0,0Z/g,
      ),
    ];
    // Each slice is emitted twice (a transparent hit area + the filled shape).
    const unique = [...new Set(arcs.map((m) => m[0]))];
    expect(unique).toHaveLength(4);

    const r = Number(arcs[0][3]);
    const total = share.reduce((s, row) => s + Number(row.visitors), 0);
    expect(total).toBe(1000);

    let cumulative = 0;
    unique.forEach((d, i) => {
      const m = d.match(
        /M(-?[\d.]+),(-?[\d.]+)A([\d.]+),[\d.]+,\d+,(\d),1,(-?[\d.]+),(-?[\d.]+)L0,0Z/,
      )!;
      const startAngle = (2 * Math.PI * cumulative) / total;
      cumulative += Number(share[i].visitors);
      const endAngle = (2 * Math.PI * cumulative) / total;

      expect(Number(m[1])).toBeCloseTo(r * Math.sin(startAngle), 2);
      expect(Number(m[2])).toBeCloseTo(-r * Math.cos(startAngle), 2);
      expect(Number(m[5])).toBeCloseTo(r * Math.sin(endAngle), 2);
      expect(Number(m[6])).toBeCloseTo(-r * Math.cos(endAngle), 2);

      // large-arc-flag must be set exactly when the slice exceeds half the pie.
      const sweep = endAngle - startAngle;
      expect(Number(m[4]), `large-arc-flag for slice ${i}`).toBe(sweep > Math.PI ? 1 : 0);
    });
  });
});

describe("SegmentedBar share geometry", () => {
  it("sizes each segment to its exact share of the total", () => {
    const html = render("SegmentedBar.geometry", (
      <SegmentedBar data={share} categoryKey="browser" dataKey="visitors" />
    ));
    const total = share.reduce((s, row) => s + Number(row.visitors), 0);
    const expected = share.map((row) => `width:${(Number(row.visitors) / total) * 100}%`);
    expect(expected).toEqual(["width:40%", "width:30%", "width:20%", "width:10%"]);
    for (const w of expected) expect(html).toContain(w);
  });
});

describe("ScatterChart point geometry", () => {
  it("draws one dot per point and maps x linearly across the plot", () => {
    const html = render("ScatterChart.geometry", (
      <ScatterChart data={SCATTER_DATASETS as never} {...SIZES.standard} />
    ));
    const points = SCATTER_DATASETS.flatMap((d) => d.data);
    expect(countTag(html, "circle")).toBe(points.length);

    const cx = attrValues(html, "cx").map(Number);
    const xs = points.map((p) => p.x);
    // A linear x-scale must preserve the data's ordering and equal spacing:
    // our xs are 10,20,30,40 and 15,25,35,45 — equal 10-unit steps within each
    // dataset, so consecutive cx deltas within a dataset must be equal.
    const first = cx.slice(0, 4);
    const deltas = first.slice(1).map((v, i) => v - first[i]);
    for (const d of deltas) expect(d).toBeCloseTo(deltas[0], 6);
    expect(deltas[0]).toBeGreaterThan(0);
    expect(xs.length).toBe(8);
  });
});

describe("BarChart mark counts", () => {
  it("draws one bar per (category, series) pair", () => {
    const family = FAMILIES.find((f) => f.name === "BarChart")!;
    const html = render("BarChart.geometry", family.render());
    const categories = MULTI_SERIES_ROWS.length; // 6
    const seriesKeys = Object.keys(MULTI_SERIES_ROWS[0]).filter((k) => k !== "month"); // 3
    // Exact class match: `openui-bar-chart-bars` is the GROUP container, and a
    // prefix match would count it as a 19th bar.
    const bars = (html.match(/class="openui-bar-chart-bar"/g) ?? []).length;
    expect(bars).toBe(categories * seriesKeys.length);
  });
});

describe("y-axis scale", () => {
  /**
   * The point of interest is the DOMAIN, not the tick labels. d3 emits labelled
   * ticks at round values only — here 0..600 by 100 — while the scale's domain
   * runs to the stacked maximum of 605. So the top of the Feb stack is drawn
   * slightly ABOVE the last gridline, which is correct (nothing is clipped) and
   * is recorded here as baseline behaviour rather than asserted as a bug.
   *
   * The scale is reconstructed from two tick labels and their y coordinates,
   * then used to check that the topmost drawn pixel really is the stacked max.
   */
  it("AreaChart's y-scale covers the stacked maximum, above the last tick", () => {
    const family = FAMILIES.find((f) => f.name === "AreaChart")!;
    const html = render("AreaChart.geometry", family.render());

    const ticks = [
      ...html.matchAll(/class="openui-area-chart-y-tick" x="[^"]*" y="([^"]*)"[^>]*>([^<]*)</g),
    ].map((m) => ({ y: Number(m[1]), value: Number(m[2]) }));
    expect(ticks.length).toBeGreaterThan(1);

    // Ascending in value, descending in y (screen coordinates grow downward).
    for (let i = 1; i < ticks.length; i++) {
      expect(ticks[i].value).toBeGreaterThan(ticks[i - 1].value);
      expect(ticks[i].y).toBeLessThan(ticks[i - 1].y);
    }

    const lo = ticks[0];
    const hi = ticks[ticks.length - 1];
    const pxPerUnit = (lo.y - hi.y) / (hi.value - lo.value);
    const valueAt = (y: number) => lo.value + (lo.y - y) / pxPerUnit;

    // AreaChart stacks by default: the tallest column is Feb.
    const stackedMax = Math.max(...MULTI_SERIES_ROWS.map((r) => r.desktop + r.mobile + r.tablet));
    expect(stackedMax).toBe(605);

    // The topmost drawn y across the series paths maps back to the stacked max.
    const ds = [...html.matchAll(/class="openui-area-chart-area-path"[^>]*d="([^"]+)"/g)].map(
      (m) => m[1],
    );
    expect(ds.length).toBeGreaterThan(0);
    const topY = Math.min(
      ...ds.flatMap((d) =>
        [...d.matchAll(/[,C](-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g)].map((m) => Number(m[2])),
      ),
    );
    expect(valueAt(topY)).toBeCloseTo(stackedMax, 1);

    // ...and that peak really is above the highest gridline, not clipped to it.
    expect(topY).toBeLessThan(hi.y);
    expect(hi.value).toBe(600);
  });
});
