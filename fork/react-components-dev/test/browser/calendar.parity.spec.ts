// #93: Calendar's layouts, selection states and both dropdown portals match #72.
import { expect, test } from "@playwright/test";
import { checkParity } from "./parity/parity";
test("Calendar matches the #72 computed styles", async ({ page }) => {
  test.setTimeout(300_000);
  await checkParity(page, "calendar", [], {
    scenarios: [
      ...["mobile", "fullscreen", "tray", "copilot"].flatMap((layout) =>
        ["single", "multiple", "range"].map((mode) => `${layout}/${mode}`),
      ),
      "fullscreen/single/months",
      "fullscreen/single/years",
      "mobile/range/years",
      "fullscreen/single/disabled-navigation",
      "fullscreen/single/week-numbers",
    ],
    prepare: async (page, scenario) => {
      const kind = scenario.split("/")[2];
      const dropdown = kind === "months" || kind === "years" ? kind : undefined;
      await expect(page.locator('[data-day="2026-10-15"]').first()).toBeVisible();
      if (dropdown) {
        // The helper's ResizeObserver settles the measured popup bounds asynchronously.
        await page
          .locator(".openui-calendar-select-trigger")
          .nth(dropdown === "months" ? 0 : 1)
          .click();
        const content = page.locator(`.openui-calendar-select-content-${dropdown}`);
        await expect(content.locator('.openui-select-item[data-state="checked"]')).toBeVisible();
        // Both builds debounce ResizeObserver by 100ms. Visibility precedes measurement:
        // wait for the actual bounds rather than capturing the initial intrinsic popup size.
        await expect
          .poll(() =>
            content.evaluate((el, dropdown) => {
              const calendar = document.querySelector(
                ".openui-calendar, .openui-calendar-container",
              )!;
              const measured = calendar.children[0]!.children[0]!;
              const box = measured.getBoundingClientRect();
              const style = (el as HTMLElement).style;
              return (
                style.maxHeight === `${box.height - 45}px` &&
                (dropdown !== "months" || style.minWidth === `${box.width}px`)
              );
            }, dropdown),
          )
          .toBe(true);
        await page
          .locator("[data-parity-case]")
          .evaluateAll((els) => els.forEach((el) => el.removeAttribute("data-parity-case")));
        await content.evaluate((el) => {
          el.setAttribute("data-parity-case", "dropdown");
          el.setAttribute(
            "data-parity-parts",
            JSON.stringify({
              viewport: ".openui-select-viewport",
              selected: '.openui-select-item[data-state="checked"]',
              item: ".openui-select-item",
            }),
          );
        });
      } else {
        for (const day of [10, 15, 16, 18, 20])
          await page
            .locator(`[data-day="2026-10-${day}"]`)
            .first()
            .evaluate((el, day) => {
              el.setAttribute("data-parity-case", `day-${day}`);
              el.setAttribute("data-parity-parts", JSON.stringify({ button: "button" }));
            }, day);
      }
    },
  });
});
