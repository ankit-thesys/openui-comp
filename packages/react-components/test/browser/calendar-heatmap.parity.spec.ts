// One intentional difference from #72: the root declares the chart label typography, so the page's
// font (Tailwind's preflight, for one) cannot resize the inline SVG's baseline gap. Its parts
// inherit that font instead of the page's Times 16px/normal; none of them draws text, so their
// boxes match. The labels declare their own typography and stay fully checked. SVG paint
// properties supplement the shared parity gate.
import { test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { settleOtherChart } from "./parity/other-chart-motion";
import { checkParity } from "./parity/parity";

const INHERITED_TYPOGRAPHY = ["font-family", "font-size", "line-height", "letter-spacing"];

const baseline = JSON.parse(
  readFileSync(new URL("./parity/baselines/calendar-heatmap.json", import.meta.url), "utf8"),
) as Record<string, Record<string, string>>;
const declaredTypography = Object.entries(baseline).flatMap(([key, values]) =>
  Object.keys(values)
    .filter((property) => {
      const [part, name] = property.split(".");
      return name !== undefined && INHERITED_TYPOGRAPHY.includes(name) && !part!.endsWith("-label");
    })
    .map((property) => `${key} ${property}`),
);

test("CalendarHeatmap matches the #72 computed styles", async ({ page }) => {
  test.setTimeout(240_000);
  await checkParity(page, "calendar-heatmap", declaredTypography, settleOtherChart, [
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
