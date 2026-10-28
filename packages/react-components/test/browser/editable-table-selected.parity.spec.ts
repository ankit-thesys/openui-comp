// #99 parity at the public Chromium seam; capture from #72, then compare both themes.
import { test } from "@playwright/test";
import { checkParity } from "./parity/parity";

test("EditableTable selected cells matches the #72 computed styles", async ({ page }) => {
  test.setTimeout(180_000);
  await checkParity(page, "editable-table-selected");
});
