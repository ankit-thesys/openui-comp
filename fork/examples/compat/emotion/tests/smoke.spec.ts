import { expect, test } from "@playwright/test";
import { smoke } from "../../shared/smoke";
const mode = process.env["OPENUI_COMPAT_MODE"] ?? "unlayered";
if (mode !== "layered" && mode !== "unlayered") throw new Error(`Invalid mode: ${mode}`);

test(`host CSS coexistence and component contract (${mode})`, async ({ page }) => {
  const response = await page.request.get("/");
  expect(response.ok()).toBe(true);
  const html = await response.text();
  const head = html.split("</head>")[0];
  expect(head, "host CSS is present before hydration").toMatch(/data-emotion="host/);
  expect(head, "component CSS is present before hydration").toMatch(/data-href="openui-styles"/);
  await smoke(page, expect, {
    layer: mode === "layered" ? "openui" : false,
    serverSheets: 1,
    ready: `[data-compat-ready][data-compat-mode="${mode}"]`,
    enableOverrides: async () => {
      await expect(page.locator("head style[data-href='openui-styles']")).toHaveCount(1);
      if (mode === "layered") {
        await expect(page.locator("head style[data-href='compat-layer-order']")).toHaveCount(1);
        expect(
          await page.evaluate(() => {
            const order = document.querySelector("style[data-href='compat-layer-order']")!;
            const sheet = document.querySelector("style[data-href='openui-styles']")!;
            return !!(order.compareDocumentPosition(sheet) & Node.DOCUMENT_POSITION_FOLLOWING);
          }),
          "layer order precedes component sheet",
        ).toBe(true);
      }
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
      await expect(page.locator("head style[data-emotion]")).not.toHaveCount(0);
      await expect(page.locator("[data-host-styled]")).toHaveCSS(
        "background-color",
        "rgb(21, 43, 65)",
      );
      await expect(page.locator("[data-host-styled]")).toHaveCSS("padding-top", "13px");
      await page.getByRole("button", { name: "Update host" }).click();
      await page.mouse.move(0, 0);
      await expect(page.locator("[data-host-dynamic]")).toHaveCSS(
        "background-color",
        "rgb(65, 43, 21)",
      );
      await page.locator("link[data-compat-overrides]").evaluate((element) => {
        (element as HTMLLinkElement).media = "all";
      });
    },
  });
});
