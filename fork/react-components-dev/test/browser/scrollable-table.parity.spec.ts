// No intentional visual differences. #99 parity at the public Chromium seam; capture from #72,
// then compare both themes.
import { test } from "@playwright/test";
import { checkParity } from "./parity/parity";

test("ScrollableTable matches the #72 computed styles", async ({ page }) => {
  test.setTimeout(180_000);
  await checkParity(page, "scrollable-table");
});
