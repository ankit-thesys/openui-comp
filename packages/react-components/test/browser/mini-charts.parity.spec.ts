// No intentional visual differences from #72. Animations are finished before each measurement.
import { test } from "@playwright/test";
import { checkParity } from "./parity/parity";
test("MiniCharts matches the #72 computed styles", async ({ page }) => {
  test.setTimeout(240_000);
  await checkParity(page, "mini-charts");
});
