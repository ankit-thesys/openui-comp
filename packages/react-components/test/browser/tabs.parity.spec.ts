// The Tabs family renders exactly as in #72: every TabsList variant with active and inactive
// triggers (at rest, hovered and pressed) and an overflowing list with its scroll button, in light
// and dark.
import { test } from "@playwright/test";
import { checkParity } from "./parity/parity";

test("Tabs matches the #72 computed styles", async ({ page }) => {
  test.setTimeout(300_000);
  await checkParity(page, "tabs");
});
