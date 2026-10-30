// Server-rendered first paint in Chromium: a page built the way the README documents (render, then
// collect with getComponentStyles(), then put the sheet first in <head>) is styled before any
// JavaScript runs, a later consumer stylesheet still overrides it, and the client adopts the sheet.
import {
  Button,
  configureStyles,
  getComponentStyles,
  Separator,
  Tag,
} from "@openuidev/react-components";
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
    `<style id="openui-styles">${getComponentStyles()}</style>${headAfterSheet}</head>` +
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
  expect(await page.locator("style#openui-styles").count()).toBe(1);
  expect((await computed(page, "default"))["background-color"]).not.toBe("rgba(0, 0, 0, 0)");
});

test("rules for server-only components survive the client's first sheet write", async ({
  page,
}) => {
  // Rendered on the server only: the client fixture renders Buttons, never a Tag.
  const tag = renderToString(createElement(Tag, { text: "Server only" }));
  const tagClasses = [...tag.matchAll(/\b(go\d+)\b/g)].map(([, name]) => name!);
  const body = `<div id="server-only">${tag}</div><script type="module" src="/button.js"></script>`;
  await openServerPage(page, serverPage("", body));
  // The client's Button icon part registers rules the server sheet lacks, so it writes.
  await expect(page.getByTestId("custom").locator("svg")).toBeAttached();
  await page.evaluate(() => new Promise((resolve) => setTimeout(resolve)));

  const { text, buttonClasses, tagDisplay } = await page.evaluate(() => ({
    text: document.getElementById("openui-styles")!.textContent!,
    buttonClasses: [...document.querySelector("[data-testid=default]")!.classList],
    tagDisplay: getComputedStyle(document.querySelector("#server-only > *")!).display,
  }));
  const occurrences = (name: string) => text.split(`.${name}{`).length - 1;
  expect(tagClasses.length).toBeGreaterThan(0);
  expect(tagClasses.map(occurrences)).toEqual(tagClasses.map(() => 1));
  const buttonRoots = buttonClasses.filter((name) => /^go\d+$/.test(name));
  expect(buttonRoots.map(occurrences)).toEqual(buttonRoots.map(() => 1));
  expect(tagDisplay).not.toBe("inline");
});

test("an empty library sheet tag left by the host still works on the client", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const empty = serverPage("", `<script type="module" src="/button.js"></script>`).replace(
    /<style id="openui-styles">[\s\S]*?<\/style>/,
    `<style id="openui-styles"></style>`,
  );

  await openServerPage(page, empty);
  await expect(page.locator("#root > button")).toHaveCount(3);
  expect(errors).toEqual([]);
  expect((await computed(page, "default"))["background-color"]).not.toBe("rgba(0, 0, 0, 0)");
});

// The app-wide layer across hydration (configureStyles on server and client): the client seeds from
// the server's one wrapped sheet, so writes wrap it once more instead of nesting, and a rule that
// registers only after hydration, or only on the server, ends up in the sheet exactly once.
for (const layer of ["openui", undefined]) {
  test(`hydration keeps one ${layer ? `${layer} layer` : "unlayered sheet"} with late and server-only rules`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    configureStyles({ layer });
    let body: string;
    let serverOnlyClasses: string[];
    try {
      // Rendered on the server only, outside the hydrated root.
      const serverOnly = renderToString(createElement(Separator));
      serverOnlyClasses = [...serverOnly.matchAll(/\b(go\d+)\b/g)].map(([, name]) => name!);
      // The page itself has no query string, so the layer reaches the client fixture as markup.
      body = serverPage(
        "",
        `<div data-testid="server-only">${serverOnly}</div>` +
          (layer ? `<div id="ssr-layer" data-layer="${layer}" hidden></div>` : "") +
          `<script type="module" src="/ssr-hydrate.js"></script>`,
      );
    } finally {
      configureStyles({ layer: undefined });
    }
    if (layer) expect(body).toContain(`<style id="openui-styles">@layer ${layer}{`);

    await openServerPage(page, body);
    await expect(page.getByTestId("late").locator("*").first()).toBeVisible();
    await page.evaluate(() => new Promise((resolve) => setTimeout(resolve)));

    const { text, sheets, lateClasses, lateDisplay, serverOnlyHeight } = await page.evaluate(() => {
      const late = document.querySelector("[data-testid=late] > *")!;
      return {
        text: document.getElementById("openui-styles")!.textContent!,
        sheets: document.querySelectorAll("style#openui-styles").length,
        lateClasses: [...late.classList].filter((name) => /^go\d+$/.test(name)),
        lateDisplay: getComputedStyle(late).display,
        serverOnlyHeight: getComputedStyle(document.querySelector("[data-testid=server-only] > *")!)
          .height,
      };
    });
    const occurrences = (name: string) => text.split(`.${name}{`).length - 1;
    expect(errors).toEqual([]);
    expect(sheets).toBe(1);
    if (layer) {
      expect(text.startsWith(`@layer ${layer}{`)).toBe(true);
      expect(text.endsWith("}")).toBe(true);
    } else expect(text.startsWith("@layer")).toBe(false);
    expect(text).not.toContain("@layer openui{@layer openui{");
    expect(text.split("@layer ").length - 1).toBe(layer ? 1 : 0);
    expect(lateClasses.length).toBeGreaterThan(0);
    expect(lateClasses.map(occurrences)).toEqual(lateClasses.map(() => 1));
    expect(lateDisplay).not.toBe("inline");
    expect(serverOnlyClasses.length).toBeGreaterThan(0);
    expect(serverOnlyClasses.map(occurrences)).toEqual(serverOnlyClasses.map(() => 1));
    expect(serverOnlyHeight).toBe("1px");
  });
}
