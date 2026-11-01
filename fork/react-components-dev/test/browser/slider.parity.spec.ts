import { expect, test } from "@playwright/test";
import { checkParity } from "./parity/parity";

test("Slider matches the #72 computed styles", async ({ page }) => {
  test.setTimeout(180_000);
  await checkParity(page, "slider", [], {
    prepare: async (page) => {
      await expect(page.locator(".openui-slider-thumb").first()).toBeVisible();
      // Explicit thumb cases exercise the handle's hover colour and inherited tooltip opacity.
      // Disabled thumbs cannot be hit-tested; their parent cases still capture all their parts.
      await page.locator(".openui-slider-thumb:not([data-disabled])").evaluateAll((thumbs) => {
        for (const thumb of thumbs) {
          const parent = thumb.closest("[data-parity-case]")!;
          const index = [...parent.querySelectorAll(".openui-slider-thumb")].indexOf(thumb);
          thumb.setAttribute(
            "data-parity-case",
            `${parent.getAttribute("data-parity-case")}/thumb${index}`,
          );
          thumb.setAttribute(
            "data-parity-parts",
            JSON.stringify({
              handle: ".openui-slider-thumb-handle",
              inner: ".openui-slider-thumb-handle-inner",
              dot: ".openui-slider-thumb-handle-inner-dot",
              value: ".openui-slider-thumb-value",
            }),
          );
        }
      });
    },
  });
});
