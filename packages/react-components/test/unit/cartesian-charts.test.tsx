// Public built-package seam: chart frames and SVG marks must render their flat override targets.
// Run after build: pnpm exec vitest run test/unit/cartesian-charts.test.tsx
import {
  AreaChart,
  BarChart,
  getComponentStyles,
  HorizontalBarChart,
  LineChart,
  ScatterChart,
  ThemeProvider,
} from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";

const data = [
  { month: "Jan", sales: -12 },
  { month: "Feb", sales: 20 },
];

it("AreaChart registers its frame and mark styles when rendered, in the requested layer", () => {
  const before = getComponentStyles();
  const html = renderToString(
    <ThemeProvider cssLayer="cartesian-area">
      <AreaChart data={data} categoryKey="month" isAnimationActive />
    </ThemeProvider>,
  );
  expect(html).toMatch(/class="[^"]*\bopenui-area-chart(?:\s|")/);
  expect(html).not.toContain("openui-area-chart-root");
  expect(html).toContain("openui-area-chart-area-path--is-animation-active");
  expect(getComponentStyles().slice(before.length)).toContain("@layer cartesian-area");
});

it("LineChart exposes layered frame, line and dot override targets", () => {
  const before = getComponentStyles();
  const html = renderToString(
    <ThemeProvider cssLayer="cartesian-line">
      <LineChart showDots data={data} categoryKey="month" isAnimationActive />
    </ThemeProvider>,
  );
  expect(html).not.toContain("openui-line-chart-root");
  expect(html).toContain("openui-line-chart-line--is-animation-active");
  expect(html).toMatch(/class="go\d+ openui-line-chart-dot"/);
  expect(getComponentStyles().slice(before.length)).toContain("@layer cartesian-line");
});

it("BarChart renders data states separately from its animation prop", () => {
  const before = getComponentStyles();
  const html = renderToString(
    <ThemeProvider cssLayer="cartesian-bar">
      <BarChart data={data} categoryKey="month" isAnimationActive />
    </ThemeProvider>,
  );
  expect(html).not.toContain("openui-bar-chart-root");
  expect(html).toContain("openui-bar-chart-bar--is-animation-active");
  expect(html).toContain('data-negative=""');
  expect(html).toContain('data-zero=""');
  expect(html).not.toContain("--negative");
  expect(getComponentStyles().slice(before.length)).toContain("@layer cartesian-bar");
});

it("HorizontalBarChart has its own flat frame and animation targets, including when empty", () => {
  const before = getComponentStyles();
  const html = renderToString(
    <ThemeProvider cssLayer="cartesian-horizontal">
      <HorizontalBarChart data={data} categoryKey="month" isAnimationActive />
    </ThemeProvider>,
  );
  expect(html).not.toContain("openui-horizontal-bar-chart-root");
  expect(html).toContain("openui-horizontal-bar-chart-bar--is-animation-active");
  expect(html).toContain('data-negative=""');
  expect(getComponentStyles().slice(before.length)).toContain("@layer cartesian-horizontal");
  const empty = renderToString(<HorizontalBarChart data={[]} categoryKey="month" />);
  expect(empty).toMatch(/class="[^"]*openui-horizontal-bar-chart(?: |")/);
  expect(empty).not.toContain("openui-bar-chart");
});

it("ScatterChart registers dot and numeric-axis styles in its provider layer", () => {
  const before = getComponentStyles();
  const html = renderToString(
    <ThemeProvider cssLayer="cartesian-scatter">
      <ScatterChart
        data={[
          {
            name: "Sales",
            data: [
              { x: -1, y: -2 },
              { x: 2, y: 3 },
            ],
          },
        ]}
        isAnimationActive
      />
    </ThemeProvider>,
  );
  expect(html).not.toContain("openui-scatter-chart-root");
  expect(html).toContain("openui-scatter-chart-dot--is-animation-active");
  expect(html).toMatch(/class="go\d+ openui-scatter-chart-x-tick"/);
  expect(getComponentStyles().slice(before.length)).toContain("@layer cartesian-scatter");
});

it("gives every owned SVG element a stable class for consumer overrides", () => {
  const elements = [
    <AreaChart data={data} categoryKey="month" condensed legend={false} crosshair highlight />,
    <LineChart
      data={data}
      categoryKey="month"
      condensed
      legend={false}
      showDots
      crosshair
      highlight
    />,
    <BarChart data={data} categoryKey="month" condensed legend={false} />,
    <HorizontalBarChart data={data} categoryKey="month" legend={false} />,
    <ScatterChart data={[{ name: "Sales", data: [{ x: 1, y: 2 }] }]} legend={false} />,
  ];
  for (const element of elements) {
    const html = renderToString(element);
    const svgElements = [
      ...html.matchAll(
        /<(svg|g|path|circle|rect|line|text|tspan|defs|clipPath|linearGradient|stop|foreignObject)\b([^>]*)>/g,
      ),
    ];
    expect(svgElements.length).toBeGreaterThan(0);
    expect(
      svgElements
        .filter(([, , attributes]) => !/class="[^"]*openui-/.test(attributes!))
        .map(([tag]) => tag),
    ).toEqual([]);
  }
});

it("keeps dynamic mark appearance overridable rather than assigning inline CSS properties", () => {
  const html = [
    <AreaChart
      data={data}
      categoryKey="month"
      condensed
      legend={false}
      crosshair
      highlight
      isAnimationActive
    />,
    <LineChart
      data={data}
      categoryKey="month"
      condensed
      legend={false}
      crosshair
      highlight
      isAnimationActive
    />,
    <BarChart data={data} categoryKey="month" condensed legend={false} isAnimationActive />,
    <HorizontalBarChart data={data} categoryKey="month" legend={false} isAnimationActive />,
    <ScatterChart
      data={[{ name: "Sales", data: [{ x: 1, y: 2 }] }]}
      legend={false}
      isAnimationActive
    />,
  ]
    .map((element) => renderToString(element))
    .join("");
  expect(
    html.match(
      /(?:style="|;)(?:opacity|fill-opacity|stroke-opacity|animation-delay|transition|overflow|pointer-events):/g,
    ) ?? [],
  ).toEqual([]);
});
