// No intentional visual differences. Capture from #72 with test:parity:baseline.
import { test } from "@playwright/test";
import { checkParity } from "./parity/parity";
test("ImageText matches the #72 computed styles", async ({ page }) => {
  await checkParity(page, "image-text");
});
