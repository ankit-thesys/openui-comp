// Tailwind reset matrix: with real Tailwind 3.3.7, 3.4.17 and 4.1.11 output loaded after the
// library (fixtures/tailwind*.css, unmodified CLI output for `bg-red-500`), every property the
// library's rules declare on an element of a migrated component keeps the computed value it has
// without Tailwind. Properties the library leaves to the page (body margin, inherited line-height,
// the browser's button font size) are Tailwind's to reset. The one known conflict, Tailwind ≤3.3
// preflight clearing the background of `button[type=button]`, is pinned below.
import { expect, test, type Page } from "@playwright/test";
import { migrated, openMigrated, type MigratedComponent } from "./bench/migrated";

// For every stable-class element, keyed by class and index: the computed value of each property
// that a library rule matching it at rest declares. Transitions are finished first.
const snapshot = (page: Page, component: MigratedComponent) =>
  page.evaluate((classes) => {
    // Match the pilot Button's untyped fixture. Radix and Chips default to type="button";
    // exercise that separate, documented <=3.3 conflict in the typed-button cases below.
    for (const button of document.querySelectorAll('#root button[type="button"]'))
      button.removeAttribute("type");
    const libraryRules: CSSStyleRule[] = [];
    const visit = (rules: CSSRuleList) => {
      for (const rule of rules) {
        if (rule instanceof CSSStyleRule) libraryRules.push(rule);
        else if (rule instanceof CSSMediaRule) {
          if (matchMedia(rule.conditionText).matches) visit(rule.cssRules);
        } else if (rule instanceof CSSGroupingRule) visit(rule.cssRules);
      }
    };
    visit((document.getElementById("_goober") as HTMLStyleElement).sheet!.cssRules);
    const matches = (el: Element, selector: string) => {
      try {
        return el.matches(selector);
      } catch {
        return false; // pseudo-elements
      }
    };
    return Object.fromEntries(
      classes.flatMap((className) =>
        [...document.querySelectorAll(`#root .${className}`)].map((el, i) => {
          el.getAnimations().forEach((animation) => animation.finish());
          // Later matching rules win, as in the cascade (all library rules weigh the same here).
          const declared = new Map<string, string>();
          for (const rule of libraryRules.filter((rule) => matches(el, rule.selectorText)))
            for (const property of rule.style)
              declared.set(property, rule.style.getPropertyValue(property));
          const style = getComputedStyle(el);
          return [
            `${className} #${i}`,
            Object.fromEntries(
              [...declared].sort().map(([property, value]) => [
                property,
                // A percentage size resolves against layout the page owns (a reset's table
                // border-collapse changes the pixels), so compare the declaration itself.
                value.includes("%") && /(^|-)(width|height)$/.test(property)
                  ? `declared ${value}`
                  : style.getPropertyValue(property),
              ]),
            ),
          ];
        }),
      ),
    );
  }, component.stableClasses);

const tailwind = (version: string) => `<link rel="stylesheet" href="/tailwind${version}.css">`;

