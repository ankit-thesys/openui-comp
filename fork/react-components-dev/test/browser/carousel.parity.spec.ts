// No intentional visual differences. The buttons' consumer className, style and ref moved to the
// actual button root, which changes no computed style; every element, buttons included, is a
// measured part. Capture from #72 with test:parity:baseline.
import { test } from "@playwright/test";
import { checkParity } from "./parity/parity";
test("Carousel matches the #72 computed styles", async ({ page }) => {
  await checkParity(page, "carousel");
});
