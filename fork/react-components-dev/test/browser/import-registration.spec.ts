// Importing the package registers no component CSS and adds no class to <html> in a browser: styles
// register when a component renders (ADR 0001, Q27). The only import-time rule is the token
// defaults' `:where(.goN:root)` block in `@layer openui-defaults`, with its marker class on <html>
// (Q29). The Node half, which imports every built module, is test/unit/import-registration.test.ts.
import { expect, test, type Page } from "@playwright/test";

const observe = (page: Page) =>
  page.evaluate(() => ({
    html: [...document.documentElement.classList],
    rules: [...(document.getElementById("_goober") as HTMLStyleElement).sheet!.cssRules].map(
      (rule) => rule.cssText,
    ),
  }));

test("importing every component registers only the token defaults", async ({ page }) => {
  await page.goto("/import-registration.html");
  await page.waitForFunction(
    () => typeof (window as Window & { renderButton?: unknown }).renderButton === "function",
  );
  expect(
    await page.evaluate(() => (window as Window & { exportCount?: number }).exportCount),
  ).toBeGreaterThan(100);
  const imported = await observe(page);
  expect(imported.html).toHaveLength(1);
  const [marker] = imported.html;
  expect(marker).toMatch(/^go\d+$/);
  expect(imported.rules).toHaveLength(1);
  expect(imported.rules[0]).toMatch(
    new RegExp(`^@layer openui-defaults \\{\\s*:where\\(\\.${marker}:root\\) \\{`),
  );

  // The sheet is live: rendering registers the component's rules and leaves <html> alone.
  await page.evaluate(() => (window as Window & { renderButton?: () => void }).renderButton!());
  await expect(page.locator(".openui-button")).toBeVisible();
  const rendered = await observe(page);
  expect(rendered.rules.length).toBeGreaterThan(1);
  expect(rendered.html).toEqual(imported.html);
});
