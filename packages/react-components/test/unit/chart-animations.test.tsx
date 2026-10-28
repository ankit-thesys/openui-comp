// The built public package must defer chart keyframes until render. No style internals imported.
// Run after build: pnpm exec vitest run test/unit/chart-animations.test.tsx.
import { getComponentStyles, LineChart, MiniLineChart } from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";

it("registers chart entrance keyframes during rendering, never import", () => {
  const imported = getComponentStyles();
  expect(imported).not.toMatch(/@keyframes[^{}]*\{\s*to\s*\{\s*stroke-dashoffset:0/);
  expect(imported).not.toContain("@keyframes openui-chart-fade-appear");
  renderToString(
    <LineChart
      data={[{ month: "Jan", sales: 12 }]}
      categoryKey="month"
      width={400}
      height={260}
      isAnimationActive
    />,
  );
  renderToString(<MiniLineChart data={[1, 2]} size={120} isAnimationActive />);
  expect(getComponentStyles()).toContain("@keyframes openui-chart-draw-line");
  expect(getComponentStyles()).toContain("@keyframes openui-chart-fade-appear");
});
