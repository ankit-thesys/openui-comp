// No intentional visual differences: one/two items, multiple items and the >10 summary path.
import { expect, test } from "@playwright/test";
import { checkParity } from "./parity/parity";
test("ChartTooltip matches the #72 computed styles", async ({ page }) => {
  test.setTimeout(180_000);
  await checkParity(page, "chart-tooltip", [], async (page, id) => {
    await page
      .locator(`[data-parity-case="${id}"]`)
      .getByRole("img", { name: "Line chart", exact: true })
      .hover({ position: { x: 120, y: 80 } });
    await expect(page.locator(".openui-chart-tooltip")).toBeVisible();
  });
});
