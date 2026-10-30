// #93: every owned stable class overrides from both load positions and in both cascade modes.
// Queries include portal nodes outside #root. Wait on a visible item/day, never the portal wrapper.
import { expect, test, type Page } from "@playwright/test";
import { migrated } from "./bench/migrated";

const expected = {
  color: "rgb(1, 2, 3)",
  "background-color": "rgb(4, 5, 6)",
  "padding-top": "7px",
  "border-top-color": "rgb(11, 12, 13)",
};
const declarations = Object.entries(expected)
  .map(([key, value]) => `${key}:${value};`)
  .join("");
const states = [
  "",
  ":hover",
  ":focus-visible",
  ":focus-within",
  ":disabled",
  '[data-state="open"]',
  '[data-state="checked"]',
  "[data-placeholder]",
  "[data-disabled]",
  "[data-highlighted]",
  "[data-today-unselected]",
  '[data-selection="single"]',
  "[data-range-start]",
  "[data-range-middle]",
  "[data-range-end]",
];
const computed = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el, properties) => {
      el.getAnimations().forEach((animation) => animation.finish());
      const style = getComputedStyle(el);
      return Object.fromEntries(
        properties.map((property) => [property, style.getPropertyValue(property)]),
      );
    }, Object.keys(expected));

for (const family of ["Select", "Calendar", "DatePicker"]) {
  const component = migrated.find((entry) => entry.folder === family)!;
  for (const layer of ["", "openui"])
    for (const order of ["before", "after"])
      for (const name of component.stableClasses) {
        test(`${family} .${name} overrides ${order} (${layer || "default"})`, async ({ page }) => {
          const css = states.map((state) => `.${name}${state}`).join(",") + `{${declarations}}`;
          const params = new URLSearchParams({
            family: family === "DatePicker" ? "date-picker" : family.toLowerCase(),
            layer,
          });
          if (family !== "Calendar") params.set("open", "1");
          const size = name.match(/--size-(sm|md|lg)$/)?.[1];
          if (size) params.set("size", size);
          const layout = name.match(/--layout-(\w+)$/)?.[1];
          if (layout) params.set("layout", layout);
          if (name.endsWith("--position-item-aligned")) params.set("position", "item-aligned");
          if (name.endsWith("--mode-range")) params.set("selection-mode", "range");
          if (name.endsWith("--hide-dropdown-icon")) params.set("hide-icon", "1");
          if (name.endsWith("caption-label")) params.set("label", "1");
          if (
            family === "Calendar" &&
            [
              "openui-calendar-select-trigger",
              "openui-calendar-months-dropdown",
              "openui-calendar-years-dropdown",
            ].includes(name)
          )
            params.set("disabled", "1");
          if (order === "before") params.set("css", css);
          await page.goto(`/select-calendar.html?${params}`);
          if (family === "Select")
            await expect(page.locator('.openui-select-item[data-state="checked"]')).toBeVisible();
          else await expect(page.locator(".openui-calendar-day-button").first()).toBeVisible();
          if (family === "Calendar" && /select-(content|viewport|item)/.test(name)) {
            const months = name.endsWith("content-months");
            await page
              .locator(".openui-calendar-select-trigger")
              .nth(months ? 0 : 1)
              .click();
            await expect(page.locator('.openui-select-item[data-state="checked"]')).toBeVisible();
          }
          await expect(page.locator(`.${name}`).first()).toBeAttached();
          if (order === "after") await page.addStyleTag({ content: css });
          expect(await computed(page, `.${name}`)).toEqual(expected);
        });
      }
}

