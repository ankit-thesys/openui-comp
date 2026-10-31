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

test("hydration and a genuinely new browser rule", async ({ page }) => {
  const errors = watchErrors(page);
  const response = await page.goto("/");
  expect(await response!.text()).not.toContain("background-color:rgb(17, 34, 51)");
  await hydrated(page);
  const before = await assertSheets(page, layer);
  await page.getByRole("button", { name: "Load browser component" }).click();
  const lazy = page.locator("[data-browser-only]");
  await expect(lazy).toHaveCSS("background-color", "rgb(17, 34, 51)");
  await expect(lazy).toHaveCSS("padding-top", "19px");
  await expect(lazy).toHaveCSS("opacity", "1");
  expect(await assertSheets(page, layer)).toBeGreaterThan(before);
  await page.getByRole("button", { name: "Rerender" }).click();
  await expect(page.locator("[data-renders]")).toHaveAttribute("data-renders", "1");
  await assertSheets(page, layer);
  await headOrder(page);
  expect(await page.evaluate(() => window.__compat.recoverable)).toEqual([]);
  expect(errors, "console, hydration and uncaught errors through interaction").toEqual([]);
});
