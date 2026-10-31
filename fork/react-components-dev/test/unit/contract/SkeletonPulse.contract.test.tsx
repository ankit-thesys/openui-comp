// Shared pulse (#90), through public Skeleton users; the family is flat since #101.
// Run after build: pnpm test test/unit/contract/SkeletonPulse.contract.test.tsx
import {
  configureStyles,
  getComponentStyles,
  PieChartSkeleton,
  Skeleton,
  TableSkeleton,
  ThemeProvider,
} from "@openuidev/react-components";
import { afterEach, expect, it } from "vitest";
import { classViolation, matchingBrace, rulesOf, ruleViolation } from "./checks";
import { blocksIn, namesIn, renderAndCollect, stableClassesIn } from "./collect";
import { sharedStyleContracts } from "./components";

afterEach(() => configureStyles({ layer: undefined }));

const pulseFrames =
  /@keyframes [\w-]+\{0%\{opacity:0\.3;\}50%\{opacity:0\.85;\}100%\{opacity:0\.3;\}\}/;
const importedCss = getComponentStyles();

it("registers the pulse keyframes and animation on import", () => {
  expect(importedCss).toMatch(pulseFrames);
  expect(importedCss).toMatch(/animation:[\w-]+ 1\.2s ease-in-out infinite/);
});

it("reuses the imported pulse and its flat animation rule when Skeleton users render", () => {
  const { html, css } = renderAndCollect([
    <Skeleton />,
    <TableSkeleton rows={1} columns={1} />,
    <PieChartSkeleton legendItems={1} />,
  ]);
  expect(css).toMatch(pulseFrames);
  expect(css).toMatch(/animation:[\w-]+ 1\.2s ease-in-out infinite/);
  expect(
    rulesOf(css)
      .map((rule) => ruleViolation(rule, ""))
      .filter(Boolean),
  ).toEqual([]);
  const animationClass = css.match(/\.(go\d+)\{animation:/)![1]!;
  expect(importedCss).toContain(`.${animationClass}{animation:`);
  expect(getComponentStyles()).toBe(importedCss);
  // One bar, a table's two bars, and the pie's shape, legend dot and legend bar.
  expect(html.match(new RegExp(`\\b${animationClass}\\b`, "g"))).toHaveLength(6);
  expect(html.match(/openui-skeleton-pulse/g)).toHaveLength(6);
  const documented = sharedStyleContracts.find(({ folder }) => folder === "SkeletonPulse")!.names;
  const emitted = [...stableClassesIn(html)].filter((name) => name === "openui-skeleton-pulse");
  expect([...namesIn(documented)]).toEqual(emitted);
  expect(emitted.map((name) => classViolation(name, blocksIn(documented)))).toEqual([null]);
});

it("keeps the animation and keyframes together in the app-wide layer", () => {
  configureStyles({ layer: "openui" });
  const { html, css } = renderAndCollect([
    <ThemeProvider>
      <Skeleton />
      <TableSkeleton rows={1} columns={1} />
      <PieChartSkeleton legendItems={1} />
    </ThemeProvider>,
  ]);
  expect(css).toMatch(pulseFrames);
  expect(css).toMatch(/^@layer openui\{/);
  expect(css.match(/@layer /g)).toHaveLength(1);
  expect(css).toMatch(/\}@keyframes [\w-]+\{/);
  expect(matchingBrace(css, css.indexOf("{"))).toBe(css.length - 1);
  expect(
    rulesOf(css)
      .map((rule) => ruleViolation(rule, "openui"))
      .filter(Boolean),
  ).toEqual([]);
  expect(html.match(/openui-skeleton-pulse/g)).toHaveLength(6);
});

it("collects previously registered animations together with their keyframes in layer mode", () => {
  configureStyles({ layer: "openui" });
  const elements = [
    <ThemeProvider>
      <Skeleton />
    </ThemeProvider>,
  ];
  renderAndCollect(elements);
  const { css } = renderAndCollect(elements);

  expect(css).toMatch(/animation:[\w-]+ 1\.2s ease-in-out infinite/);
  expect(css).toMatch(pulseFrames);
  expect(css).toContain("@layer openui{");
});
