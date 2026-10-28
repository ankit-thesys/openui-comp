// Server-rendered first paint in Chromium: a page built the way the README documents (render, then
// collect with getComponentStyles(), then put the sheet first in <head>) is styled before any
// JavaScript runs, a later consumer stylesheet still overrides it, and the client adopts the sheet.
import { Button, getComponentStyles } from "@openuidev/react-components";
import { expect, test, type Page } from "@playwright/test";
import { createElement, Fragment } from "react";
import { renderToString } from "react-dom/server";

// `data-*` attributes pass through Button's rest props; JSX allows them, object literals do not.
const testId = (id: string): Record<string, string> => ({ "data-testid": id });

// The same Buttons the client fixture `button.tsx` renders, minus its icon.
const serverPage = (headAfterSheet = "", script = "") => {
  const html = renderToString(
    createElement(
      Fragment,
      null,
      createElement(Button, testId("default"), "Default"),
      createElement(
        Button,
        { ...testId("custom"), variant: "secondary", size: "small", tone: "destructive" },
        "Custom",
      ),
    ),
  );
  return (
    `<!doctype html><html><head><meta charset="utf-8">` +
    `<style id="_goober">${getComponentStyles()}</style>${headAfterSheet}</head>` +
    `<body><div id="root">${html}</div>${script}</body></html>`
  );
};

const PROPERTIES = [
  "color",
  "background-color",
  "border-color",
  "border-radius",
  "padding",
  "font-size",
  "display",
] as const;

const computed = (page: Page, testId: string) =>
  page.getByTestId(testId).evaluate((el, properties) => {
    el.getAnimations().forEach((animation) => animation.finish());
    const style = getComputedStyle(el);
    return Object.fromEntries(properties.map((p) => [p, style.getPropertyValue(p)]));
  }, PROPERTIES);

// Serves `body` as /ssr.html on the fixture server's origin, so it can load fixture bundles.
const openServerPage = async (page: Page, body: string) => {
  await page.route("**/ssr.html", (route) => route.fulfill({ contentType: "text/html", body }));
  await page.goto("/ssr.html");
};

test.describe("with JavaScript disabled", () => {
  test.use({ javaScriptEnabled: false });

  test("server markup plus collected CSS renders Button as the client does", async ({
    browser,
    page,
  }) => {
    const client = await browser.newPage({ javaScriptEnabled: true });
    await client.goto("/button.html");
    await expect(client.getByTestId("custom")).toBeVisible();

    await openServerPage(page, serverPage());

    for (const testId of ["default", "custom"]) {
      expect(await computed(page, testId)).toEqual(await computed(client, testId));
    }
    expect((await computed(page, "default"))["background-color"]).not.toBe("rgba(0, 0, 0, 0)");
    await client.close();
  });

  test("a consumer stylesheet after the collected CSS overrides Button", async ({ page }) => {
    const override = "rgb(4, 5, 6)";
    await openServerPage(
      page,
      serverPage(
        `<style>.openui-button--variant-primary { background-color: ${override}; }</style>`,
      ),
    );

    expect((await computed(page, "default"))["background-color"]).toBe(override);
  });
});

test("the client adopts the server sheet instead of adding a second one", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await openServerPage(page, serverPage("", `<script type="module" src="/button.js"></script>`));
  await expect(page.getByTestId("custom")).toBeVisible();
  await expect(page.locator("#root > button")).toHaveCount(3);

  expect(errors).toEqual([]);
  expect(await page.locator("style#_goober").count()).toBe(1);
  expect((await computed(page, "default"))["background-color"]).not.toBe("rgba(0, 0, 0, 0)");
});

test("an empty server sheet breaks the client, which is why getComponentStyles never returns one", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const empty = serverPage("", `<script type="module" src="/button.js"></script>`).replace(
    /<style id="_goober">[\s\S]*?<\/style>/,
    `<style id="_goober"></style>`,
  );

  await openServerPage(page, empty);
  await expect.poll(() => errors.length).toBeGreaterThan(0);
});
