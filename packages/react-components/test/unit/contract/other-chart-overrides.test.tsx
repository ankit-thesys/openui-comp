// The public SSR seam: chart-owned values must leave room for ordinary consumer CSS.
// Run after build: pnpm exec vitest run test/unit/contract/other-chart-overrides.test.tsx.
import * as UI from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { chartSlug, otherChartCases, otherCharts } from "../../fixtures/other-charts";

it("leaves chart-owned declarations to stylesheets so a stable class can override them", () => {
  const inline: string[] = [];
  for (const chart of otherCharts) {
    const prefix = `openui-${chartSlug(chart)}`;
    for (const { id, element } of otherChartCases(UI, chart)) {
      for (const [tag] of renderToString(element).matchAll(/<[a-z][^>]*>/g)) {
        const classes = tag.match(/class="([^"]*)"/)?.[1]?.split(/\s+/) ?? [];
        if (!classes.some((name) => name === prefix || name.startsWith(`${prefix}-`))) continue;
        const declarations =
          tag
            .match(/style="([^"]*)"/)?.[1]
            ?.split(";")
            .filter(Boolean) ?? [];
        for (const declaration of declarations)
          // #102 documents the shared StackedLegend frame width as JavaScript geometry.
          if (
            !declaration.startsWith("--") &&
            !(classes.includes("openui-stacked-legend") && declaration === "width:100%")
          )
            inline.push(`${chart}/${id}: ${declaration}`);
      }
    }
  }
  expect(inline).toEqual([]);
});
