// #99 public Chromium seam. Build, then run: pnpm exec playwright test lists-tables.
// Every owned stable class (including portals) must accept ordinary consumer CSS in both modes.
import { expect, test, type Page } from "@playwright/test";
import { migrated } from "./bench/migrated";

const families = [
  "ListItem",
  "ListBlock",
  "EntityList",
  "Table",
  "EditableTable",
  "MetricIndicator",
];
const states = [
  "",
  ":hover",
  ":focus",
  ":last-child",
  ":nth-child(even)",
  '[data-action="true"]',
  '[data-subtitle="true"]',
  '[data-disabled="true"]',
  '[data-side="left"]',
  '[data-side="right"]',
  '[data-state="idle"]',
  '[data-state="selected"]',
  '[data-state="editing"]',
  '[data-state="open"]',
  '[data-state="checked"]',
  "[data-highlighted]",
];
const declarations =
  "color: rgb(1, 2, 3); background-color: rgb(4, 5, 6); padding: 7px; border: 3px solid rgb(11, 12, 13); border-radius: 2px;";
async function open(page: Page, params = new URLSearchParams()) {
  await page.goto(`/lists-tables.html?${params}`);
  await expect(
    page.getByTestId("editing").locator(".openui-editable-table-cell-base").first(),
  ).toBeVisible();
}
async function openSelect(page: Page) {
  const cell = page.getByTestId("editing").locator(".openui-editable-table-cell-base").nth(3);
  await cell.click();
  await cell.press("Enter");
  await expect(page.locator(".openui-editable-table-select-item").first()).toBeVisible();
}
for (const layer of [undefined, "openui"]) {
  for (const position of ["before", "after"]) {
    for (const component of migrated.filter((entry) => families.includes(entry.folder))) {
      for (const name of component.stableClasses) {
        test(`${component.folder}: .${name} overrides ${position}, ${layer ?? "default"} mode`, async ({
          page,
        }) => {
          const css = `${states.map((state) => `.${name}${state}`).join(", ")} { ${declarations} }`;
          const params = new URLSearchParams();
          if (layer) params.set("layer", layer);
          if (position === "before") params.set("css", css);
          await open(page, params);
          if (name === "openui-editable-table-cell-input") {
            const cell = page
              .getByTestId("editing")
              .locator(".openui-editable-table-cell-base")
              .first();
            await cell.click();
            await cell.press("Enter");
            await expect(cell.locator("input")).toBeVisible();
          }
          if (/select-(content|viewport|item|check|indicator)/.test(name)) await openSelect(page);
          if (name.includes("scroll-control") || name === "openui-scrollable-table-control")
            await expect(page.locator(`.${name}`).first()).toBeAttached();
          if (position === "after") await page.addStyleTag({ content: css });
          const target = page.locator(`.${name}`);
          await expect(target.first()).toBeAttached();
          // Hidden warnings and zero-height outlines still participate; no blanket visibility skip.
          const values = await target.evaluateAll((elements) =>
            elements.map((el) => {
              el.getAnimations().forEach((animation) => animation.finish());
              const style = getComputedStyle(el);
              return [
                style.color,
                style.backgroundColor,
                style.padding,
                style.borderTopColor,
                style.borderTopWidth,
                style.borderRadius,
              ];
            }),
          );
          for (const value of values)
            expect(value).toEqual([
              "rgb(1, 2, 3)",
              "rgb(4, 5, 6)",
              "7px",
              "rgb(11, 12, 13)",
              "3px",
              "2px",
            ]);
        });
      }
    }
  }
}

