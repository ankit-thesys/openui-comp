import { test } from "@playwright/test";
import { checkParity } from "./parity/parity";
test("Carousel mobile matches the #72 computed styles", async ({ page }) => {
  await page.setViewportSize({ width: 380, height: 900 });
  await checkParity(page, "carousel-mobile");
});
