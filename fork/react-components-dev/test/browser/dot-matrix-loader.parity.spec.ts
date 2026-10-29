// No intentional visual differences from #72.
import { test } from "@playwright/test";
import { checkParity } from "./parity/parity";

test("DotMatrixLoader matches the #72 computed styles", async ({ page }) => {
  test.setTimeout(180_000);
  await checkParity(page, "dot-matrix-loader");
});
