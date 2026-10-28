// Tailwind reset matrix: with real Tailwind 3.3.7, 3.4.17 and 4.1.11 output loaded after the
// library (fixtures/tailwind*.css, unmodified CLI output for `bg-red-500`), every element of every
// migrated component keeps the computed styles it has without Tailwind. The one known conflict,
// Tailwind ≤3.3 preflight clearing the background of `button[type=button]`, is pinned below.
import { expect, test, type Page } from "@playwright/test";
import { migrated, openMigrated, type MigratedComponent } from "./bench/migrated";

const PROPERTIES = [
  "color",
  "background-color",
  "border-top-width",
  "border-top-style",
  "border-top-color",
  "border-top-left-radius",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "margin-top",
  "font-size",
  "font-weight",
  "line-height",
  "letter-spacing",
  "display",
  "gap",
  "box-shadow",
  "width",
  "height",
];

// Computed styles of every stable-class element, keyed by class and index, transitions finished.
const snapshot = (page: Page, component: MigratedComponent) =>
  page.evaluate(
    ({ classes, properties }) =>
      Object.fromEntries(
        classes.flatMap((className) =>
          [...document.querySelectorAll(`#root .${className}`)].map((el, i) => {
            el.getAnimations().forEach((animation) => animation.finish());
            const style = getComputedStyle(el);
            const values = Object.fromEntries(
              properties.map((p) => [p, style.getPropertyValue(p)]),
            );
            // A zero-width border is invisible whatever its style and colour; Tailwind's
            // universal `border: 0 solid` reset changes those on elements the library leaves
            // borderless.
            if (values["border-top-width"] === "0px") {
              delete values["border-top-style"];
              delete values["border-top-color"];
            }
            return [`${className} #${i}`, values];
          }),
        ),
      ),
    { classes: component.stableClasses, properties: PROPERTIES },
  );

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

    // Buttons with type="button": Tailwind ≤3.3 preflight's `[type='button']` rule weighs as much
    // as a library class and loads later, so it clears their background. That is the known
    // conflict documented in the README; 3.4 and 4.1 scope the rule with :where() and do not.
    const typedBackgrounds = async (page: Page, head = "") => {
      await openMigrated(page, component, head);
      await page.evaluate(() => {
        for (const button of document.querySelectorAll("#root button"))
          button.setAttribute("type", "button");
      });
      // Buttons transition their background; read the end value.
      return page.evaluate(() =>
        [...document.querySelectorAll("#root button")].map((button) => {
          button.getAnimations().forEach((animation) => animation.finish());
          return getComputedStyle(button).backgroundColor;
        }),
      );
    };

    test("Tailwind 3.3 preflight clears the background of type=button buttons", async ({
      page,
    }) => {
      const plain = await typedBackgrounds(page);
      test.skip(plain.length === 0, `${component.folder} renders no <button>`);
      expect(plain.some((background) => background !== "rgba(0, 0, 0, 0)")).toBe(true);
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
