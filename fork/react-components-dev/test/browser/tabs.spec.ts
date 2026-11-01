// The Tabs family's styling contract in Chromium: every stable class and the active state override
// the library from either load position, consumer className lands on the tablist, and nothing
// depends on a class on <html>.
import { expect, test, type Locator, type Page } from "@playwright/test";

const OVERRIDE = {
  color: "rgb(1, 2, 3)",
  "background-color": "rgb(4, 5, 6)",
  padding: "7px 8px 9px 10px",
  "border-color": "rgb(11, 12, 13)",
  "border-radius": "3px",
};
const declarations = (values: Record<string, string>) =>
  Object.entries(values)
    .map(([property, value]) => `${property}: ${value};`)
    .join(" ");

// Each stable class and how the fixture's element carrying it is found.
const TARGETS: [className: string, find: (page: Page) => Locator][] = [
  ["openui-tabs", (page) => page.getByTestId("tabs")],
  ["openui-tabs--variant-clear", (page) => page.getByTestId("tabs")],
  ["openui-tabs-list", (page) => page.getByTestId("list")],
  ["openui-tabs-list--variant-icon-title-subtext", (page) => page.getByTestId("list")],
  ["openui-tabs-list--variant-title", (page) => page.getByTestId("overflow")],
  ["openui-tabs-list-container", (page) => page.getByTestId("list").locator("..")],
  ["openui-tabs-trigger", (page) => page.getByTestId("inactive")],
  [
    "openui-tabs-trigger-icon",
    (page) => page.getByTestId("active").locator(".openui-tabs-trigger-icon"),
  ],
  [
    "openui-tabs-trigger-image",
    (page) => page.getByTestId("inactive").locator(".openui-tabs-trigger-image"),
  ],
  ["openui-tabs-trigger-img", (page) => page.getByTestId("inactive").locator("img")],
  [
    "openui-tabs-trigger-content",
    (page) => page.getByTestId("active").locator(".openui-tabs-trigger-content"),
  ],
  [
    "openui-tabs-trigger-text",
    (page) => page.getByTestId("active").locator(".openui-tabs-trigger-text"),
  ],
  [
    "openui-tabs-trigger-subtext",
    (page) => page.getByTestId("active").locator(".openui-tabs-trigger-subtext"),
  ],
  ["openui-tabs-content", (page) => page.getByTestId("content")],
  [
    "openui-tabs-content-inner",
    (page) => page.getByTestId("content").locator(".openui-tabs-content-inner"),
  ],
  [
    "openui-tabs-scroll-button-container-right",
    (page) => page.locator(".openui-tabs-scroll-button-container-right"),
  ],
  ["openui-tabs-scroll-button", (page) => page.getByRole("button", { name: "Scroll tabs right" })],
  ["openui-tabs-scroll-right", (page) => page.getByRole("button", { name: "Scroll tabs right" })],
];

const read = (locator: Locator, properties: string[]) =>
  locator.evaluate((el, names) => {
    // Scroll buttons transition every property; read end values, not a frame mid-transition.
    el.getAnimations().forEach((animation) => animation.finish());
    const style = getComputedStyle(el);
    return Object.fromEntries(names.map((name) => [name, style.getPropertyValue(name)]));
  }, properties);

const PROPERTIES = ["color", "background-color", "padding", "border-color", "border-radius"];
const withCss = (text: string) => `/tabs.html?css=${encodeURIComponent(text)}`;

for (const [className, find] of TARGETS) {
  test(`.${className} overrides the library when loaded before it`, async ({ page }) => {
    await page.goto(withCss(`.${className} { ${declarations(OVERRIDE)} }`));
    await expect(find(page)).toHaveClass(new RegExp(`(^|\\s)${className}(\\s|$)`));
    expect(await read(find(page), PROPERTIES)).toEqual(OVERRIDE);
  });

  test(`.${className} overrides the library when loaded after it`, async ({ page }) => {
    await page.goto("/tabs.html");
    await expect(find(page)).toHaveClass(new RegExp(`(^|\\s)${className}(\\s|$)`));
    await page.addStyleTag({ content: `.${className} { ${declarations(OVERRIDE)} }` });
    expect(await read(find(page), PROPERTIES)).toEqual(OVERRIDE);
  });
}

test("[data-state=active] on the trigger class restyles only the active trigger", async ({
  page,
}) => {
  const active = { color: "rgb(1, 2, 3)", "background-color": "rgb(4, 5, 6)" };
  await page.goto("/tabs.html");
  const before = await read(page.getByTestId("inactive"), Object.keys(active));
  await page.addStyleTag({
    content: `.openui-tabs-trigger[data-state="active"] { ${declarations(active)} }`,
  });
  expect(await read(page.getByTestId("active"), Object.keys(active))).toEqual(active);
  expect(await read(page.getByTestId("inactive"), Object.keys(active))).toEqual(before);
});

test("an icon's svg inside the icon part is sized by any consumer rule", async ({ page }) => {
  await page.goto(withCss(".openui-tabs-trigger-icon svg { width: 20px; height: 20px; }"));
  const svg = page.getByTestId("active").locator(".openui-tabs-trigger-icon svg");
  expect(await read(svg, ["width", "height"])).toEqual({ width: "20px", height: "20px" });
});

test("the indicator's colour and height are overridable; its position stays inline", async ({
  page,
}) => {
  await page.goto(
    withCss(".openui-tabs-indicator { background-color: rgb(4, 5, 6); height: 5px; }"),
  );
  const indicator = page
    .getByTestId("list")
    .locator("xpath=../*[contains(@class, 'openui-tabs-indicator')]");
  await expect(indicator).toHaveCSS("opacity", "1");
  expect(await read(indicator, ["background-color", "height"])).toEqual({
    "background-color": "rgb(4, 5, 6)",
    height: "5px",
  });
  expect(await indicator.evaluate((el) => (el as HTMLElement).style.width)).toMatch(/px$/);
});

test("consumer className and stable classes land on the tablist", async ({ page }) => {
  await page.goto("/tabs.html");
  const list = page.getByTestId("list");
  await expect(list).toHaveAttribute("role", "tablist");
  await expect(list).toHaveClass(/(^|\s)app-list(\s|$)/);
  await expect(list).toHaveClass(/(^|\s)openui-tabs-list(\s|$)/);
});

test("Tabs stays styled when <html class> is rewritten", async ({ page }) => {
  await page.goto("/tabs.html");
  const trigger = page.getByTestId("active");
  const before = await read(trigger, PROPERTIES.concat("font-weight"));
  await page.evaluate(() => {
    document.documentElement.className = "dark";
  });
  expect(await read(trigger, PROPERTIES.concat("font-weight"))).toEqual(before);
});
