// No intentional visual differences. Capture from #72 with test:parity:baseline.
import { test } from "@playwright/test";
import { checkParity } from "./parity/parity";
test("BarChart matches the #72 computed styles", async ({ page }) => {
  test.setTimeout(240_000);
  await checkParity(page, "bar-chart");
});
