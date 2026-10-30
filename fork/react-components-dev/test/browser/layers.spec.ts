// The app-wide sheet wrapper controls the cascade for every component and public style.
import { expect, test, type Page } from "@playwright/test";
import type { layersFixture } from "./fixtures/layers";

type FixtureWindow = Window & { layersFixture?: typeof layersFixture };

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

test("a later call rewrites the sheet in place, including lazy styles and keyframes", async ({
  page,
}) => {
  const warnings: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "warning") warnings.push(message.text());
  });
  await page.goto("/layers.html");
  await expect(page.getByTestId("default")).toBeVisible();
  const result = await page.evaluate(async () => {
    const fixture = (window as FixtureWindow).layersFixture!;
    const tag = document.getElementById("openui-styles") as HTMLStyleElement;
    const button = document.querySelector('[data-testid="default"]')!;
    const classes = button.className;
    const before = tag.textContent!;
    fixture.configureStyles({ layer: "openui" });
    await Promise.resolve();
    const layered = tag.textContent;
    const { lazy, animation } = await fixture.loadLater();
    await Promise.resolve();
    const withLazy = tag.textContent!;
    fixture.configureStyles({ layer: undefined });
    await Promise.resolve();
    const unlayered = tag.textContent!;
    fixture.configureStyles({ layer: "app.openui" });
    await Promise.resolve();
    return {
      before,
      layered,
      withLazy,
      unlayered,
      switched: tag.textContent,
      stored: fixture.getComponentStyles(),
      lazy,
      animation,
      sameTag: tag === document.getElementById("openui-styles"),
      sameClasses: classes === button.className,
    };
  });
  expect(result.layered).toBe(`@layer openui{${result.before}}`);
  expect(result.withLazy.match(/@layer /g)).toHaveLength(1);
  expect(result.withLazy).toContain(`.${result.lazy}{animation:${result.animation} 3s linear;`);
  expect(result.withLazy).toContain(
    `@keyframes ${result.animation}{from{opacity:0.21;}to{opacity:0.79;}}`,
  );
  expect(result.withLazy).toBe(`@layer openui{${result.unlayered}}`);
  expect(result.switched).toBe(`@layer app.openui{${result.unlayered}}`);
  expect(result.switched).toBe(result.stored);
  expect(result.sameTag).toBe(true);
  expect(result.sameClasses).toBe(true);
  expect(warnings).toEqual([]);
  expect(await layersOf(page, "outside")).toEqual(["app.openui"]);
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