for (const layer of [undefined, "openui"]) {
  for (const position of ["before", "after"]) {
    test(`cell selection, editing and select states override ${position}, ${layer ?? "default"}`, async ({
      page,
    }) => {
      const css =
        '.openui-editable-table-cell-outline-top[data-state="selected"] {height: 3px;} .openui-editable-table-cell-outline-top[data-state="editing"] {height: 4px;} .openui-editable-table-select-trigger[data-state="open"] {background-color: rgb(4, 5, 6);} .openui-editable-table-select-item[data-state="checked"] {background-color: rgb(7, 8, 9);} .openui-editable-table-select-item[data-highlighted] {color: rgb(11, 12, 13);} .openui-editable-table-cell-input {padding: 5px; background-color: rgb(1, 2, 3);}';
      const params = new URLSearchParams();
      if (layer) params.set("layer", layer);
      if (position === "before") params.set("css", css);
      await open(page, params);
      if (position === "after") await page.addStyleTag({ content: css });
      const text = page.getByTestId("editing").locator(".openui-editable-table-cell-base").first();
      await text.click();
      await expect(text.locator(".openui-editable-table-cell-outline-top")).toHaveCSS(
        "height",
        "3px",
      );
      await text.press("Enter");
      await expect(text.locator(".openui-editable-table-cell-outline-top")).toHaveCSS(
        "height",
        "4px",
      );
      await expect(text.locator("input")).toHaveCSS("padding", "5px");
      await text.locator("input").fill("Lovelace");
      await text.locator("input").press("Enter");
      await expect(page.getByTestId("saved")).toContainText("Lovelace");
      await openSelect(page);
      // Radix aria-hides the trigger's ancestors while the modal listbox is open.
      const trigger = page.getByTestId("editing").locator(".openui-editable-table-select-trigger");
      await expect(trigger).toHaveAttribute("data-state", "open");
      await expect(trigger).toHaveCSS("background-color", "rgb(4, 5, 6)");
      await expect(page.getByRole("option", { name: "Ready", exact: true })).toHaveCSS(
        "background-color",
        "rgb(7, 8, 9)",
      );
      const pending = page.getByRole("option", { name: "Pending", exact: true });
      await pending.hover();
      await expect(pending).toHaveCSS("color", "rgb(11, 12, 13)");
      await pending.click();
      await expect(page.getByTestId("saved")).toContainText('"status":"pending"');
      await expect(page.locator(".openui-editable-table-select-content")).toHaveCount(0);
    });
  }
}

test("list hover and focus keep part overrides and scrolling keeps state and width overridable", async ({
  page,
}) => {
  await open(
    page,
    new URLSearchParams({
      // A table cannot shrink below its cells' intrinsic minimum widths. Keep this fixture's
      // content compact enough to exercise an exact 800px consumer width and real overflow.
      css: ".openui-list-item-indicator {background-color: rgb(1, 2, 3);} .openui-list-item-action-label {color: rgb(4, 5, 6);} .openui-scrollable-table, .openui-scrollable-table[data-scrollable=true] {width: 800px;} .openui-editable-table-head {width: 160px;}",
    }),
  );
  const item = page
    .locator('[data-family="ListItem"] .openui-list-item-row[role="button"]')
    .first();
  await item.hover();
  await expect(item.locator(".openui-list-item-indicator")).toHaveCSS(
    "background-color",
    "rgb(1, 2, 3)",
  );
  await item.focus();
  await expect(item.locator(".openui-list-item-action-label")).toHaveCSS("color", "rgb(4, 5, 6)");
  await expect(page.locator(".openui-scrollable-table")).toHaveCSS("width", "800px");
  const right = page.locator('[data-family="Table"]').getByRole("button", { name: "Scroll right" });
  await right.click();
  await expect(
    page.locator('[data-family="Table"]').getByRole("button", { name: "Scroll left" }),
  ).toBeVisible();
});

test("lists and tables retain computed styles after html classes are rewritten", async ({
  page,
}) => {
  await open(page);
  await openSelect(page);
  const snapshot = () =>
    page
      .locator(
        '[class*="openui-list-"], [class*="openui-entity-list"], [class*="openui-table"], [class*="openui-scrollable-table"], [class*="openui-editable-table"], [class*="openui-metric-indicator"]',
      )
      .evaluateAll((elements) =>
        elements.map((el) => {
          el.getAnimations().forEach((animation) => animation.finish());
          const css = getComputedStyle(el);
          return [css.color, css.backgroundColor, css.padding, css.font, css.borderColor];
        }),
      );
  const before = await snapshot();
  await page.evaluate(() => {
    document.documentElement.className = "consumer-root";
  });
  expect(await snapshot()).toEqual(before);
});

// Derived data attributes (README "Derived data attributes"): each overflowing table's scroll
// buttons carry data-side, left then right for each table; an overflowing table carries
// data-scrollable="true", and other tables leave it off.
test("table scroll buttons carry data-side and tables data-scrollable", async ({ page }) => {
  await open(page);
  for (const table of [".openui-scrollable-table", ".openui-editable-table-grid"]) {
    await expect(page.locator(`${table}[data-scrollable="true"]`).first()).toBeAttached();
    const values = await page
      .locator(table)
      .evaluateAll((elements) => elements.map((el) => el.getAttribute("data-scrollable")));
    expect(values.filter((value) => value !== "true" && value !== null)).toEqual([]);
  }
  for (const control of [
    ".openui-scrollable-table-control",
    ".openui-editable-table-scroll-control",
  ]) {
    await expect(page.locator(control).first()).toBeAttached();
    const sides = await page
      .locator(control)
      .evaluateAll((elements) => elements.map((el) => el.getAttribute("data-side")));
    expect(sides.length % 2).toBe(0);
    expect(sides).toEqual(sides.map((_, i) => (i % 2 === 0 ? "left" : "right")));
  }
});
