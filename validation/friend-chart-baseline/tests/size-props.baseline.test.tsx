/**
 * Size-PROP responsiveness, for every family that accepts explicit sizes.
 *
 * This exists because of a review correction to PR #22: the coverage matrix
 * marked AreaChartCondensed, LineChart, LineChartCondensed and BarChartCondensed
 * as "size-prop verified" when the only dimension-changing test covered
 * AreaChart and BarChart. A fixed-size default render is NOT responsive
 * evidence. Rather than demote those four, this drives the comparison across
 * the whole registry so the claim is true for every family that makes it.
 *
 * IMPORTANT — what this does and does not show. This is the EXPLICIT SIZE-PROP
 * path only: the chart is told its size and never measures anything, because
 * `useContainerSize` (hooks/core/useContainerSize.ts:13-14) returns numeric
 * width/height verbatim. CONTAINER-DRIVEN responsiveness — the real
 * ResizeObserver path, where the chart measures a box it was not told about —
 * is a different mechanism and is covered separately in the browser; see
 * tests/browser/ and reports/COVERAGE-MATRIX.md. The two are never conflated.
 */
import { describe, expect, it } from "vitest";
import { PieChart, RadialChart } from "../../../packages/react-ui/src/components/Charts";
import { SHARE_ROWS } from "../fixtures/datasets";
import { FAMILIES } from "../fixtures/families";
import { maxDrawnX, renderAndRecord } from "../fixtures/ssr";

const share = SHARE_ROWS as unknown as Array<Record<string, string | number>>;

/** Families with no size props at all — nothing to vary, so not applicable. */
const NO_SIZE_PROPS = ["SegmentedBar", "SingleStackedBar"];

/**
 * Pie and Radial default to `legendVariant="stacked"`, and that wrapper splits
 * the box between chart and legend from a MEASURED legend height. Nothing is
 * measured during `renderToString`, so in SSR their drawn radius is pinned at
 * 135 no matter what width or height is passed. They are therefore excluded
 * from the generic sweep and covered by a dedicated pair of assertions below,
 * which pin the invariance AND show the chart itself does honour its size
 * props once the stacked legend is out of the way. Browser coverage of their
 * real sizing is in the container-resize matrix.
 */
const STACKED_LEGEND_FAMILIES = ["PieChart", "RadialChart"];

const sizable = FAMILIES.filter((f) => f.renderAtSize);
const unsizable = FAMILIES.filter((f) => !f.renderAtSize);
const sweepable = sizable.filter(
  (f) => !STACKED_LEGEND_FAMILIES.includes(f.name) && f.name !== "MiniBarChart",
);

const NARROW = { width: 320, height: 280 };
const WIDE = { width: 960, height: 420 };

describe("size-prop responsiveness", () => {
  it("accounts for all 19 families: sizable + container-only", () => {
    expect(sizable.length + unsizable.length).toBe(19);
    expect(unsizable.map((f) => f.name).sort()).toEqual([...NO_SIZE_PROPS].sort());
    // 17 of 19 take explicit sizes (14 width/height + 3 mini `size`).
    expect(sizable).toHaveLength(17);
    // 14 are swept generically; Pie, Radial and fixed-width MiniBar are separate.
    expect(sweepable).toHaveLength(14);
  });

  it.each(sweepable.map((f) => [f.name, f] as const))(
    "%s draws wider when given a larger size",
    (name, family) => {
      const atSize = family.renderAtSize!;
      const narrow = renderAndRecord(`size.${name}.narrow`, atSize(NARROW));
      const wide = renderAndRecord(`size.${name}.wide`, atSize(WIDE));

      const narrowX = maxDrawnX(narrow);
      const wideX = maxDrawnX(wide);

      // Both must actually draw something, or the comparison is vacuous.
      expect(narrowX, `${name} drew nothing at ${NARROW.width}px`).toBeGreaterThan(0);
      expect(wideX, `${name} drew nothing at ${WIDE.width}px`).toBeGreaterThan(0);

      expect(
        wideX,
        `${name}: right-most drawn x did not grow (${narrowX} -> ${wideX})`,
      ).toBeGreaterThan(narrowX);
    },
  );

  it.each(sweepable.map((f) => [f.name, f] as const))(
    "%s produces different markup at the two sizes",
    (name, family) => {
      const atSize = family.renderAtSize!;
      // A coarser but independent check: the whole serialization must differ.
      // Catches a family that ignores the prop for geometry but not for, say,
      // the container style, which the extent probe alone would miss.
      expect(renderAndRecord(`size.${name}.narrow`, atSize(NARROW))).not.toEqual(
        renderAndRecord(`size.${name}.wide`, atSize(WIDE)),
      );
    },
  );

  it("MiniBarChart resizes its canvas while keeping its bars fixed and right-aligned", () => {
    const family = FAMILIES.find((f) => f.name === "MiniBarChart")!;
    const span = (html: string) => {
      const xs = [
        ...html.matchAll(/<path[^>]*class="openui-mini-bar-chart-bar"[^>]*d="([^"]*)"/g),
      ].flatMap((match) =>
        [...(match[1] ?? "").matchAll(/[ML]\s*([-\d.]+),[-\d.]+/g)].map((point) =>
          Number(point[1]),
        ),
      );
      expect(xs.length).toBeGreaterThan(0);
      return Math.max(...xs) - Math.min(...xs);
    };
    const narrow = renderAndRecord("size.MiniBarChart.narrow", family.renderAtSize!(NARROW));
    const wide = renderAndRecord("size.MiniBarChart.wide", family.renderAtSize!(WIDE));
    expect(narrow).toContain(`width:${NARROW.width}px`);
    expect(wide).toContain(`width:${WIDE.width}px`);
    expect(span(narrow)).toBeGreaterThan(0);
    expect(span(wide)).toBe(span(narrow));
    // Its right edge moves because the fixed-width row is right-aligned.
    expect(maxDrawnX(wide)).toBeGreaterThan(maxDrawnX(narrow));
  });

  it("records that the two container-only families have no size props", () => {
    // Not a gap: SegmentedBarProps / SingleStackedBarProps declare no width,
    // height or size (SegmentedBar/types.ts). They follow their container, so
    // their responsiveness is only observable in the browser.
    for (const family of unsizable) {
      expect(family.sizing).toBe("containerOnly");
    }
  });

  it("the mini charts size through a single square `size` prop", () => {
    for (const name of ["MiniAreaChart", "MiniBarChart", "MiniLineChart"]) {
      const family = FAMILIES.find((f) => f.name === name)!;
      expect(family.sizing).toBe("size");
      const html = renderAndRecord(`size.${name}.wide`, family.renderAtSize!(WIDE));
      // The square is driven by `size`, so both dimensions follow one number.
      expect(html).toContain(`width:${WIDE.width}px`);
      expect(html).toContain(`height:${WIDE.width}px`);
    }
  });
});

