/**
 * Legend behaviour, and the accessibility surface, as far as SSR observes them.
 *
 * Interaction RESULTS (hover tooltips, legend-toggle hiding a series) are not
 * here: they need a DOM and event dispatch, which this environment has not got.
 * They are covered in the browser — see evidence/interactions.json and
 * reports/COVERAGE-MATRIX.md. What SSR can prove is the interaction SURFACE:
 * that the handles an interaction needs are present and correctly labelled.
 */
import { describe, expect, it } from "vitest";
import {
  AreaChart,
  BarChart,
  PieChart,
  RadialChart,
} from "../../../packages/react-ui/src/components/Charts";
import { MULTI_SERIES_ROWS, SHARE_ROWS, SIZES } from "../fixtures/datasets";
import { FAMILIES } from "../fixtures/families";
import { renderAndRecord } from "../fixtures/ssr";

const rows = MULTI_SERIES_ROWS as unknown as Array<Record<string, string | number>>;
const share = SHARE_ROWS as unknown as Array<Record<string, string | number>>;
const SERIES = ["desktop", "mobile", "tablet"];

const legendLabels = (html: string) =>
  [...html.matchAll(/class="openui-chart-legend-item-label">([^<]*)</g)].map((m) => m[1]);

describe("legend", () => {
  it("lists one item per series, in data-key order", () => {
    const html = renderAndRecord("legend.area.on", <AreaChart data={rows} categoryKey="month" {...SIZES.standard} />);
    expect(legendLabels(html)).toEqual(SERIES);
  });

  it("legend={false} removes the legend container entirely", () => {
    const off = renderAndRecord(
      "legend.area.off",
      <AreaChart data={rows} categoryKey="month" legend={false} {...SIZES.standard} />,
    );
    expect(off).not.toContain("openui-chart-legend-container");
    expect(legendLabels(off)).toEqual([]);
  });

  it("legend={false} also hides the axis captions (documented coupling)", () => {
    // BaseChartProps documents this: xAxisLabel/yAxisLabel render INSIDE the
    // legend strip, so turning the legend off takes them with it
    // (Charts/types/common.ts:30-34, 45).
    const on = renderAndRecord(
      "legend.axisLabels.on",
      <AreaChart data={rows} categoryKey="month" xAxisLabel="Month" yAxisLabel="Users" {...SIZES.standard} />,
    );
    const off = renderAndRecord(
      "legend.axisLabels.off",
      <AreaChart
        data={rows}
        categoryKey="month"
        xAxisLabel="Month"
        yAxisLabel="Users"
        legend={false}
        {...SIZES.standard}
      />,
    );
    expect(on).toContain("Month");
    expect(on).toContain("Users");
    expect(off).not.toContain("Month");
    expect(off).not.toContain("Users");
  });

  it("legend items advertise themselves as clickable", () => {
    const html = renderAndRecord("legend.bar.on", <BarChart data={rows} categoryKey="month" {...SIZES.standard} />);
    // The toggle affordance: each item carries cursor:pointer. Whether the
    // click actually hides the series is verified in the browser.
    const items = [...html.matchAll(/class="openui-chart-legend-item"[^>]*style="([^"]*)"/g)].map(
      (m) => m[1],
    );
    expect(items).toHaveLength(SERIES.length);
    for (const style of items) expect(style).toContain("cursor:pointer");
  });

  it("Pie and Radial leave their stacked legend EMPTY server-side", () => {
    // Their default `legendVariant="stacked"` publishes entries into a legend
    // store that is filled from an effect, so the legend container renders but
    // its contents do not exist until hydration. Recorded as a limitation, not
    // a defect — the browser pass confirms the legend is populated there.
    for (const [name, el] of [
      ["PieChart", <PieChart data={share} categoryKey="browser" dataKey="visitors" {...SIZES.square} />],
      ["RadialChart", <RadialChart data={share} categoryKey="browser" dataKey="visitors" {...SIZES.square} />],
    ] as const) {
      const html = renderAndRecord(`legend.${name}.stacked`, el);
      expect(html).toContain("openui-chart-with-stacked-legend__legend");
      expect(html).toMatch(/openui-chart-with-stacked-legend__legend"><\/div>/);
      expect(legendLabels(html)).toEqual([]);
    }
  });

  it("SegmentedBar's inline legend IS populated server-side", () => {
    // Contrast with Pie/Radial above: SegmentedBar's default legend renders its
    // labels and shares directly, no store round-trip.
    const family = FAMILIES.find((f) => f.name === "SegmentedBar")!;
    const html = renderAndRecord("legend.segmented", family.render());
    expect(legendLabels(html)).toEqual(["Chrome", "Safari", "Firefox", "Edge"]);
  });
});

describe("accessibility surface", () => {
  it.each(
    FAMILIES.filter((f) => f.chartClass !== "openui-segmented-bar-container").map(
      (f) => [f.name, f] as const,
    ),
  )("%s labels its chart svg for assistive tech", (name, family) => {
    const html = renderAndRecord(name, family.render());
    expect(html, `${name} should expose role="img"`).toContain('role="img"');
    const labels = [...html.matchAll(/aria-label="([^"]*)"/g)].map((m) => m[1]);
    expect(labels.filter(Boolean).length, `${name} aria-label`).toBeGreaterThan(0);
  });

  it("SegmentedBar labels its bar instead of an svg", () => {
    const family = FAMILIES.find((f) => f.name === "SegmentedBar")!;
    const html = renderAndRecord("SegmentedBar", family.render());
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Segmented bar"');
  });
});
