// No intentional visual differences from #72. Includes base, both legends and both scroll axes.
import { expect, test } from "@playwright/test";
import { checkParity } from "./parity/parity";
test("ChartFoundations matches the #72 computed styles", async ({ page }) => {
  test.setTimeout(180_000);
  await checkParity(page, "chart-foundations", [], async (page, id) => {
    if (id !== "default-legend/expanded" && id !== "stacked/show-all") return;
    const button = page
      .locator(`[data-parity-case="${id}"]`)
      .getByRole("button", { name: /more/i });
    if (await button.count()) {
      await button.click();
      await page.mouse.move(0, 0);
    }
    await expect(
      page.locator(`[data-parity-case="${id}"]`).getByRole("button", { name: /less/i }),
    ).toBeVisible();
  });
});
