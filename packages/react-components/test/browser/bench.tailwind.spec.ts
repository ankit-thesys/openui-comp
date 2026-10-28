// Tailwind reset matrix: with real Tailwind 3.3.7, 3.4.17 and 4.1.11 output loaded after the
// library (fixtures/tailwind*.css, unmodified CLI output for `bg-red-500`), every property the
// library's rules declare on an element of a migrated component keeps the computed value it has
// without Tailwind. Properties the library leaves to the page (body margin, inherited line-height,
// the browser's button font size) are Tailwind's to reset. The ordinary matrix uses untyped
// buttons; Tailwind ≤3.3's typed-button base background conflict is pinned separately below.
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
              [...declared].sort().map(([property, value]) => {
                // #95's inline reset deliberately inherits caller typography. Verify that
                // relationship, not the page-owned font Tailwind changes on html/body.
                if (
                  className === "openui-inline-markdown-renderer-content" &&
                  value.trim() === "inherit"
                ) {
                  const parent = getComputedStyle(el.parentElement!);
                  if (style.getPropertyValue(property) !== parent.getPropertyValue(property))
                    throw new Error(`Inline markdown no longer inherits ${property}`);
                  return [property, "inherits from parent"];
                }
                return [
                  property,
                  // A percentage size resolves against layout the page owns (a reset's table
                  // border-collapse changes the pixels), so compare the declaration itself.
                  value.includes("%") && /(^|-)(width|height)$/.test(property)
                    ? `declared ${value}`
                    : style.getPropertyValue(property),
                ];
              }),
            ),
          ];
        }),
      ),
    );
  }, component.stableClasses);

const tailwind = (version: string) => `<link rel="stylesheet" href="/tailwind${version}.css">`;

// Tailwind 3.3's [type='button'] ties a single class, but cannot beat a class plus state
// (EditableTable's open select, for example). Read the actual matching rules, including portal
// buttons, so the typed test pins both the base reset and the stronger backgrounds that survive.
const buttonBackgrounds = (page: Page) =>
  page.evaluate(() => {
    const backgroundRules: CSSStyleRule[] = [];
    const visit = (rules: CSSRuleList) => {
      for (const rule of rules) {
        if (rule instanceof CSSStyleRule) {
          // A shorthand containing var() can leave the CSSOM longhand empty until computed.
          if (
            rule.style.getPropertyValue("background-color") ||
            rule.style.getPropertyValue("background")
          )
            backgroundRules.push(rule);
        } else if (rule instanceof CSSMediaRule) {
          if (matchMedia(rule.conditionText).matches) visit(rule.cssRules);
        } else if (rule instanceof CSSGroupingRule) visit(rule.cssRules);
      }
    };
    visit((document.getElementById("_goober") as HTMLStyleElement).sheet!.cssRules);
    return [...document.querySelectorAll("button")].map((button) => {
      button.getAnimations().forEach((animation) => animation.finish());
      const matching = backgroundRules.filter((rule) => {
        try {
          return button.matches(rule.selectorText);
        } catch {
          return false; // pseudo-elements
        }
      });
      return {
        color: getComputedStyle(button).backgroundColor,
        // Flat base rules have exactly one generated class. A matching stronger rule must
        // retain its exact plain color; it is never covered by the typed-button exception.
        resets:
          matching.length > 0 && matching.every((rule) => /^\.go\d+$/.test(rule.selectorText)),
      };
    });
  });

for (const component of migrated) {
  test.describe(component.folder, () => {
    for (const version of ["33", "34", "4"]) {
      test(`Tailwind ${version === "4" ? "4.1" : `3.${version[1]}`} preflight leaves it styled`, async ({
        page,
      }) => {
        await openMigrated(page, component);
        // Radix adds type="button" itself. Normalize only the ordinary matrix, as the pilot
        // Button fixture does; the dedicated typed cases below exercise real typed buttons.
        const untypeButtons = () =>
          page.evaluate(() => {
            for (const button of document.querySelectorAll("button"))
              button.removeAttribute("type");
          });
        await untypeButtons();
        const plain = await snapshot(page, component);
        expect(Object.keys(plain).length).toBeGreaterThan(0);
        await openMigrated(page, component, tailwind(version));
        await untypeButtons();
        expect(await snapshot(page, component)).toEqual(plain);
      });
    }

    // Buttons with type="button": Tailwind ≤3.3 preflight's `[type='button']` rule weighs as much
    // as a library base class and loads later, so it clears base backgrounds. State backgrounds
    // outweigh it. 3.4 and 4.1 scope the preflight rule with :where() and clear neither.
    const typedBackgrounds = async (page: Page, head = "") => {
      await openMigrated(page, component, head);
      await page.evaluate(() => {
        for (const button of document.querySelectorAll("button"))
          button.setAttribute("type", "button");
      });
      return buttonBackgrounds(page);
    };

    test("Tailwind 3.3 preflight clears the background of type=button buttons", async ({
      page,
    }) => {
      const plain = await typedBackgrounds(page);
      test.skip(
        !plain.some(({ color, resets }) => resets && color !== "rgba(0, 0, 0, 0)"),
        `${component.folder} renders no <button> with a base background to clear`,
      );
      expect((await typedBackgrounds(page, tailwind("33"))).map(({ color }) => color)).toEqual(
        plain.map(({ color, resets }) => (resets ? "rgba(0, 0, 0, 0)" : color)),
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
