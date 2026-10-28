// No intentional differences from #72. Baseline capture requires Chromium.
import { test } from "@playwright/test";
import { checkParity } from "./parity/parity";

test("Tag matches the #72 computed styles", async ({ page }) => {
  test.setTimeout(300_000);
  await checkParity(page, "tag");
});
