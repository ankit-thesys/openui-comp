// Tailwind reset matrix: with real Tailwind 3.3.7, 3.4.17 and 4.1.11 output loaded after the
// library (fixtures/tailwind*.css, unmodified CLI output for `bg-red-500`), every property the
// library's rules declare on an element of a migrated component keeps the computed value it has
// without Tailwind. Properties the library leaves to the page (body margin, inherited line-height,
// the browser's button font size) are Tailwind's to reset. The ordinary matrix uses untyped
// buttons; Tailwind ≤3.3's typed-button base background conflict is pinned separately below.
import { expect, test, type Page } from "@playwright/test";
import { migrated, openMigrated, type MigratedComponent } from "./bench/migrated";
import { snapshotDeclaredStyles } from "./bench/snapshot";

// For every stable-class element, keyed by class and index: the computed value of each property
// that a library rule matching it at rest declares. Transitions are finished first.
const snapshot = (page: Page, component: MigratedComponent) =>
  page.evaluate(snapshotDeclaredStyles, component.stableClasses);

// Exercise the ordinary class contract on untyped buttons, like the Button fixture. The
// separate typed-button matrix below retains the documented Tailwind <=3.3 conflict.
const untypeButtons = (page: Page) =>
  page.locator("button").evaluateAll((buttons) => {
    for (const button of buttons) button.removeAttribute("type");
  });

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
    visit((document.getElementById("openui-styles") as HTMLStyleElement).sheet!.cssRules);
    return [...document.querySelectorAll("button")].flatMap((button) => {
      button.getAnimations().forEach((animation) => {
        if (animation.effect?.getTiming().iterations === Infinity) {
          animation.pause();
          animation.currentTime = 0;
        } else animation.finish();
      });
      const matching = backgroundRules.filter((rule) => {
        try {
          return button.matches(rule.selectorText);
        } catch {
          return false; // pseudo-elements
        }
      });
      if (matching.length === 0) return []; // UA backgrounds belong to Preflight.
      return [
        {
          color: getComputedStyle(button).backgroundColor,
          stateBackground: matching.some((rule) => !/^\.go\d+$/.test(rule.selectorText)),
          // Flat base rules have exactly one generated class. A matching stronger rule must
          // retain its exact plain color; it is never covered by the typed-button exception.
          resets:
            matching.length > 0 && matching.every((rule) => /^\.go\d+$/.test(rule.selectorText)),
        },
      ];
    });
  });

for (const component of migrated) {
  test.describe(component.folder, () => {
    if (component.folder === "DotMatrixLoader") {
      // RAF trails are not Web Animations: compare the initial dot opacity in both pages.
      // loading-code.spec.ts separately checks that the trail moves and stays overridable.
      test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => {
          window.requestAnimationFrame = () => 0;
        });
      });
    }
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
          await untypeButtons(page);
          const plain = await snapshot(page, component);
          expect(Object.keys(plain).length).toBeGreaterThan(0);
          if (component.folder === "Charts")
            for (const name of component.stableClasses.filter((name) =>
              name.startsWith("openui-chart-tooltip"),
            ))
              expect(Object.keys(plain).some((key) => key.startsWith(`${name} #`))).toBe(true);
          await openMigrated(page, component, tailwind(version), target);
          await untypeButtons(page);
          expect(await snapshot(page, component)).toEqual(plain);
        }
      });
    }

    // Buttons with type="button": Tailwind ≤3.3 preflight's `[type='button']` rule weighs as much
    // as a library base class and loads later, so it clears base backgrounds. State backgrounds
    // outweigh it. 3.4 and 4.1 scope the preflight rule with :where() and clear neither.
    const typedBackgrounds = async (page: Page, head = "") => {
      // This known conflict concerns base backgrounds. Keep portals closed so a trigger's
      // higher-specificity open/hover state is not mistaken for a base background.
      await openMigrated(page, component, head, "", false);
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
      const reset = await typedBackgrounds(page, tailwind("33"));
      const state = plain.filter(({ stateBackground }) => stateBackground);
      // #94: disabled SliderBlock Select triggers keep their stronger :disabled background.
      if (component.folder === "Slider") expect(state.length).toBeGreaterThan(0);
      expect(reset.filter(({ stateBackground }) => stateBackground)).toEqual(state);
      test.skip(
        !plain.some(({ color, resets }) => resets && color !== "rgba(0, 0, 0, 0)"),
        `${component.folder} renders no <button> with a base background to clear`,
      );
      expect(reset.map(({ color }) => color)).toEqual(
        plain.map(({ color, resets }) => (resets ? "rgba(0, 0, 0, 0)" : color)),
      );
      const base = plain.filter(({ resets }) => resets);
      const resetBase = reset.filter(({ resets }) => resets).map(({ color }) => color);
      expect(resetBase).toHaveLength(base.length);
      expect(new Set(resetBase)).toEqual(new Set(["rgba(0, 0, 0, 0)"]));
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
