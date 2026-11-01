// The app-wide sheet wrapper controls the cascade for every component and public style.
import { expect, test, type Page } from "@playwright/test";
import type { layersFixture } from "./fixtures/layers";

type FixtureWindow = Window & { layersFixture?: typeof layersFixture };

test("an empty reserved sheet does not cause a late-configuration warning", async ({ page }) => {
  const warnings: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "warning" && message.text().includes("[OpenUI]"))
      warnings.push(message.text());
  });
  await page.route("**/layers-reserved.html?*", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><html><head><style id="openui-styles">\n </style></head>
        <body><div id="root"></div><script type="module" src="/layers-development.js"></script></body></html>`,
    }),
  );
  await page.goto("/layers-reserved.html?layer=openui");
  await expect(page.getByTestId("default")).toBeVisible();
  expect(warnings).toEqual([]);
  // Playwright's text assertions skip <style> content, so read textContent.
  await expect
    .poll(() => page.locator("style#openui-styles").textContent())
    .toContain("@layer openui{");
});

// A hand-written server sheet may start on its own line. The browser still reads its layer, so the
// same layer configured in the app entry is no change and appended rules join that layer.
test("an indented layered server sheet keeps its layer without a warning", async ({ page }) => {
  const warnings: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "warning" && message.text().includes("[OpenUI]"))
      warnings.push(message.text());
  });
  await page.route("**/layers-indented.html?*", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><html><head><style data-openui-styles>
        @layer openui{.server-only{color:rgb(1, 2, 3)}}
      </style></head>
        <body><div id="root"></div><script type="module" src="/layers-development.js"></script></body></html>`,
    }),
  );
  await page.goto("/layers-indented.html?layer=openui");
  await expect(page.getByTestId("default")).toBeVisible();
  expect(warnings).toEqual([]);
  // Playwright's text assertions skip <style> content, so read textContent.
  await expect
    .poll(() => page.locator("style#openui-styles").textContent())
    .toContain("@layer openui{");
});

for (const environment of ["development", "production"]) {
  test(`late configuration warns only in development: ${environment}`, async ({ page }) => {
    const warnings: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "warning" && message.text().includes("[OpenUI]"))
        warnings.push(message.text());
    });
    const fixture = environment === "development" ? "layers-development" : "layers";
    await page.goto(`/${fixture}.html?layer=openui`);
    await expect(page.getByTestId("default")).toBeVisible();
    const sheet = page.locator("style#openui-styles");
    const before = await sheet.textContent();

    await page.evaluate(() => {
      (window as FixtureWindow).layersFixture!.configureStyles({ layer: "openui" });
    });
    expect(warnings).toEqual([]);
    await page.evaluate(() => {
      (window as FixtureWindow).layersFixture!.configureStyles({ layer: "later" });
    });
    expect(warnings).toEqual(
      environment === "development"
        ? [expect.stringContaining("configureStyles was called after component rules were written")]
        : [],
    );
    expect(await sheet.textContent()).toBe(before);
    const name = await page.evaluate(
      () => (window as FixtureWindow).layersFixture!.css`color: rgb(71, 83, 97);`,
    );
    await expect
      .poll(() => sheet.textContent())
      .toBe(`${before}@layer later{.${name}{color:rgb(71, 83, 97);}}`);
  });
}

const OVERRIDE = {
  color: "rgb(1, 2, 3)",
  "background-color": "rgb(4, 5, 6)",
  padding: "7px 8px 9px 10px",
  "border-color": "rgb(11, 12, 13)",
};
// A type selector weighs less than any library rule, so only the cascade layer can let it win.
const consumerCss = `button { ${Object.entries(OVERRIDE)
  .map(([property, value]) => `${property}: ${value};`)
  .join(" ")} }`;

const computed = (page: Page, testId: string) =>
  page.getByTestId(testId).evaluate((el) => {
    // Button transitions every property; read end values, not a frame mid-transition.
    el.getAnimations().forEach((animation) => animation.finish());
    const style = getComputedStyle(el);
    return {
      color: style.color,
      "background-color": style.backgroundColor,
      padding: style.padding,
      "border-color": style.borderColor,
      "border-radius": style.borderRadius,
    };
  });

// The cascade layers holding the rules of an element's generated classes; "" means unlayered.
const layersOf = (page: Page, testId: string) =>
  page.getByTestId(testId).evaluate((el) => {
    const generated = [...el.classList].filter((name) => /^go\d+$/.test(name));
    const found = new Set<string>();
    const visit = (rules: CSSRuleList, layer: string) => {
      for (const rule of rules) {
        // Style rules first: with CSS nesting they are grouping rules too.
        if (rule instanceof CSSStyleRule) {
          if (generated.some((name) => new RegExp(`\\.${name}(?![\\w-])`).test(rule.selectorText)))
            found.add(layer);
        } else if (rule instanceof CSSLayerBlockRule)
          visit(rule.cssRules, layer ? `${layer}.${rule.name}` : rule.name);
        else if (rule instanceof CSSGroupingRule) visit(rule.cssRules, layer);
      }
    };
    visit((document.getElementById("openui-styles") as HTMLStyleElement).sheet!.cssRules, "");
    return [...found].sort();
  });

