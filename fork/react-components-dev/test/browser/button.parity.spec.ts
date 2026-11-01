// Button renders exactly as in #72: every variant × size × tone, idle and disabled, at rest,
// hovered and pressed, in light and dark.
import { test } from "@playwright/test";
import { checkParity } from "./parity/parity";

test("Button matches the #72 computed styles", async ({ page }) => {
  test.setTimeout(180_000);
  await checkParity(page, "button");
});
