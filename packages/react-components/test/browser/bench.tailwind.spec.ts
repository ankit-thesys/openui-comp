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
        [...document.querySelectorAll(`.${className}`)].map((el, i) => {
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
        // #93: check each portal variant with only one modal open at a time.
        const targets =
          component.folder === "Calendar"
            ? ["openui-calendar-select-content-months", "openui-calendar-select-content-years"]
            : component.folder === "Select"
              ? [
                  ...["sm", "md", "lg"].map((size) => `openui-select-content--size-${size}`),
                  "openui-select-content--position-item-aligned",
                ]
              : [""];
        for (const target of targets) {
          await openMigrated(page, component, "", target);
          const plain = await snapshot(page, component);
          expect(Object.keys(plain).length).toBeGreaterThan(0);
          await openMigrated(page, component, tailwind(version), target);
          expect(await snapshot(page, component)).toEqual(plain);
        }
      });
    }

    // Buttons with type="button": Tailwind ≤3.3 preflight's `[type='button']` rule weighs as much
    // as a library class and loads later, so it clears their background. That is the known
    // conflict documented in the README; 3.4 and 4.1 scope the rule with :where() and do not.
    const typedBackgrounds = async (page: Page, head = "") => {
      // This known conflict concerns base backgrounds. Keep portals closed so a trigger's
      // higher-specificity open/hover state is not mistaken for a base background.
      await openMigrated(page, component, head, "", false);
      await page.evaluate(() => {
        for (const button of document.querySelectorAll("button"))
          button.setAttribute("type", "button");
      });
      // Only backgrounds declared by a base library rule belong to this known-conflict case.
      // Calendar's hidden navigation buttons have a UA background; that is Preflight's to reset.
      return page.evaluate(() => {
        const backgrounds: CSSStyleRule[] = [];
        const visit = (rules: CSSRuleList) => {
          for (const rule of rules) {
            if (
              rule instanceof CSSStyleRule &&
              /^\.go\d+$/.test(rule.selectorText) &&
              (rule.style.background || rule.style.backgroundColor)
            )
              backgrounds.push(rule);
            else if (rule instanceof CSSGroupingRule) visit(rule.cssRules);
          }
        };
        visit((document.getElementById("_goober") as HTMLStyleElement).sheet!.cssRules);
        return [...document.querySelectorAll("button")]
          .filter((button) => backgrounds.some((rule) => button.matches(rule.selectorText)))
          .map((button) => {
            button.getAnimations().forEach((animation) => animation.finish());
            return getComputedStyle(button).backgroundColor;
          });
      });
    };

    test("Tailwind 3.3 preflight clears the background of type=button buttons", async ({
      page,
    }) => {
      const plain = await typedBackgrounds(page);
      test.skip(
        !plain.some((background) => background !== "rgba(0, 0, 0, 0)"),
        `${component.folder} renders no <button> with a background to clear`,
      );
      expect(new Set(await typedBackgrounds(page, tailwind("33")))).toEqual(
        new Set(["rgba(0, 0, 0, 0)"]),
      );
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
