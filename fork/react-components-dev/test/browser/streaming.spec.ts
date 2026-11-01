import { expect, test } from "@playwright/test";
import type { streamingFixture } from "./fixtures/streaming";

type FixtureWindow = Window & { streamingFixture?: typeof streamingFixture };

// The server sends the whole component sheet once, in the shell's <head>. Suspense content that
// streams in later is styled on arrival, and the browser never touches the server's tag.
for (const layer of [undefined, "openui"]) {
  test(`streaming ${layer ?? "unlayered"}: one server sheet styles late content`, async ({
    page,
    request,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.goto(`/streaming.html?layer=${layer ?? ""}`, { waitUntil: "commit" });
    await expect(page.getByTestId("fallback")).toBeVisible();
    const serverText = () =>
      page.evaluate(() => document.querySelector("style[data-openui-styles]")!.textContent);
    const server = await serverText();
    const response = await page.locator("#root").getAttribute("data-response");
    expect((await request.get(`/streaming-release?response=${response}`)).ok()).toBe(true);

    const late = page.getByTestId("late");
    await expect(late).toBeVisible();
    // Styled before hydration: the rules were already in the shell.
    await expect(late).toHaveCSS("padding", "19px");
    await expect(late).toHaveCSS("border-top-width", "7px");
    await expect(late.locator(".openui-tag")).toHaveCSS("display", "flex");
    // An equal-weight consumer rule after the sheet wins without !important.
    await expect(late).toHaveCSS("background-color", "rgb(4, 5, 6)");
    await expect(page.locator("#root")).toHaveAttribute("data-hydrated", "true");

    // Hydration wrote nothing: every rule the components use was seeded from the server sheet.
    expect(await serverText()).toBe(server);
    await expect(page.locator("style#openui-styles")).toHaveCount(0);

    // A rule the server never sent goes into the browser's own sheet, in the same layer.
    const name = await page.evaluate(() =>
      (window as FixtureWindow).streamingFixture!.registerLate(),
    );
    await page.evaluate(() => new Promise<void>((resolve) => setTimeout(resolve)));
    const client = await page.locator("style#openui-styles").textContent();
    expect(client).toContain(`.${name}{`);
    expect(client!.startsWith("@layer openui{")).toBe(!!layer);
    expect(server).not.toContain(name);
    expect(await serverText()).toBe(server);
    expect(errors).toEqual([]);
  });
}
