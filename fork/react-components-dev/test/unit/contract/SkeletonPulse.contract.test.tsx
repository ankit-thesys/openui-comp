// Shared pulse (#90), through public Skeleton users; the family is flat since #101.
// Run after build: pnpm test test/unit/contract/SkeletonPulse.contract.test.tsx
import {
  getComponentStyles,
  PieChartSkeleton,
  Skeleton,
  TableSkeleton,
  ThemeProvider,
} from "@openuidev/react-components";
import { expect, it } from "vitest";
import { classViolation, rulesOf, ruleViolation } from "./checks";
import { blocksIn, namesIn, renderAndCollect, stableClassesIn } from "./collect";
import { sharedStyleContracts } from "./components";

const pulseFrames =
  /@keyframes [\w-]+\{0%\{opacity:0\.3;\}50%\{opacity:0\.85;\}100%\{opacity:0\.3;\}\}/;
const importedCss = getComponentStyles();

it("does not register the pulse keyframes or animation at import", () => {
  expect(importedCss).not.toMatch(pulseFrames);
});

it("registers the pulse and its flat animation rule when Skeleton users render", () => {
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
  // One bar, a table's two bars, and the pie's shape, legend dot and legend bar.
  expect(html.match(new RegExp(`\\b${animationClass}\\b`, "g"))).toHaveLength(6);
  expect(html.match(/openui-skeleton-pulse/g)).toHaveLength(6);
  const documented = sharedStyleContracts.find(({ folder }) => folder === "SkeletonPulse")!.names;
  const emitted = [...stableClassesIn(html)].filter((name) => name === "openui-skeleton-pulse");
  expect([...namesIn(documented)]).toEqual(emitted);
  expect(emitted.map((name) => classViolation(name, blocksIn(documented)))).toEqual([null]);
});

it("keeps the animation and keyframes together in the provider's layer", () => {
  const { html, css } = renderAndCollect([
    <ThemeProvider cssLayer="openui">
      <Skeleton />
      <TableSkeleton rows={1} columns={1} />
      <PieChartSkeleton legendItems={1} />
    </ThemeProvider>,
  ]);
  expect(css).toMatch(pulseFrames);
  expect(css).toMatch(/@layer openui\{\.go\d+\{animation:/);
  expect(css).toMatch(/\}@keyframes [\w-]+\{/);
  expect(css).toMatch(/100%\{opacity:0\.3;\}\}\}/);
  expect(
    rulesOf(css)
      .map((rule) => ruleViolation(rule, "openui"))
      .filter(Boolean),
  ).toEqual([]);
  expect(html.match(/openui-skeleton-pulse/g)).toHaveLength(6);
});
