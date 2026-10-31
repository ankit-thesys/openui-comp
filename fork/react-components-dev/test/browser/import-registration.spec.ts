// Import-time rules belong to the component store. Nothing marks <html>: the token defaults apply
// to :root itself, so a server-rendered document hydrates without an attribute mismatch.
import { expect, test, type Page } from "@playwright/test";

const observe = (page: Page) =>
  page.evaluate(() => ({
    html: [...document.documentElement.classList],
    host: document.getElementById("_goober"),
    componentSheet: document.getElementById("openui-styles")?.textContent ?? "",
    rules: [
      ...(document.getElementById("openui-defaults") as HTMLStyleElement).sheet!.cssRules,
    ].map((rule) => rule.cssText),
  }));

test("importing every component leaves host Goober and html alone", async ({ page }) => {
  await page.goto("/import-registration.html");
  await page.waitForFunction(
    () => typeof (window as Window & { renderButton?: unknown }).renderButton === "function",
  );
  expect(
    await page.evaluate(() => (window as Window & { exportCount?: number }).exportCount),
  ).toBeGreaterThan(100);
  const imported = await observe(page);
  expect(imported.componentSheet).toMatch(/\.go\d+\{/);
  expect(imported.host).toBeNull();
  expect(imported.html).toEqual([]);
  expect(imported.rules).toHaveLength(1);
  expect(imported.rules[0]).toMatch(/^@layer openui-defaults \{\s*:where\(:root\) \{/);

  // The component sheet is live, and rendering leaves the defaults and <html> alone.
  await page.evaluate(() => (window as Window & { renderButton?: () => void }).renderButton!());
  await expect(page.locator(".openui-button")).toBeVisible();
  const rendered = await observe(page);
  const classes = (await page.locator(".openui-button").getAttribute("class"))!
    .split(" ")
    .filter((name) => /^go\d+$/.test(name));
  expect(classes.length).toBeGreaterThan(0);
  for (const name of classes) expect(imported.componentSheet).toContain(`.${name}{`);
  expect(rendered.componentSheet).toMatch(/\.go\d+\{/);
  expect(rendered.rules).toEqual(imported.rules);
  expect(rendered.host).toBeNull();
  expect(rendered.html).toEqual(imported.html);
});
