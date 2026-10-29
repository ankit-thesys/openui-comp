// Browser seam: the built package, bundled like a consumer app would, styles Button in Chromium.
// Run after `pnpm build`: `pnpm test:browser`.
import { expect, test } from "@playwright/test";

test("built Button is styled by the library", async ({ page }) => {
  await page.goto("/smoke.html");

  const button = page.getByRole("button", { name: "Save" });
  const unstyled = page.getByRole("button", { name: "Plain" });
  await expect(button).toBeVisible();

  const look = (el: HTMLElement) => {
    const style = getComputedStyle(el);
    return { background: style.backgroundColor, radius: style.borderRadius, cursor: style.cursor };
  };
  const styled = await button.evaluate(look);
  const plain = await unstyled.evaluate(look);

  // A plain <button> on the same page keeps the browser's defaults.
  expect(styled.background).not.toBe(plain.background);
  expect(styled.radius).not.toBe(plain.radius);
  expect(styled.cursor).toBe("pointer");
});
