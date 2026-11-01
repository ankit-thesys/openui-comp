// No intentional visual differences from #72.
import { test } from "@playwright/test";
import { checkParity } from "./parity/parity";
test("VisualCardBlock matches the #72 computed styles", async ({ page }) => {
  test.setTimeout(180000);
  await checkParity(page, "visual-card-block");
});
