// The component library in a whole server-rendered document, as React Router, TanStack Start and
// Next render one. Importing the library adds its token-default tags to <head> before hydration;
// React must neither match the app's own <style> against them nor see a class it did not render
// on <html>. Each mode hydrates without an error and keeps the server's nodes.
import { getComponentStyles } from "@openuidev/react-components/styles";
import { expect, test } from "@playwright/test";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { Document } from "./fixtures/document-app";

for (const layer of [undefined, "openui"]) {
  test(`a server-rendered document hydrates without a mismatch, layer=${layer ?? "none"}`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(`console: ${message.text()}`);
    });
    const body =
      "<!doctype html>" +
      renderToString(createElement(Document, { sheet: getComponentStyles({ layer }), layer }));
    await page.route("**/document.html?*", (route) =>
      route.fulfill({ contentType: "text/html", body }),
    );
    await page.goto(`/document.html?layer=${layer ?? ""}`);
    // A marker on a server node: a client re-render after a mismatch would replace the node.
    await page.evaluate(() => {
      (document.querySelector("[data-app-layer-order]") as HTMLElement & { server?: true }).server =
        true;
    });
    await expect(page.locator("main[data-hydrated]")).toBeVisible();
    expect(errors).toEqual([]);
    const state = await page.evaluate(() => ({
      server: !!(document.querySelector("[data-app-layer-order]") as { server?: true }).server,
      appOrder: document.querySelectorAll("[data-app-layer-order]").length,
      htmlClass: document.documentElement.getAttribute("class"),
    }));
    expect(state).toEqual({ server: true, appOrder: 1, htmlClass: null });
    await expect(page.getByTestId("default")).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  });
}

// `next dev` hydrates <html> with React's development build, which reports any attribute React did
// not render: a class the token defaults once added to <html> showed up there as "A tree hydrated
// but some attributes of the server rendered HTML didn't match" with `className="go…"`. The
// production document above cannot see that report.
test("a document hydrated by React's development build reports no mismatch", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" || /hydrat|did not match/i.test(message.text()))
      errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/document-dev.html", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><html lang="en"><head><script type="module" src="/document-hydrate-dev-development.js"></script></head><body><main id="app">Document</main></body></html>`,
    }),
  );
  await page.goto("/document-dev.html");
  await page.waitForFunction(() => (window as Window & { hydrated?: boolean }).hydrated);
  // Hydration mismatches are reported after the commit.
  await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 100)));
  const result = await page.evaluate(() => ({
    loaded: (window as Window & { packageLoaded?: boolean }).packageLoaded,
    html: document.documentElement.getAttributeNames(),
    token: getComputedStyle(document.documentElement)
      .getPropertyValue("--openui-text-neutral-primary")
      .trim(),
  }));
  expect(result.loaded).toBe(true);
  expect(errors).toEqual([]);
  expect(result.html).toEqual(["lang"]);
  expect(result.token).not.toBe("");
});
