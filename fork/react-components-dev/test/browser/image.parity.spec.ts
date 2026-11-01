// No intentional visual differences. The aspect wrapper's and viewport's geometry moved from
// Radix inline styles to flat CSS defaults with the same computed values; every element is a
// measured part. Capture from #72 with test:parity:baseline.
import { test } from "@playwright/test";
import { checkParity } from "./parity/parity";
test("Image matches the #72 computed styles", async ({ page }) => {
  await checkParity(page, "image");
});
