// Override bench (the lab's nested-vs-flat case, on the real components): for every migrated
// component, consumer CSS on each stable class, loaded before or after the library, beats the
// library on every element carrying that class, with no `!important`. As the README's contract
// says, the consumer rule adds the same state where the library styles one (an active Tabs
// trigger's `[data-state="active"]`, say); the states come from the library rules matching each
// element at rest. Nested library rules lost here; flat ones must not.
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
  page.locator(`.${className}`).evaluateAll(
    (elements, properties) =>
      elements.map((el) => {
        el.getAnimations().forEach((animation) => animation.finish());
        const style = getComputedStyle(el);
        return Object.fromEntries(properties.map((p) => [p, style.getPropertyValue(p)]));
      }),
    Object.keys(OVERRIDE),
  );

// State suffixes (`[data-state="active"]`, `:disabled`, …) of library rules that currently match an
// element carrying `className`, read from the library sheet.
const statesOn = (page: Page, className: string) =>
  page.evaluate((className) => {
    const elements = [...document.querySelectorAll(`.${className}`)];
    const states = new Set<string>();
    const visit = (rules: CSSRuleList) => {
      for (const rule of rules) {
        if (rule instanceof CSSStyleRule) {
          for (const selector of rule.selectorText.split(",")) {
            const state = selector.trim().match(/^\.go\d+((?::[\w-]+|\[[^\]]+\])+)$/)?.[1];
            if (state && elements.some((el) => el.matches(selector))) states.add(state);
          }
        } else if (rule instanceof CSSMediaRule) {
          if (matchMedia(rule.conditionText).matches) visit(rule.cssRules);
        } else if (rule instanceof CSSGroupingRule) visit(rule.cssRules);
      }
    };
    visit((document.getElementById("_goober") as HTMLStyleElement).sheet!.cssRules);
    return [...states];
  }, className);

for (const component of migrated) {
  test.describe(component.folder, () => {
    for (const className of component.stableClasses) {
      // The override as a consumer would write it: the class, plus each state the library styles.
      const ruleFor = async (page: Page) => {
        await openMigrated(page, component);
        const selectors = [``, ...(await statesOn(page, className))].map(
          (state) => `.${className}${state}`,
        );
        return `${selectors.join(", ")} { ${declarations} }`;
      };

      const check = async (page: Page) => {
        const styles = await computedAll(page, className);
        test.skip(
          styles.length === 0 &&
            component.clientOnly.includes(className) &&
            !className.startsWith("openui-chart-tooltip"),
          `.${className} renders only once the browser measures overflow`,
        );
        expect(styles.length).toBeGreaterThan(0);
        for (const style of styles) expect(style).toEqual(OVERRIDE);
      };

      test(`.${className} wins when loaded before the library`, async ({ page }) => {
        const rule = await ruleFor(page);
        await openMigrated(page, component, `<style>${rule}</style>`);
        await check(page);
      });

      test(`.${className} wins when loaded after the library`, async ({ page }) => {
        const rule = await ruleFor(page);
        await page.addStyleTag({ content: rule });
        await check(page);
      });
    }
  });
}