for (const layer of ["", "openui"])
  for (const mode of ["light", "dark"]) {
    test(`Select portal state, keyboard selection and disabled item (${layer || "default"}/${mode})`, async ({
      page,
    }) => {
      await page.goto(`/select-calendar.html?layer=${layer}&mode=${mode}`);
      const trigger = page.getByTestId("trigger");
      await trigger.focus();
      await page.keyboard.press("ArrowDown");
      const selected = page.locator('.openui-select-item[data-state="checked"]');
      await expect(selected).toBeVisible();
      await expect(selected).toBeFocused();
      await expect(trigger).toHaveAttribute("data-state", "open");
      expect(await selected.evaluate((el) => !document.getElementById("root")!.contains(el))).toBe(
        true,
      );
      await expect(page.locator(".openui-select-item[data-disabled]")).toHaveCSS(
        "pointer-events",
        "none",
      );
      await page.keyboard.press("ArrowDown");
      await expect(page.getByRole("option", { name: "Two", exact: true })).toBeFocused();
      // End also verifies that keyboard navigation skips the disabled final option.
      await page.keyboard.press("ArrowUp");
      await expect(selected).toBeFocused();
      await page.keyboard.press("End");
      await expect(page.getByRole("option", { name: "Two", exact: true })).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(trigger).toHaveAttribute("data-state", "closed");
      await expect(trigger).toContainText("two");
    });

    test(`Calendar day attributes and DatePicker floating overrides (${layer || "default"}/${mode})`, async ({
      page,
    }) => {
      await page.goto(`/select-calendar.html?family=calendar&layer=${layer}&mode=${mode}`);
      const start = page.locator('[data-day="2026-10-15"]');
      await expect(start).toHaveAttribute("data-range-start", "true");
      await expect(page.locator('[data-day="2026-10-16"]')).toHaveAttribute(
        "data-range-middle",
        "true",
      );
      await expect(page.locator('[data-day="2026-10-18"]')).toHaveAttribute(
        "data-range-end",
        "true",
      );
      const disabled = page.locator('[data-day="2026-10-20"] button');
      const before = await computed(page, '[data-day="2026-10-20"] button');
      await disabled.hover();
      expect(await computed(page, '[data-day="2026-10-20"] button')).toEqual(before);
      await page.goto(`/select-calendar.html?family=date-picker&layer=${layer}&mode=${mode}`);
      await page.locator(".openui-date-picker-trigger").click();
      await expect(
        page.locator(".openui-date-picker-menu .openui-calendar-day-button").first(),
      ).toBeVisible();
      expect(
        await page
          .locator(".openui-date-picker-menu")
          .evaluate((el) => !document.getElementById("root")!.contains(el)),
      ).toBe(true);
      await page.addStyleTag({
        content:
          ".openui-date-picker-menu{padding:7px;background-color:rgb(4,5,6)} .openui-date-picker-calendar-content{border-radius:3px}",
      });
      await expect(page.locator(".openui-date-picker-menu")).toHaveCSS("padding-top", "7px");
      await expect(page.locator(".openui-date-picker-calendar-content")).toHaveCSS(
        "border-top-left-radius",
        "3px",
      );
      await page.locator(".openui-date-picker-trigger").click();
      await expect(page.locator(".openui-date-picker-menu")).toHaveCount(0);
    });
  }

for (const family of ["select", "calendar", "date-picker"]) {
  test(`${family} registers on import and survives html class replacement including portals`, async ({
    page,
  }) => {
    await page.goto(`/select-calendar.html?family=${family}&lazy=1&open=1`);
    await page.waitForFunction(() => typeof window.mountFixture === "function");
    const before = await page.evaluate(() => ({
      sheet: document.getElementById("openui-styles")?.textContent ?? "",
      html: document.documentElement.className,
    }));
    await page.evaluate(() => window.mountFixture());
    const ready = family === "select" ? ".openui-select-item" : ".openui-calendar-day-button";
    await expect(page.locator(ready).first()).toBeVisible();
    const selectors =
      family === "select"
        ? [".openui-select-trigger", ".openui-select-content", ".openui-select-item"]
        : family === "calendar"
          ? [".openui-calendar-content", ".openui-calendar-day-button"]
          : [
              ".openui-date-picker-trigger",
              ".openui-date-picker-menu",
              ".openui-date-picker-calendar-content",
            ];
    const classes = await page
      .locator(selectors.join(","))
      .evaluateAll((els) =>
        els.flatMap((el) => [...el.classList].filter((name) => /^go\d+$/.test(name))),
      );
    expect(classes.length).toBeGreaterThan(0);
    for (const name of classes) expect(before.sheet).toMatch(new RegExp(`\\.${name}(?![0-9])`));
    expect(
      await page.evaluate(() => document.getElementById("openui-styles")?.textContent ?? ""),
    ).toBe(before.sheet);
    expect(await page.locator("html").getAttribute("class")).toEqual(before.html);
    const observations = await Promise.all(selectors.map((selector) => computed(page, selector)));
    await page.evaluate(() => {
      document.documentElement.className = "consumer-html";
    });
    expect(await Promise.all(selectors.map((selector) => computed(page, selector)))).toEqual(
      observations,
    );
  });
}

for (const layer of ["", "openui"])
  for (const order of ["before", "after"])
    for (const position of ["popper", "item-aligned"]) {
      test(`Select content and viewport static defaults (${position}) override ${order} (${layer || "default"})`, async ({
        page,
      }) => {
        const css =
          ".openui-select-content{display:grid;flex-direction:row;outline:1px solid rgb(1,2,3);box-sizing:content-box;max-height:222px} .openui-select-viewport{position:static;flex:none;overflow:visible}";
        const params = new URLSearchParams({ layer, open: "1", position });
        if (order === "before") params.set("css", css);
        await page.goto(`/select-calendar.html?${params}`);
        await expect(page.locator('.openui-select-item[data-state="checked"]')).toBeVisible();
        if (order === "after") await page.addStyleTag({ content: css });
        const content = page.locator(".openui-select-content");
        await expect(content).toHaveCSS("display", "grid");
        await expect(content).toHaveCSS("flex-direction", "row");
        await expect(content).toHaveCSS("outline-width", "1px");
        await expect(content).toHaveCSS("box-sizing", "content-box");
        await expect(content).toHaveCSS("max-height", "222px");
        const viewport = page.locator(".openui-select-viewport");
        await expect(viewport).toHaveCSS("position", "static");
        await expect(viewport).toHaveCSS("flex", "0 0 auto");
        await expect(viewport).toHaveCSS("overflow", "visible");
        await expect(viewport).toHaveAttribute("data-position", position);
        await expect(page.locator(".openui-select-value")).toHaveAttribute(
          "data-value-root-ref",
          "true",
        );
      });
    }
