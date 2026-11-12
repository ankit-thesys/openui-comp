/**
 * Theme (light/dark) and size-responsiveness, as far as SSR can observe them.
 *
 * Scope note, stated plainly: this file proves the chart MARKUP responds to
 * theme mode and to size props. It cannot prove COMPUTED colours, because
 * resolving a CSS custom property needs a layout engine and packages/react-ui
 * has no DOM test environment available (see reports/REPORT.md). The computed
 * light/dark colours and the container-driven (ResizeObserver) responsive path
 * are covered in the browser instead — see reports/COVERAGE-MATRIX.md.
 */
import { describe, expect, it } from "vitest";
import { AreaChart, BarChart, PieChart } from "../../../packages/react-ui/src/components/Charts";
import { ThemeProvider } from "../../../packages/react-ui/src/components/ThemeProvider";
import { FIXED_PALETTE, MULTI_SERIES_ROWS, SHARE_ROWS, SIZES } from "../fixtures/datasets";
import { attrValues, renderAndRecord } from "../fixtures/ssr";

const rows = MULTI_SERIES_ROWS as unknown as Array<Record<string, string | number>>;
const share = SHARE_ROWS as unknown as Array<Record<string, string | number>>;

describe("theme mode", () => {
  const chart = <AreaChart data={rows} categoryKey="month" {...SIZES.standard} />;

  it("produces IDENTICAL markup in light and dark mode (a real limitation)", () => {
    const light = renderAndRecord("theme.light", <ThemeProvider mode="light">{chart}</ThemeProvider>);
    const dark = renderAndRecord("theme.dark", <ThemeProvider mode="dark">{chart}</ThemeProvider>);

    // ThemeProvider resolves its tokens into a stylesheet from an EFFECT, and
    // effects do not run during renderToString. So server-rendered markup
    // carries no theme tokens at all and the two modes are byte-identical
    // (after id normalisation — ThemeProvider consumes a `useId`, which would
    // otherwise shift every generated id by one).
    //
    // This is asserted, not worked around: it pins the limitation so that if a
    // migration ever starts emitting theme-dependent markup server-side, this
    // test fails and the change gets noticed. Actual light/dark colour
    // verification happens in the browser — see reports/COVERAGE-MATRIX.md.
    expect(light).toEqual(dark);
    expect(light).not.toContain("<style");
  });

  it("series colours come from the built-in palette, not the theme, in SSR", () => {
    // The default area palette, emitted inline regardless of theme mode.
    const light = renderAndRecord("theme.light", <ThemeProvider mode="light">{chart}</ThemeProvider>);
    for (const c of ["#2196F3", "#42A5F5", "#64B5F6"]) expect(light).toContain(c);
  });

  it("customPalette overrides the theme palette verbatim", () => {
    const html = renderAndRecord(
      "theme.customPalette",
      <PieChart
        data={share}
        categoryKey="browser"
        dataKey="visitors"
        customPalette={[...FIXED_PALETTE]}
        {...SIZES.square}
      />,
    );
    // One slice per row, each filled with the palette colour at its index.
    SHARE_ROWS.forEach((_row, i) => {
      expect(html, `slice ${i} fill`).toContain(FIXED_PALETTE[i]);
    });
  });
});

describe("size responsiveness (numeric width/height props)", () => {
  /**
   * `useContainerSize` returns numeric width/height verbatim
   * (hooks/core/useContainerSize.ts:13-42), so these sizes drive layout without
   * any measurement. Widening the chart must widen the drawn content.
   */
  it("AreaChart spreads its categories wider as width grows", () => {
    const xsOf = (w: number, h: number) => {
      const html = renderAndRecord(
        `responsive.area.${w}x${h}`,
        <AreaChart data={rows} categoryKey="month" width={w} height={h} />,
      );
      const d = [...html.matchAll(/class="openui-area-chart-area-path"[^>]*d="([^"]+)"/g)][0]?.[1];
      expect(d, "area path").toBeTruthy();
      return [...d!.matchAll(/[M,C](-?\d+(?:\.\d+)?),/g)].map((m) => Number(m[1]));
    };

    const narrow = xsOf(SIZES.narrow.width, SIZES.narrow.height);
    const wide = xsOf(SIZES.wide.width, SIZES.wide.height);
    expect(Math.max(...wide)).toBeGreaterThan(Math.max(...narrow));
  });

  it("BarChart's y-axis moves down as height grows (taller plot area)", () => {
    const zeroTickY = (h: number) => {
      const html = renderAndRecord(
        `responsive.bar.h${h}`,
        <BarChart data={rows} categoryKey="month" width={640} height={h} />,
      );
      const ticks = [
        ...html.matchAll(/class="openui-bar-chart-y-tick" x="[^"]*" y="([^"]*)"[^>]*>([^<]*)</g),
      ].map((m) => ({ y: Number(m[1]), value: Number(m[2]) }));
      expect(ticks.length).toBeGreaterThan(1);
      return ticks[0].y;
    };
    expect(zeroTickY(560)).toBeGreaterThan(zeroTickY(280));
  });

  it("string width/height become CSS on the container; numeric ones do not", () => {
    // buildContainerStyle (utils/buildContainerStyle.ts:7-8) applies width and
    // height to the container ONLY when they are strings. This is the baseline
    // behaviour behind DEFECT-001 — recorded here so a migration cannot change
    // it unnoticed.
    const numeric = renderAndRecord(
      "responsive.heatmap.numeric",
      <BarChart data={rows} categoryKey="month" width={640} height={360} />,
    );
    const stringy = renderAndRecord(
      "responsive.heatmap.string",
      <BarChart data={rows} categoryKey="month" width="640px" height="360px" />,
    );
    expect(stringy).toContain("width:640px");
    expect(numeric).not.toContain("width:640px");
  });
});
