// No intentional visual differences from #72. Capture both themes with test:parity:baseline.
import { test } from "@playwright/test";
import { checkParity } from "./parity/parity";

test("SourceFaviconImage matches the #72 computed styles", async ({ page }) => {
  test.setTimeout(180_000);
  await checkParity(page, "source-favicon-image");
});
