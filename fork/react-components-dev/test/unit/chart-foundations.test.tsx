// Chart foundations are observed through the built public package in Node. Run after build:
// pnpm exec vitest run test/unit/chart-foundations.test.tsx. No internal styling imports.
import { MiniLineChart } from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";

it("gives a mini line chart and every SVG part stable override targets", () => {
  const html = renderToString(<MiniLineChart data={[1, 2, 3]} size={120} />);
  for (const name of [
    "openui-mini-line-chart",
    "openui-mini-line-chart-svg",
    "openui-mini-line-chart-line",
  ]) {
    expect(html).toMatch(new RegExp(`class="[^"]*\\b${name}(?: |")`));
  }
  expect(html).not.toContain("openui-mini-chart-root");
});

it("renders the shared empty chart styling during server rendering", async () => {
  const { LineChart, getComponentStyles } = await import("@openuidev/react-components");
  const before = getComponentStyles();
  const html = renderToString(<LineChart data={[]} categoryKey="month" />);
  expect(html).toMatch(/class="[^"]*\bopenui-chart-empty(?: |")/);
  expect(html).not.toContain("openui-chart-empty-root");
  expect(before).toContain("min-height:200px");
  expect(getComponentStyles()).toBe(before);
});

it("exposes flat default legend parts through a public line chart", async () => {
  const { LineChart, getComponentStyles } = await import("@openuidev/react-components");
  const before = getComponentStyles();
  const html = renderToString(
    <LineChart
      data={[{ month: "Jan", sales: 12 }]}
      categoryKey="month"
      width={400}
      height={260}
      xAxisLabel="Month"
      yAxisLabel="Sales"
    />,
  );
  expect(html).toContain("openui-default-legend-item-label");
  expect(html).not.toContain("openui-chart-default-legend-root");
  expect(before).toMatch(/padding-top:var\(--openui-space-m,\s*12px\)/);
  expect(getComponentStyles()).toBe(before);
});

it("exposes the stacked legend active state without a state class", async () => {
  const { StackedLegend, getComponentStyles } = await import("@openuidev/react-components");
  const before = getComponentStyles();
  const html = renderToString(
    <StackedLegend
      items={[{ key: "sales", label: "Sales", value: 12, color: "red" }]}
      activeKey="sales"
    />,
  );
  expect(html).toMatch(/class="[^"]*\bopenui-stacked-legend-item(?: |")/);
  expect(html).toContain('data-state="active"');
  expect(html).not.toContain("__item--active");
  expect(before).toContain('[data-state="active"]');
  expect(getComponentStyles()).toBe(before);
});

it("exposes horizontal overflow controls with native disabled state", async () => {
  const { LineChart } = await import("@openuidev/react-components");
  const html = renderToString(
    <LineChart
      data={Array.from({ length: 25 }, (_, i) => ({ month: `Month ${i}`, sales: i }))}
      categoryKey="month"
      width={300}
      height={260}
    />,
  );
  expect(html).toContain("openui-scroll-buttons-horizontal");
  expect(html).toContain("openui-scroll-buttons-horizontal-left");
  expect(html).toContain('disabled=""');
  expect(html).not.toContain("scroll-button--disabled");
});

it("exposes vertical overflow controls through a public horizontal bar chart", async () => {
  const { HorizontalBarChart } = await import("@openuidev/react-components");
  const html = renderToString(
    <HorizontalBarChart
      data={Array.from({ length: 25 }, (_, i) => ({ month: `Month ${i}`, sales: i }))}
      categoryKey="month"
      width={300}
      height={260}
    />,
  );
  expect(html).toContain("openui-scroll-buttons-vertical");
  expect(html).toContain("openui-scroll-buttons-vertical-down");
  expect(html).not.toContain("scroll-button--disabled");
});
