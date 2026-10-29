import { expect, test, type Locator, type Page } from "@playwright/test";

const read = (part: Locator, property: string) =>
  part.evaluate((el, property) => {
    el.getAnimations().forEach((animation) => animation.finish());
    return getComputedStyle(el).getPropertyValue(property);
  }, property);

const open = async (page: Page, params: URLSearchParams) => {
  await page.goto(`/slider.html?${params}`);
  await expect(page.locator(".openui-slider-thumb").first()).toBeVisible();
};

for (const layer of ["", "openui"]) {
  for (const position of ["before", "after"]) {
    for (const state of ["hover", "focus-visible", "disabled"] as const) {
      test(`Slider thumb ${state} overrides ${position} the library (${layer || "default"})`, async ({
        page,
      }) => {
        const suffix = state === "disabled" ? "[data-disabled]" : `:${state}`;
        const css = `.openui-slider-thumb${suffix} { outline: 3px solid rgb(1, 2, 3); background-color: rgb(4, 5, 6); }`;
        const params = new URLSearchParams({
          layer,
          ...(state === "disabled" ? { disabled: "1" } : {}),
        });
        if (position === "before") params.set("css", css);
        await open(page, params);
        if (position === "after") await page.addStyleTag({ content: css });
        const thumb = page.locator(".openui-slider-thumb");
        if (state === "hover") await thumb.hover();
        if (state === "focus-visible") await page.keyboard.press("Tab");
        if (state === "focus-visible") await expect(thumb).toBeFocused();
        await expect(thumb).toHaveCSS("outline-color", "rgb(1, 2, 3)");
        await expect(thumb).toHaveCSS("background-color", "rgb(4, 5, 6)");
      });
    }

    for (const [selector, property, value, query] of [
      [".openui-slider-thumb-handle-inner:hover", "background-color", "rgb(1, 2, 3)", ""],
      [".openui-slider-thumb-value", "opacity", "0.6", ""],
      [".openui-slider-range[data-at-min]", "background-color", "rgb(1, 2, 3)", "min"],
      [
        '.openui-slider-dots-dot[data-state="active"]',
        "background-color",
        "rgb(1, 2, 3)",
        "discrete",
      ],
      [".openui-slider-block-input", "padding-left", "17px", "block"],
      [".openui-slider-block-select-trigger", "height", "45px", "block&discrete"],
    ]) {
      test(`${selector} ${property} overrides ${position} (${layer || "default"})`, async ({
        page,
      }) => {
        const css = `${selector} { ${property}: ${value}; }`;
        const params = new URLSearchParams(query);
        params.set("layer", layer);
        if (position === "before") params.set("css", css);
        await open(page, params);
        if (position === "after") await page.addStyleTag({ content: css });
        const part = page.locator(selector!.replace(":hover", "")).first();
        if (selector!.includes(":hover")) await part.hover();
        if (property === "opacity") await page.locator(".openui-slider-thumb-handle").hover();
        expect(await read(part, property!)).toBe(value);
      });
    }
  }
}

test("Slider preserves its public root and keyboard value updates", async ({ page }) => {
  await open(page, new URLSearchParams("discrete"));
  const root = page.getByTestId("slider");
  await expect(root).toHaveClass(/\bopenui-slider\b/);
  await expect(root).toHaveClass(/\bconsumer-slider\b/);
  await expect(root).toHaveAttribute("data-root-ref", "true");
  const thumb = page.getByRole("slider");
  await thumb.focus();
  await page.keyboard.press("ArrowRight");
  await expect(thumb).toHaveAttribute("aria-valuenow", "75");
  await expect(page.locator('.openui-slider-dots-dot[data-state="active"]')).toHaveCount(4);
});

test("SliderBlock composes Input sizing, validation and slider updates", async ({ page }) => {
  await open(page, new URLSearchParams("block&range"));
  const inputs = page.locator(".openui-slider-block-input");
  await expect(inputs.first()).toHaveClass(/\bopenui-input--size-medium\b/);
  await expect(inputs.first()).toHaveCSS("width", "64px");
  await expect(inputs.first()).toHaveCSS("height", "36px");
  await expect(inputs.first()).toHaveCSS("padding-left", "8px");
  await inputs.first().fill("-1");
  await expect(inputs.first()).toHaveAttribute("data-invalid", "true");
  await expect(page.locator(".openui-slider-block-header")).toHaveAttribute("data-invalid", "true");
  await expect(page.locator(".openui-slider-block-error-message")).toContainText(
    "between 0 and 100",
  );
  const border = await read(inputs.first(), "border-top-color");
  await page.addStyleTag({
    content:
      ".openui-slider-block-input[data-invalid=true] { border-color: rgb(1, 2, 3); background-color: rgb(4, 5, 6); }",
  });
  expect(await read(inputs.first(), "border-top-color")).toBe(border); // documented !important exception
  await expect(inputs.first()).toHaveCSS("background-color", "rgb(4, 5, 6)");
  await inputs.first().fill("50");
  await expect(page.locator(".openui-slider-block-error-message")).toHaveCount(0);
  await expect(page.getByRole("slider").first()).toHaveAttribute("aria-valuenow", "50");
});

test("SliderBlock Select keeps its public parts and updates through a portal", async ({ page }) => {
  await open(page, new URLSearchParams("block&discrete&range"));
  const trigger = page.locator(".openui-slider-block-select-trigger").first();
  await expect(trigger).toHaveClass(/\bopenui-select-trigger--size-md\b/);
  await expect(trigger).toHaveCSS("width", "80px");
  await expect(trigger).toHaveCSS("height", "36px");
  await trigger.click();
  const selected = page.locator('.openui-select-item[data-state="checked"]');
  await expect(selected).toBeFocused();
  expect(await selected.evaluate((el) => !document.getElementById("root")!.contains(el))).toBe(
    true,
  );
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("option", { name: "50", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("slider").first()).toHaveAttribute("aria-valuenow", "50");
});

test("SliderBlock suppresses streaming controls and discrete marks", async ({ page }) => {
  await open(page, new URLSearchParams("block&discrete&streaming"));
  await expect(page.locator(".openui-slider-block-controls")).toHaveCount(0);
  await expect(page.locator(".openui-slider-dots-dot")).toHaveCount(0);
});

for (const block of [false, true]) {
  test(`Slider${block ? "Block" : ""} registers only on render and survives an html class rewrite`, async ({
    page,
  }) => {
    await page.goto(`/slider.html?lazy=1${block ? "&block=1" : ""}`);
    await page.waitForFunction(() => typeof window.mountFixture === "function");
    const before = await page.evaluate(() => ({
      css: document.getElementById("_goober")!.textContent!,
      html: document.documentElement.className,
    }));
    await page.evaluate(() => window.mountFixture());
    await expect(page.locator(".openui-slider-thumb")).toBeVisible();
    const generated = await page
      .locator(block ? '[class*="openui-slider"] , .openui-input' : '[class*="openui-slider"]')
      .evaluateAll((elements) => [
        ...new Set(
          elements.flatMap((el) => [...el.classList].filter((name) => /^go\d+$/.test(name))),
        ),
      ]);
    expect(generated.length).toBeGreaterThan(0);
    for (const name of generated) expect(before.css).not.toMatch(new RegExp(`\\.${name}(?![0-9])`));
    expect(await page.evaluate(() => document.documentElement.className)).toBe(before.html);
    const part = page.locator(".openui-slider-container");
    const bg = await read(part, "background-color");
    await page.evaluate(() => {
      document.documentElement.className = "consumer-html";
    });
    expect(await read(part, "background-color")).toBe(bg);
  });
}
