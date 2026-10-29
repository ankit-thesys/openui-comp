// Loading components are exercised through the public built package.
import {
  DotMatrixLoader,
  PieChartSkeleton,
  Skeleton,
  TableSkeleton,
  getComponentStyles,
} from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";

it("registers Skeleton's flat layout and bar styles when rendered", () => {
  const before = getComponentStyles();
  const html = renderToString(<Skeleton count={2} className="app-loading" />);
  expect(html).toMatch(/class="[^"]*\bopenui-skeleton\b[^\"]*app-loading/);
  expect(html).not.toContain("openui-skeleton-root");
  const css = getComponentStyles().slice(before.length);
  expect(css).toContain("flex-direction:column");
  expect(css).toContain("background-color:var(--openui-elevated,");
});

it("emits both PieChartSkeleton appearance axes, including their defaults", () => {
  const defaults = renderToString(<PieChartSkeleton />);
  expect(defaults).toContain("openui-pie-chart-skeleton--variant-pie");
  expect(defaults).toContain("openui-pie-chart-skeleton--appearance-circular");
  const semiDonut = renderToString(<PieChartSkeleton variant="donut" appearance="semiCircular" />);
  expect(semiDonut).toContain("openui-pie-chart-skeleton--variant-donut");
  expect(semiDonut).toContain("openui-pie-chart-skeleton--appearance-semi-circular");
  expect(semiDonut).not.toContain("openui-skeleton-pie-chart");
});

it("renders TableSkeleton's root and owned row, cell and header-cell parts", () => {
  const before = getComponentStyles();
  const html = renderToString(<TableSkeleton rows={2} columns={2} />);
  expect(html).toContain("openui-table-skeleton-header-cell");
  expect(html).not.toContain("openui-skeleton-table");
  expect(getComponentStyles().slice(before.length)).toContain(":last-child{border-bottom:0;");
});

it("emits DotMatrixLoader's default and compact modifiers and flat dot parts", () => {
  const before = getComponentStyles();
  const defaults = renderToString(<DotMatrixLoader className="app-loader" />);
  expect(defaults).toContain("openui-dot-matrix-loader--variant-default");
  expect(defaults).not.toContain("openui-dot-matrix-loader-root");
  expect(defaults.match(/openui-dot-matrix-loader-dot/g)).toHaveLength(25);
  const compact = renderToString(<DotMatrixLoader variant="compact" size={40} />);
  expect(compact).toContain("openui-dot-matrix-loader--variant-compact");
  expect(compact.match(/openui-dot-matrix-loader-dot/g)).toHaveLength(16);
  expect(getComponentStyles().slice(before.length)).toContain("aspect-ratio:1;");
});
