// #93: DatePicker's closed input and floating Calendar match #72, including single/range modes.
import { expect, test } from "@playwright/test";
import { checkParity } from "./parity/parity";
test("DatePicker matches the #72 computed styles", async ({ page }) => {
  test.setTimeout(300_000);
  await page.clock.setFixedTime(new Date("2026-10-28T12:00:00Z"));
  await checkParity(page, "date-picker", [], {
    scenarios: [
      ...["single", "range"].flatMap((mode) =>
        ["empty", "selected", ...(mode === "range" ? ["partial"] : [])].flatMap((selection) =>
          ["closed", "open"].map((open) => `${mode}/${selection}/${open}/fullscreen`),
        ),
      ),
      "range/selected/open/mobile",
    ],
    prepare: async (page, scenario) => {
      if (!scenario.includes("/open/")) return;
      const content = page.locator(
        ".openui-date-picker-content, .openui-date-picker-renderer-floating-content",
      );
      await expect(content.locator('[data-day="2026-10-15"]')).toBeVisible();
      await page
        .locator("[data-parity-case]")
        .evaluateAll((els) => els.forEach((el) => el.removeAttribute("data-parity-case")));
      await content.evaluate((el) => {
        el.setAttribute("data-parity-case", "floating");
        el.setAttribute(
          "data-parity-parts",
          JSON.stringify({
            menu: ".openui-date-picker-menu, .openui-date-picker-renderer-floating-menu",
            calendar:
              ".openui-date-picker-calendar, .openui-date-picker-renderer-single-mode, .openui-date-picker-renderer-range-mode",
            root: ".openui-calendar, .openui-calendar-container",
            content: ".openui-calendar-content, .openui-calendar-root",
            day: '[data-day="2026-10-15"]',
            button: '[data-day="2026-10-15"] button',
            trigger: ".openui-calendar-select-trigger",
          }),
        );
      });
    },
  });
});
