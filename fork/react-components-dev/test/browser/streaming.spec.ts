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

// The first registry tag can be split across network chunks too. An async head script that loads
// the library in between must not seed from the truncated text or rewrite it mid-parse: the rest
// of the payload would land after the store's text, losing or duplicating server rules.
for (const layer of [undefined, "openui"]) {
  test(`streaming ${layer ?? "unlayered"}, the first tag split around an async script`, async ({
    page,
    request,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    const navigation = await page.goto(`/streaming.html?layer=${layer ?? ""}&splitFirst=true`, {
      waitUntil: "commit",
    });
    const response = navigation!.headers()["x-streaming-response"]!;
    // The library has loaded while the first tag still holds half its payload. Nothing renders
    // while the parser is inside <head>, so poll by time rather than by animation frame.
    await page.waitForFunction(() => !!(window as FixtureWindow).streamingFixture, undefined, {
      polling: 50,
    });
    const partial = await page.locator("style#openui-styles").textContent();
    expect(partial).not.toContain("/*openui-stream-end*/");
    // Client rules registered now must wait for the tag, not replace its text.
    await page.evaluate(
      (response) => (window as FixtureWindow).streamingFixture!.registerLate(response),
      response,
    );
    await page.evaluate(() => new Promise<void>((resolve) => setTimeout(resolve, 50)));
    expect(await page.locator("style#openui-styles").textContent()).toBe(partial);

    expect((await request.get(`/streaming-complete?response=${response}`)).ok()).toBe(true);
    // The rest of the tag's text is the only sign it is complete (Chromium appends it to the
    // existing text node): the store takes it in and rewrites the tag while the document loads.
    await page.waitForFunction(
      () => !document.getElementById("openui-styles")!.textContent!.startsWith("/*openui-stream*/"),
      undefined,
      { polling: 50, timeout: 5000 },
    );
    expect(await page.evaluate(() => document.readyState)).toBe("loading");
    expect((await request.get(`/streaming-release?response=${response}`)).ok()).toBe(true);
    await expect(page.locator("#root")).toHaveAttribute("data-hydrated", "true");
    await expect(page.getByTestId("late")).toBeVisible();
    await expect(page.getByTestId("late")).toHaveCSS("padding", "19px");
    await expect(page.getByTestId("late")).toHaveCSS("background-color", "rgb(4, 5, 6)");
    await expect(page.getByTestId("late").locator(".openui-tag")).toHaveCSS("display", "flex");
    await expect(page.getByTestId("early")).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(page.locator("style#openui-styles")).toHaveCount(1);

    const first = await (await request.get(`/streaming-first?response=${response}`)).text();
    const result = await page.evaluate((first) => {
      const rulesOf = (sheet: CSSStyleSheet) => {
        const rules: string[] = [];
        function collect(list: CSSRuleList, context = "") {
          for (const rule of list) {
            if ("cssRules" in rule && !(rule instanceof CSSStyleRule))
              collect((rule as CSSGroupingRule).cssRules, context + rule.cssText.split("{")[0]);
            else rules.push(context + rule.cssText);
          }
        }
        collect(sheet.cssRules);
        return rules;
      };
      const tag = document.querySelector<HTMLStyleElement>("style#openui-styles")!;
      const server = new CSSStyleSheet();
      server.replaceSync(first);
      return {
        rules: rulesOf(tag.sheet!),
        server: rulesOf(server),
        text: tag.textContent,
        stored: (window as FixtureWindow).streamingFixture!.getComponentStyles(),
      };
    }, first);
    expect(result.server.length).toBeGreaterThan(0);
    expect(result.server.filter((rule) => !result.rules.includes(rule))).toEqual([]);
    expect(new Set(result.rules).size).toBe(result.rules.length);
    expect(result.text).toBe(result.stored);
    expect(result.text!.split("@layer ").length - 1).toBe(layer ? 1 : 0);
    expect(errors).toEqual([]);
  });
}

for (const layer of [undefined, "openui"]) {
  test(`streaming ${layer ?? "unlayered"}, into a reserved empty sheet while the document loads`, async ({
    page,
    request,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const navigation = await page.goto(
      `/streaming.html?layer=${layer ?? ""}&adoptEarly=true&reserve=true`,
      { waitUntil: "commit" },
    );
    const response = navigation!.headers()["x-streaming-response"]!;
    await page.waitForFunction(() => !!(window as FixtureWindow).streamingFixture);
    // The Suspense boundary holds the stream open, so the document is still loading. The reserved
    // tag is complete (the parser is past it), so the first registry tag and client rules join it
    // now rather than when loading ends.
    await page.evaluate(() => (window as FixtureWindow).streamingFixture!.registerLate());
    await page.evaluate(() => new Promise<void>((resolve) => setTimeout(resolve, 50)));
    const loading = await page.evaluate(() => ({
      readyState: document.readyState,
      tags: document.querySelectorAll("style#openui-styles").length,
      text: document.getElementById("openui-styles")!.textContent!,
      stored: (window as FixtureWindow).streamingFixture!.getComponentStyles(),
    }));
    expect(loading.readyState).toBe("loading");
    expect(loading.tags).toBe(1);
    expect(loading.text.trim().length).toBeGreaterThan(0);
    expect(loading.text).toBe(loading.stored);

    expect((await request.get(`/streaming-release?response=${response}`)).ok()).toBe(true);
    expect((await request.get(`/streaming-complete?response=${response}`)).ok()).toBe(true);
    await expect(page.locator("#root")).toHaveAttribute("data-hydrated", "true");
    await expect(page.getByTestId("late")).toHaveCSS("padding", "19px");
    await expect(page.locator("style#openui-styles")).toHaveCount(1);
    expect(errors).toEqual([]);
  });
}

// An empty first tag that is the last thing parsed may still receive its text, so client rules
// wait. Ordinary markup parsed after it settles it: the rules must join it then, while the
// document is still loading, not when loading ends or the next registry tag arrives.
for (const layer of [undefined, "openui"]) {
  test(`streaming ${layer ?? "unlayered"}, an empty first tag settles when markup follows it`, async ({
    page,
    request,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const navigation = await page.goto(`/streaming.html?layer=${layer ?? ""}&reserveLast=true`, {
      waitUntil: "commit",
    });
    const response = navigation!.headers()["x-streaming-response"]!;
    await page.waitForFunction(() => !!(window as FixtureWindow).streamingFixture, undefined, {
      polling: 50,
    });
    await page.evaluate(
      (response) => (window as FixtureWindow).streamingFixture!.registerLate(response),
      response,
    );
    await page.evaluate(() => new Promise<void>((resolve) => setTimeout(resolve, 50)));
    expect(await page.locator("style#openui-styles").textContent()).toBe("");

    expect((await request.get(`/streaming-complete?response=${response}`)).ok()).toBe(true);
    await page.waitForFunction(
      () => !!document.querySelector('meta[name="openui-streaming-settle"]'),
      undefined,
      {
        polling: 50,
      },
    );
    await page.waitForFunction(
      () => !!document.getElementById("openui-styles")!.textContent,
      undefined,
      { polling: 50, timeout: 5000 },
    );
    const settled = await page.evaluate(() => ({
      readyState: document.readyState,
      tags: document.querySelectorAll("style#openui-styles").length,
      text: document.getElementById("openui-styles")!.textContent!,
      stored: (window as FixtureWindow).streamingFixture!.getComponentStyles(),
    }));
    expect(settled.readyState).toBe("loading");
    expect(settled.tags).toBe(1);
    expect(settled.text).toBe(settled.stored);
    expect(settled.text.split("@layer ").length - 1).toBe(layer ? 1 : 0);

    expect((await request.get(`/streaming-complete?response=${response}`)).ok()).toBe(true);
    expect((await request.get(`/streaming-release?response=${response}`)).ok()).toBe(true);
    await expect(page.locator("#root")).toHaveAttribute("data-hydrated", "true");
    await expect(page.getByTestId("late")).toHaveCSS("padding", "19px");
    await expect(page.getByTestId("late")).toHaveCSS("background-color", "rgb(4, 5, 6)");
    await expect(page.locator("style#openui-styles")).toHaveCount(1);
    expect(errors).toEqual([]);
  });
}

// Counts the callbacks of every MutationObserver that watches the whole document, as the store's
// does, from before the library loads.
function countDocumentObservers() {
  const watch = { created: 0, disconnected: 0, callbacks: 0 };
  (window as Window & { documentObservers?: typeof watch }).documentObservers = watch;
  const watching = new WeakSet<MutationObserver>();
  const Native = window.MutationObserver;
  window.MutationObserver = class extends Native {
    constructor(callback: MutationCallback) {
      super((records, observer) => {
        if (watching.has(observer)) watch.callbacks++;
        callback(records, observer);
      });
    }
    override observe(target: Node, options?: MutationObserverInit) {
      // Text changes anywhere in the document: Playwright's own observers watch less.
      if (target === document.documentElement && options?.subtree && options.characterData)
        if (!watching.has(this)) watching.add(this) && watch.created++;
      super.observe(target, options);
    }
    override disconnect() {
      if (watching.has(this)) watch.disconnected++;
      super.disconnect();
    }
  };
}
type ObserverWindow = FixtureWindow & {
  documentObservers?: { created: number; disconnected: number; callbacks: number };
};

// A chat UI changes the DOM for every streamed token. The store watches for streamed tags only
// while the parser can still add one; after that, DOM changes must not reach its callback.
for (const layer of [undefined, "openui"]) {
  test(`streaming ${layer ?? "unlayered"}, the store stops watching the document once it has loaded`, async ({
    page,
    request,
  }) => {
    await page.addInitScript(countDocumentObservers);
    await page.goto(`/streaming.html?layer=${layer ?? ""}&adoptEarly=true`, {
      waitUntil: "commit",
    });
    await page.waitForFunction(() => !!(window as FixtureWindow).streamingFixture);
    const response = await page.locator("#root").getAttribute("data-response");
    expect(await page.evaluate(() => (window as ObserverWindow).documentObservers!.created)).toBe(
      1,
    );
    expect((await request.get(`/streaming-release?response=${response}`)).ok()).toBe(true);
    expect((await request.get(`/streaming-complete?response=${response}`)).ok()).toBe(true);
    await expect(page.locator("#root")).toHaveAttribute("data-hydrated", "true");
    await page.waitForFunction(() => document.readyState === "complete");
    await expect(page.getByTestId("late")).toHaveCSS("padding", "19px");
    await expect(page.locator("style#openui-styles")).toHaveCount(1);

    const after = await page.evaluate(async () => {
      const watch = (window as ObserverWindow).documentObservers!;
      const before = watch.callbacks;
      const message = document.body.appendChild(document.createElement("p"));
      const text = message.appendChild(document.createTextNode(""));
      for (let token = 0; token < 2000; token++) {
        if (token % 2) text.data += " token";
        else message.appendChild(document.createElement("span")).textContent = String(token);
        // Each token lands in its own microtask checkpoint, as separate stream chunks would.
        await Promise.resolve();
      }
      const tag = document.getElementById("openui-styles")!;
      return {
        callbacks: watch.callbacks - before,
        disconnected: watch.disconnected,
        current:
          tag.textContent === (window as FixtureWindow).streamingFixture!.getComponentStyles(),
      };
    });
    expect(after).toEqual({ callbacks: 0, disconnected: 1, current: true });
  });

  test(`streaming ${layer ?? "unlayered"}, a library loaded after parsing never watches the document`, async ({
    page,
    request,
  }) => {
    await page.addInitScript(countDocumentObservers);
    await page.goto(`/streaming.html?layer=${layer ?? ""}`, { waitUntil: "commit" });
    const response = await page.locator("#root").getAttribute("data-response");
    expect((await request.get(`/streaming-release?response=${response}`)).ok()).toBe(true);
    await expect(page.locator("#root")).toHaveAttribute("data-hydrated", "true");
    await expect(page.getByTestId("late")).toHaveCSS("padding", "19px");
    await expect(page.locator("style#openui-styles")).toHaveCount(1);
    expect(await page.evaluate(() => (window as ObserverWindow).documentObservers!.created)).toBe(
      0,
    );
  });
}
