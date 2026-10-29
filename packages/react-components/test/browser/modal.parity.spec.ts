// Every size, including the overlay sibling in the real portal. No intentional differences.
import { test } from "@playwright/test";
import { checkParity } from "./parity/parity";
for (const size of ["sm", "md", "lg"]) {
  test(`Modal ${size} matches the #72 computed styles`, async ({ page }) => {
    await checkParity(page, `modal-${size}`);
  });
}
