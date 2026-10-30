// Every stable class also joins bench.overrides and bench.tailwind through components.tsx.
// These focused cases exercise runtime states, private-variable propagation and layer mode.
import { expect, test, type Locator } from "@playwright/test";

const controls = [
  {
    family: "check-box",
    root: "openui-check-box-item",
    attribute: "data-state",
    on: "checked",
    off: "unchecked",
  },
  {
    family: "radio",
    root: "openui-radio-item",
    attribute: "data-state",
    on: "checked",
    off: "unchecked",
  },
  {
    family: "switch",
    root: "openui-switch-item",
    attribute: "data-state",
    on: "checked",
    off: "unchecked",
  },
  { family: "toggle", root: "openui-toggle-item", attribute: "data-state", on: "on", off: "off" },
  {
    family: "chips",
    root: "openui-chips-item",
    attribute: "aria-selected",
    on: "true",
    off: "false",
  },
];
const computed = (target: Locator, property: string) =>
  target.evaluate((el, property) => {
    el.getAnimations().forEach((animation) => animation.finish());
    return getComputedStyle(el).getPropertyValue(property);
  }, property);

for (const layer of [false, true]) {
  const query = layer ? "layer=1&" : "";
  for (const { family, root, attribute, on, off } of controls) {
    for (const position of ["before", "after"]) {
      test(`${family}: checked, unchecked, disabled and focus overrides ${position}, layer=${layer}`, async ({
        page,
      }) => {
        const css = `
          .${root}[${attribute}="${on}"] { background-color: rgb(1, 2, 3); }
          .${root}[${attribute}="${off}"] { background-color: rgb(4, 5, 6); }
          .${root}:disabled { color: rgb(7, 8, 9); }
          .${root}:focus-visible { outline: 3px solid rgb(10, 11, 12); outline-offset: 4px; }
        `;
        const url = `/choice-controls.html?${query}${position === "before" ? `css=${encodeURIComponent(css)}` : ""}`;
        await page.goto(url);
        const items = page.getByTestId(family).locator(`.${root}`);
        await expect(items).toHaveCount(2);
        if (position === "after") await page.addStyleTag({ content: css });
        await expect(items.first()).toHaveAttribute(attribute, on);
        expect(await computed(items.first(), "background-color")).toBe("rgb(1, 2, 3)");
        expect(await computed(items.nth(1), "background-color")).toBe("rgb(4, 5, 6)");
        // Keyboard modality activates :focus-visible, including in Radix roving-focus groups.
        await page.keyboard.press("Tab");
        await items.first().focus();
        await expect(items.first()).toBeFocused();
        expect(await computed(items.first(), "outline-color")).toBe("rgb(10, 11, 12)");
        expect(await computed(items.first(), "outline-width")).toBe("3px");
        await items.first().hover();
        expect(await computed(items.first(), "background-color")).toBe("rgb(1, 2, 3)");

        await page.goto(`${url}&disabled=1`);
        await expect(items.first()).toBeDisabled();
        if (position === "after") await page.addStyleTag({ content: css });
        await items.first().hover();
        expect(await computed(items.first(), "color")).toBe("rgb(7, 8, 9)");
        expect(await computed(items.first(), "background-color")).toBe("rgb(1, 2, 3)");
      });
    }

    test(`${family}: mouse and keyboard keep public state attributes current, layer=${layer}`, async ({
      page,
    }) => {
      await page.goto(`/choice-controls.html?${query}`);
      const items = page.getByTestId(family).locator(`.${root}`);
      await expect(items).toHaveCount(2);
      await expect(items.first()).toHaveAttribute(attribute, on);
      if (family === "radio") await items.nth(1).click();
      else await items.first().click();
      await expect(items.first()).toHaveAttribute(attribute, off);
      await items.first().focus();
      await page.keyboard.press("Space");
      await expect(items.first()).toHaveAttribute(attribute, on);
    });
  }

  for (const position of ["before", "after"]) {
    test(`SVG parts and switch thumb override independently ${position}, layer=${layer}`, async ({
      page,
    }) => {
      const css = `
        .openui-radio-item-path { fill: rgb(21, 22, 23); }
        .openui-radio-item-border { stroke: rgb(24, 25, 26); }
        .openui-radio-item-inner { fill: rgb(27, 28, 29); }
        .openui-switch-item-thumb[data-state="checked"] { transform: translateX(3px); }
        .openui-check-box-group { gap: 23px; }
        .openui-check-box-item-label { color: rgb(30, 31, 32); }
      `;
      await page.goto(
        `/choice-controls.html?${query}${position === "before" ? `css=${encodeURIComponent(css)}` : ""}`,
      );
      const path = page.locator(".openui-radio-item-path").first();
      await expect(path).toHaveCount(1);
      if (position === "after") await page.addStyleTag({ content: css });
      await page.locator(".openui-radio-item").first().hover();
      expect(await computed(path, "fill")).toBe("rgb(21, 22, 23)");
      expect(await computed(page.locator(".openui-radio-item-border").first(), "stroke")).toBe(
        "rgb(24, 25, 26)",
      );
      expect(await computed(page.locator(".openui-radio-item-inner").first(), "fill")).toBe(
        "rgb(27, 28, 29)",
      );
      expect(await computed(page.locator(".openui-switch-item-thumb").first(), "transform")).toBe(
        "matrix(1, 0, 0, 1, 3, 0)",
      );
      expect(await computed(page.locator(".openui-check-box-group"), "gap")).toBe("23px");
      expect(await computed(page.locator(".openui-check-box-item-label").first(), "color")).toBe(
        "rgb(30, 31, 32)",
      );
    });
  }

  test(`choice styles register on import and survive an html class rewrite, layer=${layer}`, async ({
    page,
  }) => {
    await page.goto(`/choice-controls.html?${query}lazy=1`);
    await page.waitForFunction(() => typeof window.mountFixture === "function");
    const css = () =>
      page.evaluate(() => document.getElementById("openui-styles")?.textContent ?? "");
    const imported = await css();
    const html = await page.evaluate(() => document.documentElement.className);
    expect(imported).toContain("--_openui-radio-item");
    expect(imported).toContain("--_openui-chips-item");
    await page.evaluate(() => window.mountFixture());
    await expect(page.locator(".openui-radio-item")).toHaveCount(2);
    expect(await css()).toContain("--_openui-radio-item");
    expect(await css()).toContain("--_openui-chips-item");
    const generated = await page
      .locator("#root [class]")
      .evaluateAll((elements) =>
        elements.flatMap((el) => [...el.classList].filter((name) => /^go\d+$/.test(name))),
      );
    expect(generated.length).toBeGreaterThan(0);
    for (const name of generated) expect(imported).toMatch(new RegExp(`\\.${name}(?![0-9])`));
    expect(await css()).toBe(imported);
    expect(await page.evaluate(() => document.documentElement.className)).toBe(html);
    const measurements = () =>
      Promise.all(
        controls.map(({ root }) => computed(page.locator(`.${root}`).first(), "background-color")),
      );
    const before = await measurements();
    await page.evaluate(() => {
      document.documentElement.className = "consumer-document";
    });
    expect(await measurements()).toEqual(before);
  });
}
