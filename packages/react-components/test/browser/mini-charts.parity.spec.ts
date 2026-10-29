// Animations are finished before each measurement. One intentional difference from #72: the
// fade-in keyframes, identical in body, are registered under the stable name
// `openui-chart-fade-appear` instead of a Goober-generated `go…` name (#102).
import { test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { checkParity } from "./parity/parity";

// Everything miniChart.styles.ts declares beyond the shared parity properties.
const MINI_CHART_PROPERTIES = [
  "fill",
  "position",
  "aspect-ratio",
  "min-width",
  "min-height",
  "animation-name",
  "animation-duration",
  "animation-timing-function",
  "animation-fill-mode",
];

const baseline = JSON.parse(
  readFileSync(new URL("./parity/baselines/mini-charts.json", import.meta.url), "utf8"),
) as Record<string, Record<string, string>>;
const renamedKeyframes = Object.entries(baseline).flatMap(([key, values]) =>
  Object.entries(values)
    .filter(([property, value]) => property.endsWith("animation-name") && /^go\d+$/.test(value))
    .map(([property]) => `${key} ${property}`),
);

test("MiniCharts matches the #72 computed styles", async ({ page }) => {
  test.setTimeout(240_000);
  await checkParity(page, "mini-charts", renamedKeyframes, {}, MINI_CHART_PROPERTIES);
});
