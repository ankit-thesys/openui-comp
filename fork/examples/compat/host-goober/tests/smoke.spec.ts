import { expect, test } from "@playwright/test";
import { smoke } from "../../shared/smoke";
const mode = process.env["OPENUI_COMPAT_MODE"] ?? "unlayered";
if (mode !== "layered" && mode !== "unlayered") throw new Error(`Invalid mode: ${mode}`);

test(`host CSS coexistence and component contract (${mode})`, async ({ page }) => {
  for (let request = 0; request < 2; request++) {
    const response = await page.request.get("/");
    expect(response.ok()).toBe(true);
    const html = await response.text();
    const head = html.split("</head>")[0];
    expect(head, "host CSS is present before hydration").toMatch(/id="_goober"/);
    expect(head, "component CSS is present before hydration").toMatch(/id="openui-styles"/);
    expect(head, "glob CSS survives consecutive server requests").toContain(".host-global{");
  }
  await smoke(page, expect, {
    layer: mode === "layered" ? "openui" : false,
    // This SSR renderer uses #openui-styles itself; there is no separate React-owned tag.
    serverSheets: 0,
    ready: `[data-compat-ready][data-compat-mode="${mode}"]`,
    enableOverrides: async () => {
      await expect(page.locator("head #_goober")).toHaveCount(1);
      await expect(page.locator("head #openui-styles")).toHaveCount(1);
      await expect(page.locator("[data-host-global]")).toHaveCSS("color", "rgb(17, 34, 51)");
      const library = await page.locator("#openui-styles").elementHandle();
      const host = await page.locator("#_goober").elementHandle();
      const componentCss = await library!.textContent();
      expect(componentCss).not.toContain("--host-prefixer");
      expect(await host!.textContent()).toContain("--host-prefixer:active");
      await expect(page.locator("[data-host-styled]")).toHaveCSS("--host-prefixer", "active");
      await expect(page.locator("[data-host-styled]")).toHaveCSS(
        "background-color",
        "rgb(21, 43, 65)",
      );
      await expect(page.locator("[data-host-styled]")).toHaveCSS("padding-top", "13px");
      await page.getByRole("button", { name: "Update host" }).click();
      await page.mouse.move(0, 0);
      await expect(page.locator("[data-host-styled]")).toHaveCSS(
        "background-color",
        "rgb(65, 43, 21)",
      );
      await expect(page.locator("[data-host-styled]")).toHaveCSS("--host-prefixer", "active");
      expect(
        await library!.evaluate((node) => node === document.getElementById("openui-styles")),
      ).toBe(true);
      expect(await host!.evaluate((node) => node === document.getElementById("_goober"))).toBe(
        true,
      );
      expect(await library!.textContent(), "host glob/styled leave component rules intact").toBe(
        componentCss,
      );
      await expect(page.locator("[data-host-global]")).toHaveCSS("color", "rgb(17, 34, 51)");
      await page.locator("link[data-compat-overrides]").evaluate((element) => {
        (element as HTMLLinkElement).media = "all";
      });
    },
  });
});
