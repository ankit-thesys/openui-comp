// #91: no intentional visual differences from #72, in light and dark.
import { test } from "@playwright/test";
import { checkParity } from "./parity/parity";

test("Label matches the #72 computed styles", async ({ page }) => {
  test.setTimeout(180_000);
  await checkParity(page, "label");
});
