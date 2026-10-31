// Public built-package seam: chart frames and SVG marks must render their flat override targets.
// Run after build: pnpm exec vitest run test/unit/cartesian-charts.test.tsx
import {
  AreaChart,
  BarChart,
  configureStyles,
  getComponentStyles,
  HorizontalBarChart,
  LineChart,
  ScatterChart,
  ThemeProvider,
} from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { afterEach, expect, it } from "vitest";

afterEach(() => configureStyles({ layer: undefined }));

const data = [
  { month: "Jan", sales: -12 },
  { month: "Feb", sales: 20 },
];

it("AreaChart exposes its imported frame and mark styles in the requested layer", () => {
  configureStyles({ layer: "cartesian-area" });
  const imported = getComponentStyles();
  const html = renderToString(
    <ThemeProvider>
      <AreaChart data={data} categoryKey="month" isAnimationActive />
    </ThemeProvider>,
  );
  expect(html).toMatch(/class="[^"]*\bopenui-area-chart(?:\s|")/);
  expect(html).not.toContain("openui-area-chart-root");
  expect(html).toContain("openui-area-chart-area-path--is-animation-active");
  expect(getComponentStyles()).toBe(imported);
  expect(imported).toMatch(/^@layer cartesian-area\{/);
});

it("LineChart exposes layered frame, line and dot override targets", () => {
  configureStyles({ layer: "cartesian-line" });
  const imported = getComponentStyles();
  const html = renderToString(
    <ThemeProvider>
      <LineChart showDots data={data} categoryKey="month" isAnimationActive />
    </ThemeProvider>,
  );
  expect(html).not.toContain("openui-line-chart-root");
  expect(html).toContain("openui-line-chart-line--is-animation-active");
  expect(html).toMatch(/class="go\d+ openui-line-chart-dot"/);
  expect(getComponentStyles()).toBe(imported);
  expect(imported).toMatch(/^@layer cartesian-line\{/);
});

it("BarChart renders data states separately from its animation prop", () => {
  configureStyles({ layer: "cartesian-bar" });
  const imported = getComponentStyles();
  const html = renderToString(
    <ThemeProvider>
      <BarChart data={data} categoryKey="month" isAnimationActive />
    </ThemeProvider>,
  );
  expect(html).not.toContain("openui-bar-chart-root");
  expect(html).toContain("openui-bar-chart-bar--is-animation-active");
  expect(html).toContain('data-negative=""');
  expect(html).toContain('data-zero=""');
  expect(html).not.toContain("--negative");
  expect(getComponentStyles()).toBe(imported);
  expect(imported).toMatch(/^@layer cartesian-bar\{/);
});

it("HorizontalBarChart has its own flat frame and animation targets, including when empty", () => {
  configureStyles({ layer: "cartesian-horizontal" });
  const imported = getComponentStyles();
  const html = renderToString(
    <ThemeProvider>
      <HorizontalBarChart data={data} categoryKey="month" isAnimationActive />
    </ThemeProvider>,
  );
  expect(html).not.toContain("openui-horizontal-bar-chart-root");
  expect(html).toContain("openui-horizontal-bar-chart-bar--is-animation-active");
  expect(html).toContain('data-negative=""');
  expect(getComponentStyles()).toBe(imported);
  expect(imported).toMatch(/^@layer cartesian-horizontal\{/);
  const empty = renderToString(<HorizontalBarChart data={[]} categoryKey="month" />);
  expect(empty).toMatch(/class="[^"]*openui-horizontal-bar-chart(?: |")/);
  expect(empty).not.toContain("openui-bar-chart");
});

it("ScatterChart registers dot and numeric-axis styles in the configured layer", () => {
  configureStyles({ layer: "cartesian-scatter" });
  const imported = getComponentStyles();
  const html = renderToString(
    <ThemeProvider>
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
  expect(getComponentStyles()).toBe(imported);
  expect(imported).toMatch(/^@layer cartesian-scatter\{/);
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
