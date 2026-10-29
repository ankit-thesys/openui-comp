import { test } from "@playwright/test";
import { checkParity } from "./parity/parity";
test("ImageTextLarge matches the #72 computed styles", async ({ page }) => {
  await checkParity(page, "image-text-large");
});
