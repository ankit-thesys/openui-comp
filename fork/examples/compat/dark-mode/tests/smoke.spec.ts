import { expect, test } from "@playwright/test";
import { smoke } from "../../shared/smoke";
import { assertSheets, headOrder, hydrated, watchErrors } from "./contract";
const mode = process.env["OPENUI_COMPAT_MODE"] ?? "unlayered";
if (mode !== "layered" && mode !== "unlayered") throw new Error(`Invalid mode: ${mode}`);
const layer = mode === "layered" ? "openui" : false;

// KNOWN LIMITATION (#169): ThemeProvider writes its theme variables in an insertion effect, and the
// token defaults register only in the browser, so server HTML carries no theme tokens. A
// server-rendered `mode="dark"` page first paints without them and turns dark once the client
// module runs (the package README's "Server-rendered styles" says so; production react-ui's
// ThemeProvider behaves the same). These values pin today's first paint exactly: when the server
// emits theme tokens, they fail and must become the dark values below.
const DARK = "oklch(0.985 0 89.876)";
const UNTHEMED = "rgba(0, 0, 0, 0)";
const LIGHT = "oklch(0.097 0 0)";

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

test("server HTML before hydration has no theme tokens (known limitation)", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(baseURL!);
    await expect(page.locator("[data-theme-probe]")).toHaveCSS("background-color", UNTHEMED);
    expect(
      await page
        .locator("[data-theme-probe]")
        .evaluate((probe) =>
          getComputedStyle(probe).getPropertyValue("--openui-text-neutral-primary"),
        ),
    ).toBe("");
    await headOrder(page);
    test.info().annotations.push({
      type: "known limitation",
      description: "server HTML has no theme tokens; dark mode applies once the client runs",
    });
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
  await expect(probe).toHaveCSS("background-color", DARK);
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await expect(probe).toHaveCSS("background-color", LIGHT);
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await expect(probe).toHaveCSS("background-color", DARK);
  await assertSheets(page, layer);
  const paint = await page.evaluate(() => ({
    first: window.__compat.firstPaint,
    frames: window.__compat.frames,
  }));
  const flashed = paint.first.background !== DARK || paint.frames.some((color) => color !== DARK);
  await testInfo.attach("first-paint.json", {
    body: JSON.stringify({ ...paint, flashed }, null, 2),
    contentType: "application/json",
  });
  // Known limitation: the server paint has no theme, so the dark page flashes until hydration.
  expect(paint.first.background, "server HTML first paint (known limitation)").toBe(UNTHEMED);
  // Frames step forward only: unthemed server HTML, then the light token defaults once the module
  // evaluates (before ThemeProvider's insertion effect commits), then dark. Whether a light frame
  // is caught depends on timing; going back, or any other color, fails.
  const stages = [UNTHEMED, LIGHT, DARK];
  const ranks = paint.frames.map((color) => stages.indexOf(color));
  expect(
    [...new Set(paint.frames)].filter((color) => !stages.includes(color)),
    "pre-hydration frame colors other than unthemed, light defaults or dark",
  ).toEqual([]);
  expect(
    ranks.every((rank, index) => index === 0 || rank >= ranks[index - 1]!),
    `frames move from unthemed to light defaults to dark: ${JSON.stringify(paint.frames)}`,
  ).toBe(true);
  expect(flashed, "flash of missing theme before hydration (known limitation)").toBe(true);
  testInfo.annotations.push({
    type: "known limitation",
    description: "dark server HTML paints without theme tokens until the client module runs",
  });
  expect(await page.evaluate(() => window.__compat.recoverable)).toEqual([]);
  expect(errors).toEqual([]);
});
