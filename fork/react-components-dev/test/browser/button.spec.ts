// Button's styling contract in Chromium: single stable classes override the library from either
// load position, styles survive <html class> rewrites, and the library sheet sits first in <head>.
import { expect, test, type Page } from "@playwright/test";

type FixtureWindow = Window & { mountFixture: () => void };

const OVERRIDE = {
  color: "rgb(1, 2, 3)",
  "background-color": "rgb(4, 5, 6)",
  padding: "7px 8px 9px 10px",
  "border-color": "rgb(11, 12, 13)",
};
const declarations = Object.entries(OVERRIDE)
  .map(([property, value]) => `${property}: ${value};`)
  .join(" ");

// Each stable class and the element in the fixture that carries it.
const TARGETS = [
  ["openui-button", "default"],
  ["openui-button--variant-primary", "default"],
  ["openui-button--size-medium", "default"],
  ["openui-button--tone-default", "default"],
  ["openui-button--variant-secondary", "custom"],
  ["openui-button--size-small", "custom"],
  ["openui-button--tone-destructive", "custom"],
  ["openui-button-icon", "custom icon"],
] as const;

const element = (page: Page, target: string) => {
  const [testId, part] = target.split(" ");
  const button = page.getByTestId(testId!);
  return part ? button.locator(".openui-button-icon") : button;
};

const computed = (page: Page, target: string) =>
  element(page, target).evaluate((el) => {
    // Button transitions every property; read end values, not a frame mid-transition.
    el.getAnimations().forEach((animation) => animation.finish());
    const style = getComputedStyle(el);
    return {
      color: style.color,
      "background-color": style.backgroundColor,
      padding: style.padding,
      "border-color": style.borderColor,
    };
  });

for (const [className, target] of TARGETS) {
  test(`.${className} overrides the library when loaded before it`, async ({ page }) => {
    await page.goto(`/button.html?css=${encodeURIComponent(`.${className} { ${declarations} }`)}`);
    await expect(element(page, target)).toHaveClass(new RegExp(`\\b${className}\\b`));
    expect(await computed(page, target)).toEqual(OVERRIDE);
  });

  test(`.${className} overrides the library when loaded after it`, async ({ page }) => {
    await page.goto("/button.html");
    await expect(element(page, target)).toHaveClass(new RegExp(`\\b${className}\\b`));
    await page.addStyleTag({ content: `.${className} { ${declarations} }` });
    expect(await computed(page, target)).toEqual(OVERRIDE);
  });
}

test("Button stays styled when <html class> is rewritten", async ({ page }) => {
  await page.goto("/button.html");
  const before = await computed(page, "default");
  const plain = await computed(page, "plain");
  expect(before["background-color"]).not.toBe(plain["background-color"]);

  await page.evaluate(() => {
    document.documentElement.className = "dark";
  });
  expect(await computed(page, "default")).toEqual(before);
});

test("the token layer is declared first and the library sheet precedes app CSS", async ({
  page,
}) => {
  await page.goto(`/button.html?css=${encodeURIComponent(".app { color: red; }")}`);
  await expect(page.getByTestId("default")).toBeVisible();
  const head = await page.evaluate(() =>
    [...document.head.querySelectorAll("style")].map(
      (style) =>
        style.id || (style.hasAttribute("data-openui-layer-order") ? "layer-order" : "other"),
    ),
  );
  expect(head.slice(0, 2)).toEqual(["layer-order", "_goober"]);
  expect(head.indexOf("consumer")).toBeGreaterThan(head.indexOf("_goober"));
  const firstRule = await page.evaluate(() => document.styleSheets[0]!.cssRules[0]!.cssText);
  expect(firstRule).toBe("@layer openui-defaults;");
});

test("Button registers its styles when it renders, not on import, and marks no <html> class", async ({
  page,
}) => {
  await page.goto("/button.html?lazy=1");
  await page.waitForFunction(() => typeof (window as FixtureWindow).mountFixture === "function");
  const beforeMount = await page.evaluate(() => ({
    sheet: document.getElementById("_goober")?.textContent ?? "",
    html: [...document.documentElement.classList],
  }));

  await page.evaluate(() => (window as FixtureWindow).mountFixture());
  await expect(page.getByTestId("custom")).toBeVisible();
  const generated = await page.evaluate(() =>
    [
      ...document.querySelectorAll(
        '[data-testid="default"], [data-testid="custom"], .openui-button-icon',
      ),
    ].flatMap((el) => [...el.classList].filter((name) => /^go\d+$/.test(name))),
  );
  const html = await page.evaluate(() => [...document.documentElement.classList]);

  expect(generated.length).toBeGreaterThan(0);
  for (const name of generated)
    expect(beforeMount.sheet).not.toMatch(new RegExp(`\\.${name}(?![0-9])`));
  expect(html).toEqual(beforeMount.html);
  for (const name of generated) expect(html).not.toContain(name);
});