describe("explicit size vs container measurement", () => {
  it("numeric sizes bypass measurement; string sizes become CSS instead", () => {
    // buildContainerStyle (utils/buildContainerStyle.ts:7-8) applies width and
    // height to the container ONLY when they are strings. Numeric sizes drive
    // the drawn geometry but leave the box to CSS — the mechanism behind
    // DEFECT-001. Pinned here so a migration cannot change it unnoticed.
    const family = FAMILIES.find((f) => f.name === "BarChart")!;
    const numeric = renderAndRecord("size.BarChart.numeric", family.renderAtSize!(WIDE));
    expect(numeric).not.toContain(`width:${WIDE.width}px`);
    expect(maxDrawnX(numeric)).toBeGreaterThan(0);
  });
});

describe("stacked-legend families and size props", () => {
  /**
   * Two separate facts, deliberately not conflated:
   *
   *   1. With the DEFAULT `legendVariant="stacked"`, the drawn radius does not
   *      move with width or height in SSR. That is a HARNESS limitation with a
   *      specific cause — the wrapper needs a measured legend height — not the
   *      chart ignoring its props.
   *   2. With `legendVariant="default"` (or no legend) the very same chart
   *      scales correctly, which is what proves (1) is the wrapper's doing.
   *
   * Recorded this way rather than marking the families "untested", and rather
   * than relaxing the sweep to make them pass.
   */
  const sizes = [
    { width: 320, height: 280 },
    { width: 960, height: 420 },
  ] as const;

  it.each(STACKED_LEGEND_FAMILIES)(
    "%s is size-invariant in SSR with its default stacked legend",
    (name) => {
      const Component = name === "PieChart" ? PieChart : RadialChart;
      const extents = sizes.map((s) =>
        maxDrawnX(
          renderAndRecord(
            `size.${name}.stacked.${s.width}x${s.height}`,
            <Component data={share} categoryKey="browser" dataKey="visitors" {...s} />,
          ),
        ),
      );
      expect(extents[0]).toBeGreaterThan(0);
      expect(extents[1]).toBe(extents[0]);
    },
  );

  it.each(STACKED_LEGEND_FAMILIES)(
    "%s DOES honour its size props once the stacked legend is not in the way",
    (name) => {
      const Component = name === "PieChart" ? PieChart : RadialChart;
      const extents = sizes.map((s) =>
        maxDrawnX(
          renderAndRecord(
            `size.${name}.defaultLegend.${s.width}x${s.height}`,
            <Component
              data={share}
              categoryKey="browser"
              dataKey="visitors"
              legendVariant="default"
              {...s}
            />,
          ),
        ),
      );
      expect(extents[0]).toBeGreaterThan(0);
      expect(
        extents[1],
        `${name} did not grow with legendVariant="default" (${extents[0]} -> ${extents[1]})`,
      ).toBeGreaterThan(extents[0]!);
    },
  );
});
