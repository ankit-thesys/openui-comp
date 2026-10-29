// IconButton renders exactly as in #72: every variant × size × shape × tone, idle and disabled, at
// rest, hovered and pressed, in light and dark.
import { test } from "@playwright/test";
import { checkParity } from "./parity/parity";

test("IconButton matches the #72 computed styles", async ({ page }) => {
  test.setTimeout(600_000);
  await checkParity(page, "icon-button");
});
