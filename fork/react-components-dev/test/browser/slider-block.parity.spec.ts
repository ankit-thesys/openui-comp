import { expect, test } from "@playwright/test";
import { checkParity } from "./parity/parity";

test("SliderBlock matches the #72 computed styles", async ({ page }) => {
  test.setTimeout(180_000);
  await checkParity(page, "slider-block", [], {
    scenarios: ["closed", "single-select", "range-select-min", "range-select-max"],
    prepare: async (page, scenario) => {
      await expect(page.locator(".openui-slider-thumb").first()).toBeVisible();
      if (scenario === "closed") return;
      await page
        .locator(".openui-select-trigger")
        .nth(scenario.endsWith("max") ? 1 : 0)
        .click();
      await expect(page.locator('.openui-select-item[data-state="checked"]')).toBeFocused();
      // Portal content lies outside #root and is the only hover/press target while modal.
      await page
        .locator("[data-parity-case]")
        .evaluateAll((elements) =>
          elements.forEach((el) => el.removeAttribute("data-parity-case")),
        );
      await page.locator(".openui-select-content").evaluate((content) => {
        content.setAttribute("data-parity-case", "content");
        content.setAttribute(
          "data-parity-parts",
          JSON.stringify({
            viewport: ".openui-select-viewport",
            item: ".openui-select-item",
            check: ".openui-select-item-check-wrapper",
            icon: ".openui-select-item-check-icon",
          }),
        );
      });
    },
  });
});
