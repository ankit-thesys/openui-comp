import { expect, test } from "@playwright/test";
import type { streamingFixture } from "./fixtures/streaming";

type FixtureWindow = Window & { streamingFixture?: typeof streamingFixture };

for (const layer of [undefined, "openui"]) {
  for (const adoptEarly of [false, true]) {
    test(`streaming ${layer ?? "unlayered"}, adoption ${adoptEarly ? "before" : "after"} the late flush`, async ({
      page,
      request,
    }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      await page.goto(`/streaming.html?layer=${layer ?? ""}&adoptEarly=${adoptEarly}`, {
        waitUntil: "commit",
      });
      await expect(page.getByTestId("fallback")).toBeVisible();
      await expect(page.getByTestId("late")).toHaveCount(0);
      if (adoptEarly)
        await page.waitForFunction(() => !!(window as FixtureWindow).streamingFixture);
      const response = await page.locator("#root").getAttribute("data-response");
      expect((await request.get(`/streaming-release?response=${response}`)).ok()).toBe(true);
      if (adoptEarly) {
        // The parser has seen the opening tag, but its payload is still held on the server.
        await expect(page.locator("style#openui-styles")).toHaveCount(2);
        // Register overlapping client rules before the streamed payload completes.
        await page.evaluate(() => (window as FixtureWindow).streamingFixture!.registerLate());
        await page.evaluate(
          () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())),
        );
        await expect(page.locator("style#openui-styles")).toHaveCount(2);
        expect((await request.get(`/streaming-complete?response=${response}`)).ok()).toBe(true);
      }
      await expect(page.locator("#root")).toHaveAttribute("data-hydrated", "true");
      await expect(page.getByTestId("fallback")).toHaveCount(0);
      await expect(page.getByTestId("late")).toBeVisible();
      await expect(page.getByTestId("late")).toHaveCSS("padding", "19px");
      await expect(page.getByTestId("late")).toHaveCSS("border-top-width", "7px");
      await expect(page.getByTestId("late")).toHaveCSS("background-color", "rgb(4, 5, 6)");
      await expect(page.getByTestId("late").locator(".openui-tag")).toHaveCSS("display", "flex");
      await expect(page.locator("style#openui-styles")).toHaveCount(1);
      const result = await page.evaluate(() => {
        const tag = document.querySelector<HTMLStyleElement>("style#openui-styles")!;
        const rules: string[] = [];
        function collect(list: CSSRuleList, context = "") {
          for (const rule of list) {
            // Chromium's CSSStyleRule has cssRules too (CSS nesting); a style rule is a leaf here.
            if ("cssRules" in rule && !(rule instanceof CSSStyleRule))
              collect((rule as CSSGroupingRule).cssRules, context + rule.cssText.split("{")[0]);
            else rules.push(context + rule.cssText);
          }
        }
        collect(tag.sheet!.cssRules);
        return {
          rules,
          text: tag.textContent,
          stored: (window as FixtureWindow).streamingFixture!.getComponentStyles(),
          beforeConsumer: !!(
            tag.compareDocumentPosition(document.getElementById("consumer")!) &
            Node.DOCUMENT_POSITION_FOLLOWING
          ),
        };
      });
      expect(result.rules.length).toBeGreaterThan(0);
      expect(new Set(result.rules).size).toBe(result.rules.length);
      expect(result.text).toBe(result.stored);
      expect(result.beforeConsumer).toBe(true);
      expect(result.text!.split("@layer ").length - 1).toBe(layer ? 1 : 0);
      expect(errors).toEqual([]);
    });
  }
}
