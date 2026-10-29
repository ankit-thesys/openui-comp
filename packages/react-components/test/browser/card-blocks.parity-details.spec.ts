// Supplements the standard #72 snapshots with responsive geometry, masks and pseudo-elements.
// Requires the #72 fixture bundles produced by test:parity:baseline; no JSON is synthesized here.
import { expect, test, type Page } from "@playwright/test";
const extra = [
  "background-image",
  "background-size",
  "background-position",
  "mask-image",
  "grid-template-columns",
  "grid-column",
  "min-width",
  "min-height",
  "overflow",
  "white-space",
  "text-overflow",
  "justify-content",
  "flex-direction",
  "backdrop-filter",
  "transform",
  "position",
  "z-index",
  "font-style",
];
async function details(page: Page, family: string, baseline: boolean, mode: string) {
  await page.goto(`/parity-${family}${baseline ? "-baseline" : ""}.html?mode=${mode}`);
  await expect(page.locator("[data-parity-case]").first()).toBeVisible();
  await page.waitForFunction(() => [...document.images].every((image) => image.complete));
  const cases = page.locator("[data-parity-case]");
  return cases.evaluateAll(
    (cases, properties) =>
      Object.fromEntries(
        cases.map((root) => {
          const named = JSON.parse(root.getAttribute("data-parity-parts") ?? "{}") as Record<
            string,
            string
          >;
          const records: Record<string, string[]> = {};
          for (const [name, selector] of Object.entries(named)) {
            const element = root.querySelector(selector);
            if (!element) continue;
            element.getAnimations().forEach((animation) => animation.finish());
            const style = getComputedStyle(element);
            records[name] = properties.map((property) => style.getPropertyValue(property));
            if (name === "card")
              for (const pseudo of ["::before", "::after"]) {
                const style = getComputedStyle(element, pseudo);
                if (["none", "normal"].includes(style.content)) continue;
                records[`${name}${pseudo}`] = [
                  "content",
                  "background-image",
                  "background-color",
                  "transform",
                  "position",
                  "z-index",
                ].map((property) => style.getPropertyValue(property));
              }
          }
          return [root.getAttribute("data-parity-case"), records];
        }),
      ),
    extra,
  );
}
for (const mode of ["light", "dark"])
  for (const family of [
    "card-block-layout",
    "composite-card-block",
    "context-card-block",
    "visual-card-block",
    "snippet-card-block",
    "option-cards",
  ]) {
    test(`${family} additional #72 geometry and image styles in ${mode}`, async ({ page }) => {
      test.setTimeout(180_000);
      const baseline = await details(page, family, true, mode);
      expect(await details(page, family, false, mode)).toEqual(baseline);
    });
  }
for (const layer of ["", "openui"])
  test(`carousel masks follow scroll position and stay overridable in ${layer || "default"} mode`, async ({
    page,
  }) => {
    await page.goto(`/card-blocks.html?family=card-block-layout&layer=${layer}`);
    const carousel = page.locator(
      '[data-parity-case="context/carousel/true/360/5"] .openui-card-block-layout-carousel',
    );
    await expect(carousel).toHaveAttribute("data-mask", "right");
    await carousel.evaluate((el) => {
      el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    });
    await expect(carousel).toHaveAttribute("data-mask", "both");
    await carousel.evaluate((el) => {
      el.scrollLeft = el.scrollWidth;
    });
    await expect(carousel).toHaveAttribute("data-mask", "left");
    await carousel.evaluate((el) => {
      el.scrollLeft = 0;
    });
    await expect(carousel).toHaveAttribute("data-mask", "right");
    const rules = ["right", "both", "left"]
      .map(
        (mask) =>
          `.openui-card-block-layout-carousel[data-mask="${mask}"]{mask-image:none;-webkit-mask-image:none}`,
      )
      .join("\n");
    await page.addStyleTag({ content: rules });
    await expect(carousel).toHaveCSS("mask-image", "none");
    await carousel.evaluate((el) => {
      el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    });
    await expect(carousel).toHaveAttribute("data-mask", "both");
    await expect(carousel).toHaveCSS("mask-image", "none");
  });

for (const family of [
  "composite-card-block",
  "context-card-block",
  "visual-card-block",
  "overview-card-block",
  "snippet-card-block",
])
  test(`${family} hover and image zoom preserve #72`, async ({ page }) => {
    const measure = async (baseline: boolean) => {
      await page.goto(`/parity-${family}${baseline ? "-baseline" : ""}.html`);
      const card = page.locator('[data-parity-case] [role="button"]').first();
      await card.hover();
      return card.evaluate((element) => {
        document.getAnimations().forEach((animation) => animation.finish());
        return {
          transform: getComputedStyle(element).transform,
          shadow: getComputedStyle(element).boxShadow,
          image: getComputedStyle(element, "::before").transform,
        };
      });
    };
    const baseline = await measure(true);
    expect(await measure(false)).toEqual(baseline);
  });
