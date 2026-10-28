import { test } from "@playwright/test";
import { checkParity } from "./parity/parity";
test.beforeEach(async ({ page }) => {
  await page.route("**/media-pending.svg", () => {});
});
test("ImageBlock matches the #72 computed styles", async ({ page }) => {
  await checkParity(page, "image-block");
});
