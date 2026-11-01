// All pulse users match #72 in light/dark at the same animation position. No intentional changes.
import { test } from "@playwright/test";
import { checkParity } from "./parity/parity";

test("Skeleton pulse matches the #72 computed styles", async ({ page }) => {
  test.setTimeout(180_000);
  await checkParity(page, "skeleton-pulse");
});
