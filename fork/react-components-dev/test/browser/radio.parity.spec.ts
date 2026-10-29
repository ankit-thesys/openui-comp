import { test } from "@playwright/test";
import { checkParity } from "./parity/parity";

// No intentional differences from #72.
test("RadioGroup / RadioItem matches the #72 computed styles", async ({ page }) => {
  test.setTimeout(180_000);
  await checkParity(page, "radio");
});