for (const component of migrated) {
  test.describe(component.folder, () => {
    for (const version of ["33", "34", "4"]) {
      test(`Tailwind ${version === "4" ? "4.1" : `3.${version[1]}`} preflight leaves it styled`, async ({
        page,
      }) => {
        await openMigrated(page, component);
        const plain = await snapshot(page, component);
        expect(Object.keys(plain).length).toBeGreaterThan(0);
        await openMigrated(page, component, tailwind(version));
        expect(await snapshot(page, component)).toEqual(plain);
      });
    }

    // Tailwind <=3.3's [type='button'] ties a base class and loads later. A library class plus
    // a matching state (:disabled, [data-state], [aria-selected], ...) outweighs that reset.
    // Exercise both sets of real buttons; 3.4 and 4.1 scope the reset with :where().
    const typedBackgrounds = async (page: Page, head = "") => {
      await openMigrated(page, component, head);
      await page.evaluate(() => {
        for (const button of document.querySelectorAll("#root button"))
          button.setAttribute("type", "button");
      });
      // Buttons transition their background; read the end value.
      return page.evaluate(() => {
        const stateBackgrounds: CSSStyleRule[] = [];
        const visit = (rules: CSSRuleList) => {
          for (const rule of rules) {
            if (rule instanceof CSSStyleRule) {
              if (/^\.go\d+(?=:|\[)/.test(rule.selectorText) && rule.style.backgroundColor)
                stateBackgrounds.push(rule);
            } else if (rule instanceof CSSMediaRule) {
              if (matchMedia(rule.conditionText).matches) visit(rule.cssRules);
            } else if (rule instanceof CSSGroupingRule) visit(rule.cssRules);
          }
        };
        visit((document.getElementById("_goober") as HTMLStyleElement).sheet!.cssRules);
        return [...document.querySelectorAll("#root button")].map((button) => {
          button.getAnimations().forEach((animation) => animation.finish());
          return {
            background: getComputedStyle(button).backgroundColor,
            stateBackground: stateBackgrounds.some((rule) => button.matches(rule.selectorText)),
          };
        });
      });
    };

    test("Tailwind 3.3 preflight clears the background of type=button buttons", async ({
      page,
    }) => {
      const plain = (await typedBackgrounds(page)).filter((button) => !button.stateBackground);
      test.skip(
        !plain.some(({ background }) => background !== "rgba(0, 0, 0, 0)"),
        `${component.folder} renders no class-level <button> background to clear`,
      );
      const reset = (await typedBackgrounds(page, tailwind("33")))
        .filter((button) => !button.stateBackground)
        .map(({ background }) => background);
      expect(reset).toHaveLength(plain.length);
      expect(new Set(reset)).toEqual(new Set(["rgba(0, 0, 0, 0)"]));
    });

    test("Tailwind 3.3 preflight keeps state backgrounds of type=button buttons", async ({
      page,
    }) => {
      const plain = (await typedBackgrounds(page)).filter((button) => button.stateBackground);
      test.skip(
        plain.length === 0,
        `${component.folder} renders no state background on a <button>`,
      );
      expect(
        (await typedBackgrounds(page, tailwind("33"))).filter((button) => button.stateBackground),
      ).toEqual(plain);
    });

    for (const version of ["34", "4"]) {
      test(`Tailwind ${version === "4" ? "4.1" : "3.4"} preflight keeps the background of type=button buttons`, async ({
        page,
      }) => {
        const plain = await typedBackgrounds(page);
        test.skip(plain.length === 0, `${component.folder} renders no <button>`);
        expect(await typedBackgrounds(page, tailwind(version))).toEqual(plain);
      });
    }
  });
}

// Markdown prose has no stable class per element, so the matrix above does not cover it. Its
// rules weigh one class plus the tag, above Tailwind 3's unlayered element preflight, so list
// markers and padding, quote margins and strong weight survive every version.
test.describe("MarkDownRenderer prose", () => {
  const markdown = migrated.find((component) => component.folder === "MarkDownRenderer")!;
  const prose = (page: Page) =>
    page.evaluate(() => {
      const root = document.querySelector("#root .openui-markdown-renderer")!;
      const read = (selector: string, properties: string[]) => {
        const style = getComputedStyle(root.querySelector(selector)!);
        return Object.fromEntries(properties.map((name) => [name, style.getPropertyValue(name)]));
      };
      return {
        ul: read("ul", ["list-style-type", "padding-left", "margin-bottom"]),
        ol: read("ol", ["list-style-type", "padding-left", "margin-bottom"]),
        blockquote: read("blockquote", ["margin-top", "margin-bottom", "margin-left"]),
        strong: read("p strong", ["font-weight"]),
        h1: read("h1", ["font-size", "font-weight", "margin-bottom"]),
      };
    });

  for (const version of ["33", "34", "4"]) {
    test(`Tailwind ${version === "4" ? "4.1" : `3.${version[1]}`} preflight leaves prose styled`, async ({
      page,
    }) => {
      await openMigrated(page, markdown);
      const plain = await prose(page);
      expect(plain.ul["list-style-type"]).toBe("disc");
      await openMigrated(page, markdown, tailwind(version));
      expect(await prose(page)).toEqual(plain);
    });
  }
});
