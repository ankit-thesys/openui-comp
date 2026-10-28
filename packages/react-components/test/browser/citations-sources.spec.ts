// #95 public Chromium seam. Run after build with: pnpm exec playwright test citations-sources.
// Covers every owned stable class, including measured carousel controls and portalled content.
import { expect, test, type Page } from "@playwright/test";

const classes = [
  "openui-inline-markdown-renderer",
  "openui-inline-markdown-renderer-content",
  "openui-citation",
  "openui-citation-container",
  "openui-citation-icon",
  "openui-citation-tooltip",
  "openui-citation-tooltip-content",
  "openui-citation-item",
  "openui-citation-item-logo",
  "openui-citation-item-content",
  "openui-citation-item-title",
  "openui-citation-item-source",
  "openui-sources",
  "openui-sources-header",
  "openui-sources-title",
  "openui-sources-buttons",
  "openui-sources-item-container",
  "openui-sources-item",
  "openui-sources-item-header",
  "openui-sources-item-logo",
  "openui-sources-item-name",
  "openui-sources-item-title",
  "openui-source-favicon-image",
];
const override =
  "color: rgb(1, 2, 3); background-color: rgb(4, 5, 6); padding: 7px; border: 3px solid rgb(11, 12, 13); border-radius: 2px;";

async function open(page: Page, params = new URLSearchParams()) {
  await page.goto(`/citations-sources.html?${params}`);
  await expect(page.getByTestId("sources").locator(".openui-sources-buttons")).toBeVisible();
  await expect(page.getByTestId("citation").locator("svg")).toBeVisible();
}
async function showTooltip(page: Page) {
  await page.getByTestId("citation").getByRole("button", { name: "Citations" }).click();
  await expect(page.locator(".openui-citation-tooltip")).toBeVisible();
}

for (const layer of [undefined, "openui"]) {
  for (const position of ["before", "after"]) {
    for (const name of classes) {
      test(`.${name} overrides from ${position}, ${layer ?? "default"} mode`, async ({ page }) => {
        // A 20px trigger cannot fit 14px of padding plus 6px of border and its icon.
        // Exercise a usable consumer override, including explicit dimensions for that button.
        const dimensions = name === "openui-citation" ? "width: 40px; height: 40px;" : "";
        const css = `.${name} { ${override} ${dimensions} }`;
        const params = new URLSearchParams();
        if (layer) params.set("layer", layer);
        if (position === "before") params.set("css", css);
        await open(page, params);
        // Mount the portal even when the consumer stylesheet was present before first render.
        if (name.includes("tooltip")) await showTooltip(page);
        if (position === "after") await page.addStyleTag({ content: css });
        const target = page.locator(`.${name}`).first();
        await expect(target).toBeVisible();
        await expect(target).toHaveCSS("color", "rgb(1, 2, 3)");
        if (name !== "openui-sources-item-container")
          await expect(target).toHaveCSS("background-color", "rgb(4, 5, 6)");
        // The source container's background and width are ADR Q12 exceptions. All other
        // properties remain ordinary overrides; the exception is pinned separately below.
        await expect(target).toHaveCSS("padding", "7px");
        await expect(target).toHaveCSS("border-top-color", "rgb(11, 12, 13)");
        await expect(target).toHaveCSS("border-top-width", "3px");
        await expect(target).toHaveCSS("border-radius", "2px");
        if (name === "openui-citation") {
          await expect(target).toHaveCSS("width", "40px");
          await expect(target).toHaveCSS("height", "40px");
          await expect(target.locator("svg")).toBeVisible();
        }
      });
    }
  }
}

for (const position of ["before", "after"]) {
  test(`citation hover, pressed and open states override from ${position}`, async ({ page }) => {
    const css =
      '.openui-citation:hover { background-color: rgb(4, 5, 6); } .openui-citation:active { background-color: rgb(7, 8, 9); } .openui-citation[data-state="instant-open"], .openui-citation[data-state="delayed-open"] { border-color: rgb(11, 12, 13); } .openui-citation-icon { color: rgb(1, 2, 3); }';
    const params = new URLSearchParams();
    if (position === "before") params.set("css", css);
    await open(page, params);
    if (position === "after") await page.addStyleTag({ content: css });
    const trigger = page.getByTestId("citation").getByRole("button", { name: "Citations" });
    await trigger.hover();
    await expect(trigger).toHaveCSS("background-color", "rgb(4, 5, 6)");
    await expect(trigger).toHaveCSS("border-top-color", "rgb(11, 12, 13)");
    await expect(trigger.locator("svg")).toHaveCSS("color", "rgb(1, 2, 3)");
    await page.mouse.down();
    await expect(trigger).toHaveCSS("background-color", "rgb(7, 8, 9)");
    await page.mouse.up();
  });
}

