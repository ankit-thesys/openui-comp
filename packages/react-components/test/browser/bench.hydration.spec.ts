// Hydration bench: the bench app, server-rendered in light and dark, hydrates with no mismatch and
// no render error, in this package and in @openuidev/react-ui for comparison.
import { expect, test } from "@playwright/test";
import { openBench, PACKAGES } from "./bench/app";

for (const pkg of PACKAGES) {
  for (const mode of ["light", "dark"] as const) {
    test(`${pkg}: hydrates without mismatches or errors (${mode})`, async ({ page }) => {
      await openBench(page, pkg, mode);
      const report = await page.evaluate(() => window.__hydration);
      const renderErrors = await page
        .locator("[data-render-error]")
        .evaluateAll((elements) =>
          elements.map((el) => `${el.getAttribute("data-render-error")}: ${el.textContent}`),
        );
      expect.soft(report.uncaught, "uncaught errors").toEqual([]);
      expect.soft(report.caught, "caught errors").toEqual([]);
      expect.soft(renderErrors, "component render errors").toEqual([]);
      expect(report.recoverable, "recoverable (hydration mismatch) errors").toEqual([]);
    });
  }
}
