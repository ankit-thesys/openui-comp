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

// The outline style that the library's `.<thumb class><suffix>` rule declares, or null if none.
const libraryOutline = (page: Page, suffix: string) =>
  page.evaluate((suffix) => {
    const thumb = document.querySelector(".openui-slider-thumb")!;
    const generated = [...thumb.classList].filter((name) => /^go\d+$/.test(name));
    const selectors = new Set(generated.map((name) => `.${name}${suffix}`));
    let outline: string | null = null;
    const visit = (rules: CSSRuleList) => {
      for (const rule of rules) {
        if (rule instanceof CSSStyleRule && selectors.has(rule.selectorText.replace(/"/g, "")))
          outline = rule.style.getPropertyValue("outline-style") || outline;
        else if (rule instanceof CSSGroupingRule) visit(rule.cssRules);
      }
    };
    visit((document.getElementById("_goober") as HTMLStyleElement).sheet!.cssRules);
    return outline;
  }, suffix);

for (const layer of ["", "openui"]) {
  for (const position of ["before", "after"]) {
    for (const state of ["hover", "focus-visible", "disabled"] as const) {
      test(`Slider thumb ${state} overrides ${position} the library (${layer || "default"})`, async ({
        page,
      }) => {
        const suffix = state === "disabled" ? "[data-disabled]" : `:${state}`;
        const css = `.openui-slider-thumb${suffix} { outline: 3px solid rgb(1, 2, 3); }`;
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
        // The library styles this state on the thumb's own class, so the override competes with it.
        expect(await libraryOutline(page, suffix)).toBe("none");
        await expect(thumb).toHaveCSS("outline-style", "solid");
        await expect(thumb).toHaveCSS("outline-width", "3px");
        await expect(thumb).toHaveCSS("outline-color", "rgb(1, 2, 3)");
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
  await expect(inputs.first()).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator(".openui-slider-block-header")).toHaveAttribute("data-invalid", "true");
  await expect(page.locator(".openui-slider-block-error-message")).toContainText(
    "between 0 and 100",
  );
  await inputs.first().fill("50");
  await expect(inputs.first()).not.toHaveAttribute("aria-invalid");
  await expect(page.locator(".openui-slider-block-error-message")).toHaveCount(0);
  await expect(page.getByRole("slider").first()).toHaveAttribute("aria-valuenow", "50");
});

// SliderBlock's error input uses Input's public invalid state, so Input's state override reaches
// it, as does the SliderBlock part's, focused or not.
for (const layer of ["", "openui"]) {
  for (const position of ["before", "after"]) {
    for (const selector of [
      '.openui-input[aria-invalid="true"]',
      '.openui-slider-block-input[aria-invalid="true"]',
    ]) {
      test(`SliderBlock invalid input takes ${selector} ${position} the library (${layer || "default"})`, async ({
        page,
      }) => {
        const css = `${selector} { border-color: rgb(1, 2, 3); box-shadow: rgb(4, 5, 6) 0px 0px 0px 1px; }`;
        const params = new URLSearchParams("block&range");
        params.set("layer", layer);
        if (position === "before") params.set("css", css);
        await open(page, params);
        if (position === "after") await page.addStyleTag({ content: css });
        const input = page.locator(".openui-slider-block-input").first();
        await input.fill("-1");
        await expect(input).toHaveAttribute("aria-invalid", "true");
        expect(await read(input, "border-top-color")).toBe("rgb(1, 2, 3)");
        expect(await read(input, "box-shadow")).toBe("rgb(4, 5, 6) 0px 0px 0px 1px");
        await input.blur();
        expect(await read(input, "border-top-color")).toBe("rgb(1, 2, 3)");
        expect(await read(input, "box-shadow")).toBe("rgb(4, 5, 6) 0px 0px 0px 1px");
      });
    }
  }
}

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
