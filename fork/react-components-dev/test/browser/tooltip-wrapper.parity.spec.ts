// Focus keeps the real tooltip portal open while its computed styles are measured.
// No intentional visual differences from #72.
import { test } from "@playwright/test";
import { checkParity } from "./parity/parity";
test("TooltipWrapper matches the #72 computed styles", async ({ page }) => {
  await checkParity(page, "tooltip-wrapper");
});
