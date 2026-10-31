import { expect, test } from "@playwright/test";
import defaultTheme from "../../shared/default-theme.json" with { type: "json" };
import { smoke } from "../../shared/smoke";
import { checkStream } from "../scripts/check-stream.mjs";

const mode = process.env["OPENUI_COMPAT_MODE"] ?? "unlayered";
if (mode !== "layered" && mode !== "unlayered") throw new Error(`Invalid mode: ${mode}`);

test(`streaming, server sheet and hydration (${mode})`, async ({ page, browser }) => {
  await checkStream(mode);
  let serverText: string | null = null;
  await page.route("**/assets/*.js", async (route) => {
    // Capture the original server sheet before the first client module executes.
    serverText ??= await page.locator("style[data-openui-styles]").textContent();
    await route.continue();
  });
  await smoke(page, expect, {
    layer: mode === "layered" ? "openui" : false,
    serverSheets: 1,
    ready: `[data-compat-ready][data-compat-mode="${mode}"] [data-streamed][data-hydrated="true"]`,
  });
  expect(serverText).not.toBeNull();
  expect(await page.locator("style[data-openui-styles]").textContent()).toBe(serverText);
  expect(
    await page.locator("style[data-openui-styles]").evaluate((tag) => {
      const app = document.querySelector('link[rel="stylesheet"]');
      return (
        tag.parentElement === document.head &&
        !!app &&
        !!(tag.compareDocumentPosition(app) & Node.DOCUMENT_POSITION_FOLLOWING)
      );
    }),
  ).toBe(true);

  // The shell Button is styled even with scripts disabled, before ThemeProvider runs.
  const noJS = await browser.newContext({ javaScriptEnabled: false });
  try {
    const firstPaint = await noJS.newPage();
    await firstPaint.goto(page.url());
    const sample = defaultTheme.find((sample) => sample.selector === ".openui-button")!;
    for (const [property, value] of Object.entries(sample.styles)) {
      await expect(firstPaint.locator(sample.selector)).toHaveCSS(property, value);
    }
  } finally {
    await noJS.close();
  }
});
