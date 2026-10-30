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
