import { expect, test } from "@playwright/test";
import { smoke } from "../../shared/smoke";
const mode = process.env["OPENUI_COMPAT_MODE"] ?? "unlayered";
if (mode !== "layered" && mode !== "unlayered") throw new Error(`Invalid mode: ${mode}`);
if (mode !== "unlayered") throw new Error("Tailwind 3 tests the unlayered order trick");

test(`host CSS coexistence and component contract (${mode})`, async ({ page }) => {
  const response = await page.request.get("/");
  expect(response.ok()).toBe(true);
  const html = await response.text();
  const head = html.split("</head>")[0];
  expect(head, "host CSS is present before hydration").toMatch(/rel="stylesheet"/);
  expect(head, "component CSS is present before hydration").toMatch(/data-href="openui-styles"/);
  await smoke(page, expect, {
    layer: false,
    serverSheets: 1,
    ready: `[data-compat-ready][data-compat-mode="${mode}"]`,
    enableOverrides: async () => {
      await expect(page.locator("head style[data-href='openui-styles']")).toHaveCount(1);
      const order = await page.evaluate(() => {
        const sheet = document.querySelector("style[data-href='openui-styles']")!;
        const links = [
          ...document.querySelectorAll("head link[rel='stylesheet']:not([data-compat-overrides])"),
        ];
        return {
          count: links.length,
          after: links.every(
            (link) => !!(sheet.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING),
          ),
        };
      });
      expect(order.count, "page CSS must be present").toBeGreaterThan(0);
      if (mode === "unlayered")
        expect(order.after, "page CSS follows the component sheet").toBe(true);
      await expect(page.locator("[data-host-utility]")).toHaveCSS(
        "background-color",
        "rgb(21, 43, 65)",
      );
      await expect(page.locator("[data-host-utility]")).toHaveCSS("padding-top", "13px");
      await expect(page.locator("[data-host-module]")).toHaveCSS("color", "rgb(17, 34, 51)");
      await expect(page.locator("[data-host-module]")).toHaveCSS("border-top-left-radius", "9px");
      await page.getByRole("button", { name: "Use Tailwind override" }).click();
      await page.mouse.move(0, 0);
      await expect(page.locator(".openui-button")).toHaveCSS("background-color", "rgb(12, 34, 56)");
      await page.getByRole("button", { name: "Use Module override" }).click();
      await page.mouse.move(0, 0);
      await expect(page.locator(".openui-button")).toHaveCSS("background-color", "rgb(65, 43, 21)");
      await page.locator("link[data-compat-overrides]").evaluate((element) => {
        (element as HTMLLinkElement).media = "all";
      });
    },
  });
});
