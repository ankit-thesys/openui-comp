import { expect, test } from "@playwright/test";
import { smoke } from "../../shared/smoke";
import { assertSheets, headOrder, hydrated, watchErrors } from "./contract";
const mode = process.env["OPENUI_COMPAT_MODE"] ?? "unlayered";
if (mode !== "layered" && mode !== "unlayered") throw new Error(`Invalid mode: ${mode}`);
const layer = mode === "layered" ? "openui" : false;

test(`shared style and hydration contract (${mode})`, async ({ page }) => {
  await smoke(page, expect, {
    layer,
    serverSheets: 1,
    path: "/?theme=light",
    ready: `[data-compat-ready][data-compat-mode="${mode}"]`,
  });
  await hydrated(page);
  await headOrder(page);
});

test("local library is styled before hydration", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(baseURL!);
    await expect(page.locator("[data-price-card]")).toHaveCSS(
      "background-color",
      "rgb(42, 63, 84)",
    );
    await expect(page.locator("[data-price-card]")).toHaveCSS("padding-top", "23px");
    expect(await page.locator("style[data-openui-styles]").textContent()).toContain(
      "outline-offset:1px",
    );
    await headOrder(page);
    await assertSheets(page, layer);
  } finally {
    await context.close();
  }
});

test("own collector includes lazy rules once; hydration and lazy import add no copies", async ({
  page,
}) => {
  const errors = watchErrors(page);
  await page.goto("/");
  await hydrated(page);
  const serverText = await page.locator("style[data-openui-styles]").textContent();
  expect(serverText).toContain("rgb(91, 72, 53)");
  const before = await assertSheets(page, layer);
  await expect(page.locator("[data-price-card]")).toHaveCSS("padding-top", "23px");
  await page.getByRole("button", { name: "Load browser component" }).click();
  await expect(page.locator("[data-price-badge]")).toHaveCSS("border-top-color", "rgb(91, 72, 53)");
  await expect(page.locator("[data-price-badge]")).toHaveCSS("padding-top", "13px");
  expect(await assertSheets(page, layer)).toBe(before);
  expect(await page.locator("style[data-openui-styles]").textContent()).toBe(serverText);
  expect(await page.evaluate(() => window.__compat.recoverable)).toEqual([]);
  expect(errors).toEqual([]);
});
