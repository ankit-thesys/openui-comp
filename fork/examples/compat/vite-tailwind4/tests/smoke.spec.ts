import { expect, test } from "@playwright/test";
import { smoke } from "../../shared/smoke";

const mode = process.env["OPENUI_COMPAT_MODE"] ?? "layered";
if (mode !== "layered") throw new Error("Tailwind utility precedence requires layered mode");

test("Tailwind 4 preflight, head recipe and utility precedence", async ({ page }) => {
  // The unchanged fixed samples prove preflight preserves background, radius, font and padding.
  await smoke(page, expect, {
    layer: "openui",
    serverSheets: 0,
    ready: '[data-compat-ready][data-compat-mode="layered"]',
  });

  const order = await page.evaluate(() => {
    const tags = [...document.head.children];
    const layers = tags.findIndex((tag) =>
      /@layer\s+theme\s*,\s*base\s*,\s*openui\s*,\s*components\s*,\s*utilities\s*;/.test(
        tag.textContent ?? "",
      ),
    );
    const sheet = tags.findIndex((tag) => tag.id === "openui-styles");
    const app = tags.findIndex((tag) =>
      tag.matches('link[rel="stylesheet"]:not([data-compat-overrides])'),
    );
    return { layers, sheet, app };
  });
  expect(order.layers).toBeGreaterThanOrEqual(0);
  expect(order.sheet).toBeGreaterThan(order.layers);
  expect(order.app).toBeGreaterThan(order.sheet);

  // A bare control proves the real base preflight is active, not disabled for this fixture.
  await expect(page.locator("[data-preflight]")).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(page.locator("[data-preflight]")).toHaveCSS("padding-left", "0px");
  await expect(page.locator("[data-preflight]")).toHaveCSS("border-radius", "0px");

  await page.locator("link[data-compat-overrides]").evaluate((link) => {
    (link as HTMLLinkElement).media = "not all";
  });
  await page.locator("[data-preflight]").click();
  const reference = await page.locator("[data-utility-reference]").evaluate((element) => {
    const css = getComputedStyle(element);
    return { background: css.backgroundColor, radius: css.borderRadius, padding: css.paddingLeft };
  });
  const button = page.locator(".openui-button");
  await expect(button).toHaveClass(/bg-red-500/);
  await expect(button).toHaveCSS("background-color", reference.background);
  await expect(button).toHaveCSS("border-radius", "0px");
  await expect(button).toHaveCSS("padding-left", "32px");
  await expect(button).toHaveCSS("padding-right", "32px");
  expect(reference.radius).toBe("0px");
  expect(reference.padding).toBe("32px");
  expect(reference.background).not.toBe("rgba(0, 0, 0, 0)");
});
