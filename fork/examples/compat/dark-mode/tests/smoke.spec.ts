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

test("dark defaults apply to server HTML before hydration", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(baseURL!);
    await expect(page.locator("[data-theme-probe]")).toHaveCSS(
      "background-color",
      "oklch(0.985 0 89.876)",
    );
    await expect(page.locator("[data-theme-probe]")).toHaveCSS(
      "--openui-text-neutral-primary",
      "oklch(0.985 0 89.876 / 1)",
    );
    await headOrder(page);
  } finally {
    await context.close();
  }
});

test("record first paint, detect flash, and toggle the documented ThemeProvider mode", async ({
  page,
}, testInfo) => {
  const errors = watchErrors(page);
  // Hold hydration until the server HTML has had two animation frames to paint.
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/assets/entry-client-*.js", async (route) => {
    await gate;
    await route.continue();
  });
  try {
    await page.goto("/", { waitUntil: "commit" });
    await expect
      .poll(() => page.evaluate(() => window.__compat?.frames.length ?? 0))
      .toBeGreaterThan(1);
    expect(await page.evaluate(() => window.__compat.hydrated), "server-only paint gate").toBe(
      false,
    );
  } finally {
    release();
  }
  await page.waitForLoadState("load");
  await hydrated(page);
  const probe = page.locator("[data-theme-probe]");
  await expect(probe).toHaveCSS("background-color", "oklch(0.985 0 89.876)");
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await expect(probe).toHaveCSS("background-color", "oklch(0.097 0 0)");
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await expect(probe).toHaveCSS("background-color", "oklch(0.985 0 89.876)");
  await assertSheets(page, layer);
  const paint = await page.evaluate(() => ({
    first: window.__compat.firstPaint,
    frames: window.__compat.frames,
  }));
  const flashed =
    paint.first.background !== "oklch(0.985 0 89.876)" ||
    paint.frames.some((color) => color !== "oklch(0.985 0 89.876)");
  await testInfo.attach("first-paint.json", {
    body: JSON.stringify({ ...paint, flashed }, null, 2),
    contentType: "application/json",
  });
  expect(paint.first.background, "dark server HTML must be styled before the module runs").toBe(
    "oklch(0.985 0 89.876)",
  );
  expect(flashed, "flash of light or missing theme before hydration").toBe(false);
  expect(await page.evaluate(() => window.__compat.recoverable)).toEqual([]);
  expect(errors).toEqual([]);
});
