// Shared opt-in preserves Buttons, FormControl and TagBlock in light/dark. No intentional changes.
import { test } from "@playwright/test";
import { checkParity } from "./parity/parity";

test("Shared base matches the #72 computed styles", async ({ page }) => {
  test.setTimeout(180_000);
  await checkParity(page, "shared-base");
});
