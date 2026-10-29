// IconButton's styling contract in Chromium: every stable class overrides the library from either
// load position, including with asChild, and needs no <html> class.
import { expect, test, type Page } from "@playwright/test";

// Height, not width: the icon part is a flex item and would shrink to fit a narrower button.
const OVERRIDE = {
  color: "rgb(1, 2, 3)",
  "background-color": "rgb(4, 5, 6)",
  height: "41px",
  "border-color": "rgb(11, 12, 13)",
  "border-radius": "3px",
};
const declarations = Object.entries(OVERRIDE)
  .map(([property, value]) => `${property}: ${value};`)
  .join(" ");

// Each stable class and the element in the fixture that carries it.
const TARGETS = [
  ["openui-icon-button", "default"],
  ["openui-icon-button--variant-primary", "default"],
  ["openui-icon-button--size-medium", "default"],
  ["openui-icon-button--shape-square", "default"],
  ["openui-icon-button--tone-default", "default"],
  ["openui-icon-button--variant-secondary", "custom"],
  ["openui-icon-button--size-small", "custom"],
  ["openui-icon-button--shape-circle", "custom"],
  ["openui-icon-button--tone-destructive", "custom"],
  ["openui-icon-button--variant-tertiary", "tertiary"],
  ["openui-icon-button--size-3-extra-small", "as-child"],
  ["openui-icon-button--size-2-extra-small", "xxs"],
  ["openui-icon-button--size-extra-small", "xs"],
  ["openui-icon-button--size-large", "large"],
  ["openui-icon-button-icon", "default icon"],
  ["openui-icon-button-icon", "custom icon"],
] as const;

const element = (page: Page, target: string) => {
  const [testId, part] = target.split(" ");
  const root = page.getByTestId(testId!);
  return part ? root.locator(".openui-icon-button-icon") : root;
};

const computed = (page: Page, target: string) =>
  element(page, target).evaluate((el) => {
    // IconButton transitions every property; read end values, not a frame mid-transition.
    el.getAnimations().forEach((animation) => animation.finish());
    const style = getComputedStyle(el);
    return {
      color: style.color,
      "background-color": style.backgroundColor,
      height: style.height,
      "border-color": style.borderColor,
      "border-radius": style.borderRadius,
    };
  });

for (const [className, target] of TARGETS) {
  test(`.${className} on ${target} overrides the library when loaded before it`, async ({
    page,
  }) => {
    await page.goto(
      `/icon-button.html?css=${encodeURIComponent(`.${className} { ${declarations} }`)}`,
    );
    await expect(element(page, target)).toHaveClass(new RegExp(`\\b${className}\\b`));
    expect(await computed(page, target)).toEqual(OVERRIDE);
  });

  test(`.${className} on ${target} overrides the library when loaded after it`, async ({
    page,
  }) => {
    await page.goto("/icon-button.html");
    await expect(element(page, target)).toHaveClass(new RegExp(`\\b${className}\\b`));
    await page.addStyleTag({ content: `.${className} { ${declarations} }` });
    expect(await computed(page, target)).toEqual(OVERRIDE);
  });
}

test("a state on a stable class overrides the library's state rule", async ({ page }) => {
  await page.goto(
    `/icon-button.html?css=${encodeURIComponent(
      ".openui-icon-button--variant-primary:hover { background-color: rgb(7, 8, 9); }",
    )}`,
  );
  await page.getByTestId("default").hover();
  expect((await computed(page, "default"))["background-color"]).toBe("rgb(7, 8, 9)");
});

test("asChild styles the child element and keeps its own class and icon part", async ({ page }) => {
  await page.goto("/icon-button.html");
  const child = page.getByTestId("as-child");
  await expect(child).toHaveClass(/\bopenui-icon-button\b/);
  await expect(child).toHaveClass(/\bapp-as-child\b/);
  await expect(child.locator(".openui-icon-button-icon")).toHaveCount(1);
  const [styled, plain] = await Promise.all([computed(page, "as-child"), computed(page, "plain")]);
  expect(styled.height).toBe("20px");
  expect(styled["background-color"]).not.toBe(plain["background-color"]);
});

test("IconButton stays styled when <html class> is rewritten", async ({ page }) => {
  await page.goto("/icon-button.html");
  const before = await computed(page, "custom");
  await page.evaluate(() => {
    document.documentElement.className = "dark";
  });
  expect(await computed(page, "custom")).toEqual(before);
});
