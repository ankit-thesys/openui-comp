// Override bench (the lab's nested-vs-flat case, on the real components): for every migrated
// component, consumer CSS on each stable class, loaded before or after the library, beats the
// library on every element carrying that class, with no `!important`. Nested library rules lost
// here; flat ones must not.
import { expect, test, type Page } from "@playwright/test";
import { migrated, openMigrated } from "./bench/migrated";

const OVERRIDE = {
  color: "rgb(1, 2, 3)",
  "background-color": "rgb(4, 5, 6)",
  "padding-top": "7px",
  "padding-right": "8px",
  "padding-bottom": "9px",
  "padding-left": "10px",
  "border-top-color": "rgb(11, 12, 13)",
};
const declarations = Object.entries(OVERRIDE)
  .map(([property, value]) => `${property}: ${value};`)
  .join(" ");

// Computed OVERRIDE properties of every element carrying `className`, transitions finished.
const computedAll = (page: Page, className: string) =>
  page.locator(`#root .${className}`).evaluateAll(
    (elements, properties) =>
      elements.map((el) => {
        el.getAnimations().forEach((animation) => animation.finish());
        const style = getComputedStyle(el);
        return Object.fromEntries(properties.map((p) => [p, style.getPropertyValue(p)]));
      }),
    Object.keys(OVERRIDE),
  );

for (const component of migrated) {
  test.describe(component.folder, () => {
    for (const className of component.stableClasses) {
      const rule = `.${className} { ${declarations} }`;

      test(`.${className} wins when loaded before the library`, async ({ page }) => {
        await openMigrated(page, component, `<style>${rule}</style>`);
        const styles = await computedAll(page, className);
        expect(styles.length).toBeGreaterThan(0);
        for (const style of styles) expect(style).toEqual(OVERRIDE);
      });

      test(`.${className} wins when loaded after the library`, async ({ page }) => {
        await openMigrated(page, component);
        await page.addStyleTag({ content: rule });
        const styles = await computedAll(page, className);
        expect(styles.length).toBeGreaterThan(0);
        for (const style of styles) expect(style).toEqual(OVERRIDE);
      });
    }
  });
}
