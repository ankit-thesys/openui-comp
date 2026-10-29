// No intentional visual differences. Capture from #72 with test:parity:baseline.
import { test } from "@playwright/test";
import { checkParity } from "./parity/parity";
test("ImageGallery mobile matches the #72 computed styles", async ({ page }) => {
  await page.setViewportSize({ width: 600, height: 900 });
  await checkParity(page, "image-gallery-mobile");
});
