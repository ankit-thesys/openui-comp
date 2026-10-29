// #93: no intentional visual differences. Fresh scenarios isolate modal Select portals.
import { expect, test } from "@playwright/test";
import { checkParity } from "./parity/parity";
test("Select matches the #72 computed styles", async ({ page }) => {
  test.setTimeout(300_000);
  await checkParity(page, "select", [], {
    scenarios: [
      "closed",
      ...["sm", "md", "lg"].flatMap((size) =>
        ["popper", "item-aligned"].map((position) => `${size}/${position}`),
      ),
    ],
    prepare: async (page, scenario) => {
      if (scenario !== "closed")
        await expect(page.locator('.openui-select-item[data-state="checked"]')).toBeFocused();
    },
  });
});