test("one sheet wrapper includes import-time styles and every provider subtree", async ({
  page,
}) => {
  await page.goto("/layers.html?layer=openui");
  for (const id of ["default", "outside", "inherited", "nested", "imported"])
    expect(await layersOf(page, id)).toEqual(["openui"]);
  const result = await page.evaluate(() => {
    const tag = document.getElementById("openui-styles") as HTMLStyleElement;
    const rules = tag.sheet!.cssRules;
    return {
      count: rules.length,
      layer: rules[0] instanceof CSSLayerBlockRule ? rules[0].name : null,
      wrapperCount: tag.textContent!.match(/@layer /g)?.length,
      dataLayer: tag.hasAttribute("data-layer"),
      classes: ["default", "outside", "inherited", "nested"].map(
        (id) => document.querySelector(`[data-testid="${id}"]`)!.className,
      ),
    };
  });
  expect(result.count).toBe(1);
  expect(result.layer).toBe("openui");
  expect(result.wrapperCount).toBe(1);
  expect(result.dataLayer).toBe(false);
  expect(new Set(result.classes).size).toBe(1);
});

test("without configuration the whole sheet stays unlayered", async ({ page }) => {
  await page.goto("/layers.html");
  for (const id of ["default", "outside", "inherited", "nested", "imported"])
    expect(await layersOf(page, id)).toEqual([""]);
});

test("layer mode renders Button exactly as default mode does", async ({ page }) => {
  const snapshot = async () => {
    // The pointer keeps its position across navigations; start each page away from the Buttons.
    await page.mouse.move(0, 0);
    const resting = await Promise.all([
      computed(page, "default"),
      computed(page, "icon"),
      computed(page, "disabled"),
      page
        .getByTestId("icon")
        .locator("svg")
        .evaluate((svg) => svg.getBoundingClientRect().width),
    ]);
    await page.getByTestId("default").hover();
    const hovered = await computed(page, "default");
    await page.mouse.down();
    const pressed = await computed(page, "default");
    await page.mouse.up();
    return { resting, hovered, pressed };
  };
  await page.goto("/layers.html");
  const unlayered = await snapshot();
  await page.goto("/layers.html?layer=openui");
  expect(await snapshot()).toEqual(unlayered);
});

for (const position of ["before", "after"] as const) {
  test(`unlayered consumer CSS loaded ${position} the library beats layered Button rules, hovered too`, async ({
    page,
  }) => {
    const css = position === "before" ? `&css=${encodeURIComponent(consumerCss)}` : "";
    await page.goto(`/layers.html?layer=openui${css}`);
    await expect(page.getByTestId("default")).toBeVisible();
    if (position === "after") await page.addStyleTag({ content: consumerCss });
    expect(await computed(page, "default")).toMatchObject(OVERRIDE);
    await page.getByTestId("default").hover();
    expect(await computed(page, "default")).toMatchObject(OVERRIDE);
  });
}

test("without a configured layer the same consumer CSS loses to Button's heavier rules", async ({
  page,
}) => {
  await page.goto(`/layers.html?css=${encodeURIComponent(consumerCss)}`);
  expect((await computed(page, "default"))["background-color"]).not.toBe(
    OVERRIDE["background-color"],
  );
});

// `fixtures/tailwind4.css` is unmodified Tailwind 4.1.11 output for `bg-red-500` and `!bg-red-500`.
const RED_500 = "oklch(0.637 0.237 25.331)";
const ORDER = "theme, base, openui, components, utilities";
const tailwind = (query: string) => `/layers.html?sheet=tailwind4&${query}`;

test("with the two-tag recipe, Tailwind 4 utilities beat Button and its base layer does not wipe it", async ({
  page,
}) => {
  await page.goto("/layers.html?layer=openui");
  const styled = await computed(page, "default");

  await page.goto(tailwind(`layer=openui&recipe=${encodeURIComponent(ORDER)}`));
  expect((await computed(page, "utility"))["background-color"]).toBe(RED_500);
  expect(await computed(page, "default")).toEqual(styled);
});

// Documented negative case: the same layer statement in the app's CSS comes after the library
// sheet, so `openui` is declared first, ranks below Tailwind's `base`, and Button loses its styles.
test("the layer statement only in the app's CSS lets Tailwind's base wipe Button", async ({
  page,
}) => {
  await page.goto(tailwind(`layer=openui&css=${encodeURIComponent(`@layer ${ORDER};`)}`));
  expect(await computed(page, "default")).toMatchObject({
    "background-color": "rgba(0, 0, 0, 0)",
    padding: "0px",
    "border-radius": "0px",
  });
});

test("without a configured layer, Tailwind 4 utilities need `!` to beat Button", async ({
  page,
}) => {
  await page.goto("/layers.html");
  const styled = await computed(page, "default");

  await page.goto(tailwind(""));
  expect(await computed(page, "default")).toEqual(styled);
  expect((await computed(page, "utility"))["background-color"]).toBe(styled["background-color"]);
  expect((await computed(page, "important-utility"))["background-color"]).toBe(RED_500);
});
