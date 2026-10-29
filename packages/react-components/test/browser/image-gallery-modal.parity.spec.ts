// No intentional visual differences. The modal's carousel controls follow Carousel's button
// change (consumer props on the actual button), which changes no computed style. Capture from
// #72 with test:parity:baseline.
import { test } from "@playwright/test";
import { checkParity } from "./parity/parity";
test("ImageGallery modal matches the #72 computed styles", async ({ page }) => {
  await checkParity(page, "image-gallery-modal");
});
