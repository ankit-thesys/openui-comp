import { test } from "@playwright/test";
import { checkParity } from "./parity/parity";
test("Carousel matches the #72 computed styles", async ({ page }) => {
  await checkParity(page, "carousel");
});
