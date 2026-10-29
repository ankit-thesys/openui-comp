// No intentional visual differences from #72.
import { test } from "@playwright/test";
import { checkParity } from "./parity/parity";
test("CardBlockLayout matches the #72 computed styles", async ({ page }) => {
  test.setTimeout(600000);
  await checkParity(page, "card-block-layout");
});
