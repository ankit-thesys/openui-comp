// No intentional visual differences. SVG paint properties supplement the shared parity gate.
import { test } from "@playwright/test";
import { settleOtherChart } from "./parity/other-chart-motion";
import { checkParity } from "./parity/parity";
test("CalendarHeatmap matches the #72 computed styles", async ({ page }) => {
  test.setTimeout(240_000);
  await checkParity(page, "calendar-heatmap", [], settleOtherChart, [
    "animation-delay",
    "animation-duration",
    "animation-timing-function",
    "fill",
    "fill-opacity",
    "stroke",
    "stroke-width",
    "stroke-dasharray",
    "pointer-events",
    "overflow",
    "transform-origin",
    "transform-box",
  ]);
});