test("inline markdown keeps its reset and formatting in every caller", async ({ page }) => {
  await open(page);
  // TextBlock owns this visibility rule. The inline renderer's root must not override it.
  const tertiary = page.getByTestId("text-block").locator(".openui-text-block__tertiary");
  await expect(tertiary).toHaveText("Third");
  await expect(tertiary).toHaveCSS("display", "none");
  for (const caller of [
    "inline",
    "text-block",
    "inline-header",
    "entity-list",
    "option-cards",
    "context-card-block",
  ]) {
    const root = page.getByTestId(caller).locator(".openui-inline-markdown-renderer").first();
    const content = root.locator(".openui-inline-markdown-renderer-content");
    await expect(root).toBeVisible();
    await expect(content).toHaveCSS("display", "inline");
    await expect(content.locator("strong")).toHaveText("Inline");
    await expect(content.locator("a")).toHaveAttribute("href", "https://example.com");
    await expect(content.locator("code")).toHaveText("code");
    await expect(content.getByRole("button", { name: "Citations" })).toHaveCount(1);
    const inherited = await content.evaluate((el) => {
      const style = getComputedStyle(el);
      const parent = getComputedStyle(el.parentElement!);
      return ["font", "color", "text-align", "letter-spacing"].every(
        (p) => style.getPropertyValue(p) === parent.getPropertyValue(p),
      );
    });
    expect(inherited).toBe(true);
  }
});

test("listed sources keep their important exceptions and scroll using header controls", async ({
  page,
}) => {
  await open(page);
  const container = page.getByTestId("sources").locator(".openui-sources-item-container").first();
  await page.addStyleTag({
    content: ".openui-sources-item-container { width: 999px; background-color: red; }",
  });
  await expect(container).toHaveCSS("width", "180px");
  await expect(container).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  const buttons = page.getByTestId("sources").locator(".openui-sources-buttons button");
  await expect(buttons.first()).toBeDisabled();
  await buttons.last().click();
  const scroller = page.getByTestId("sources").locator(".openui-carousel-content");
  await expect.poll(() => scroller.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
  await expect(buttons.first()).toBeEnabled();
  await buttons.first().click();
  await expect.poll(() => scroller.evaluate((el) => el.scrollLeft)).toBe(0);
});

test("favicon fallback can recover when its URL changes", async ({ page }) => {
  await open(page);
  await expect(
    page.getByTestId("fallback").locator("svg.openui-source-favicon-image"),
  ).toBeVisible();
  await expect(page.getByTestId("retry").locator("svg.openui-source-favicon-image")).toBeVisible();
  await page.getByRole("button", { name: "Retry image" }).click();
  await expect(page.getByTestId("retry").getByAltText("Retry")).toBeVisible();
  await expect(page.getByTestId("empty")).toBeEmpty();
});

test("converted component styles survive rewriting html classes", async ({ page }) => {
  await open(page);
  const selectors = [
    ".openui-citation",
    ".openui-sources-item",
    ".openui-inline-markdown-renderer-content",
    "img.openui-source-favicon-image",
  ];
  const styles = () =>
    page.evaluate(
      (selectors) =>
        selectors.map((selector) => {
          const style = getComputedStyle(document.querySelector(selector)!);
          return [style.display, style.color, style.padding, style.objectFit];
        }),
      selectors,
    );
  const before = await styles();
  await page.evaluate(() => {
    document.documentElement.className = "consumer-html";
  });
  expect(await styles()).toEqual(before);
});

test("source cards keep the same default and hover styles in layer mode", async ({ page }) => {
  const measure = async () => {
    const card = page.getByTestId("sources").locator(".openui-sources-item-container").first();
    const read = () =>
      card.evaluate((el) => {
        el.getAnimations().forEach((animation) => animation.finish());
        const style = getComputedStyle(el);
        return Object.fromEntries(
          [
            "padding",
            "border-radius",
            "border-top-color",
            "border-top-width",
            "background-color",
            "width",
            "height",
            "font",
            "gap",
            "box-sizing",
            "display",
            "flex-direction",
            "flex-shrink",
            "scroll-snap-align",
          ].map((property) => [property, style.getPropertyValue(property)]),
        );
      });
    await page.mouse.move(0, 0);
    const rest = await read();
    await card.hover();
    return { rest, hover: await read() };
  };
  await open(page);
  const plain = await measure();
  expect(plain.rest["padding"]).toBe("0px");
  expect(plain.rest["border-radius"]).toBe("10px");
  expect(plain.hover["border-top-color"]).not.toBe(plain.rest["border-top-color"]);
  await open(page, new URLSearchParams({ layer: "openui" }));
  expect(await measure()).toEqual(plain);
});
