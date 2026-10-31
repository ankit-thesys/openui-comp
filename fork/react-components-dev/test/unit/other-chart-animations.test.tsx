// Built public package seam: chart rules and entrances register on import.
// Run after build: pnpm exec vitest run test/unit/other-chart-animations.test.tsx.
import * as UI from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { chartSlug, otherChartCases, otherCharts } from "../fixtures/other-charts";

const imported = UI.getComponentStyles();

it("registers other-chart keyframes before rendering", () => {
  const frames = [
    ["PieChart", "openui-pie-chart-appear"],
    ["RadarChart", "openui-radar-chart-appear"],
    ["FunnelChart", "openui-funnel-chart-appear"],
    ["CalendarHeatmap", "openui-calendar-heatmap-appear"],
  ] as const;
  for (const [, name] of frames) expect(imported).toContain(`@keyframes ${name}`);
});

it.each(otherCharts)("%s uses imported rules without changing the sheet on render", (chart) => {
  const prefix = `openui-${chartSlug(chart)}`;
  const generated = new Set<string>();
  for (const { element } of otherChartCases(UI, chart)) {
    for (const [, classes] of renderToString(element).matchAll(/class="([^"]*)"/g)) {
      const names = classes!.split(/\s+/);
      if (names.some((name) => name === prefix || name.startsWith(`${prefix}-`)))
        for (const name of names) if (/^go\d+$/.test(name)) generated.add(name);
    }
  }
  expect(generated.size).toBeGreaterThan(0);
  for (const name of generated) expect(imported).toMatch(new RegExp(`\\.${name}(?![0-9])`));
  expect(UI.getComponentStyles()).toBe(imported);
});

it("keeps stagger delays after entrance animation shorthands", () => {
  const generated = new Set<string>();
  for (const chart of otherCharts) {
    const prefix = `openui-${chartSlug(chart)}`;
    for (const { element } of otherChartCases(UI, chart)) {
      for (const [, classes] of renderToString(element).matchAll(/class="([^"]*)"/g)) {
        const names = classes!.split(/\s+/);
        if (names.some((name) => name === prefix || name.startsWith(`${prefix}-`)))
          for (const name of names) if (/^go\d+$/.test(name)) generated.add(name);
      }
    }
  }
  const entrances = [
    ...UI.getComponentStyles().matchAll(/\.(go\d+)\{([^{}]*\banimation:[^{}]*)\}/g),
  ]
    .filter(([, generatedClass]) => generated.has(generatedClass!))
    .map(([, generatedClass, body]) => ({ selector: `.${generatedClass}`, body: body! }));
  expect(entrances.length).toBeGreaterThan(0);
  expect(
    entrances
      .filter(({ body }) => body.lastIndexOf("animation-delay:") < body.lastIndexOf("animation:"))
      .map(({ selector }) => selector),
  ).toEqual([]);
});
