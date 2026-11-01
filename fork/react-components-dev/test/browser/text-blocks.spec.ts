import { expect, test, type Page } from "@playwright/test";
const textFamilies = [
  "text-block",
  "text-callout",
  "callout",
  "text-content",
  "text-content-wrapper",
  "inline-header",
  "icon-text",
  "icon-tag",
  "tag",
  "tag-block",
  "separator",
] as const;
type TextFamily = (typeof textFamilies)[number];

const properties = {
  color: "rgb(1, 2, 3)",
  "background-color": "rgb(4, 5, 6)",
  "padding-top": "7px",
  "border-left-color": "rgb(11, 12, 13)",
};
const declarations = Object.entries(properties)
  .map(([key, value]) => `${key}:${value};`)
  .join("");
const open = async (page: Page, family: TextFamily, layer: string, head = "", mode = "light") => {
  await page.route("**/text-blocks.html?*", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><html><head>${head}</head><body><div id="root"></div><script type="module" src="/text-blocks.js"></script></body></html>`,
    }),
  );
  await page.goto(
    `/text-blocks.html?family=${family}&mode=${mode}${layer ? `&layer=${layer}` : ""}`,
  );
  await expect(page.locator("[data-parity-case]").first()).toBeVisible();
};

for (const family of textFamilies) {
  for (const layer of ["", "openui"]) {
    for (const order of ["before", "after"] as const) {
      test(`${family}: every owned class overrides ${order} the library (${layer || "default"})`, async ({
        page,
      }) => {
        await open(page, family, layer);
        // Observe documented public classes on the consumer-rendered DOM. The generic bench
        // independently verifies the complete names inventory from the package reference.
        const names = await page
          .locator("#root")
          .evaluate(
            (root, family) => [
              ...new Set(
                [...root.querySelectorAll("[class]")]
                  .flatMap((el) => [...el.classList])
                  .filter(
                    (name) => name === `openui-${family}` || name.startsWith(`openui-${family}-`),
                  ),
              ),
            ],
            family,
          );
        expect(names.length).toBeGreaterThan(0);
        // Match the structural/dismiss/mode state where the library uses it.
        const animation = family === "callout" ? "animation:none;" : "";
        const rules = names
          .map(
            (name) =>
              `.${name},.${name}[data-clamped],.${name}[data-mode="dark"],.${name}[data-autodismiss] {${declarations}${animation}}`,
          )
          .join("\n");
        if (order === "before") await open(page, family, layer, `<style>${rules}</style>`);
        else await page.addStyleTag({ content: rules });
        // Change html classes after rendering: component CSS must stay active.
        await page.evaluate(() => {
          document.documentElement.className = "consumer-replaced-html";
        });
        for (const name of names) {
          const actual = await page
            .locator(`.${name}`)
            .evaluateAll(
              (elements, keys) =>
                elements.map((el) =>
                  Object.fromEntries(
                    keys.map((key) => [key, getComputedStyle(el).getPropertyValue(key)]),
                  ),
                ),
              Object.keys(properties),
            );
          expect(actual.length, name).toBeGreaterThan(0);
          for (const value of actual) expect(value, name).toEqual(properties);
        }
      });
    }
  }
}

test("TextBlock clamp and owned IconTag SVG sizes remain consumer overridable", async ({
  page,
}) => {
  await open(page, "text-block", "");
  const clamped = page.locator(".openui-text-block-secondary[data-clamped]").first();
  await expect(clamped).toHaveCSS("-webkit-line-clamp", "2");
  await page.addStyleTag({
    content:
      ".openui-text-block-secondary[data-clamped] {display:block; overflow:visible; -webkit-line-clamp:unset;}",
  });
  await expect(clamped).toHaveCSS("display", "block");
  await expect(clamped).toHaveCSS("overflow", "visible");
  await open(page, "icon-tag", "openui");
  await expect(page.locator(".openui-icon-tag--size-xs svg").first()).toHaveCSS("width", "12px");
  await expect(page.locator(".openui-icon-tag--size-xl svg").first()).toHaveCSS("width", "16px");
  await page.addStyleTag({ content: ".openui-icon-tag-icon {width:21px; height:22px;}" });
  await expect(page.locator(".openui-icon-tag-icon").first()).toHaveCSS("width", "21px");
});

test("Callout duration still fades and collapses in layer mode", async ({ page }) => {
  await open(page, "callout", "openui");
  const callout = page.locator(".openui-callout[data-autodismiss]").first();
  await expect(callout).toBeVisible();
  const states = await callout.evaluate((el) => {
    const animation = el.getAnimations()[0]!;
    animation.pause();
    animation.currentTime = 60_000;
    const start = getComputedStyle(el).opacity;
    animation.currentTime = 60_400;
    const end = getComputedStyle(el);
    return { start, opacity: end.opacity, maxHeight: end.maxHeight };
  });
  expect(states).toEqual({ start: "1", opacity: "0", maxHeight: "0px" });
});

test("TextBlock headings reset inherited font variation", async ({ page }) => {
  await open(page, "text-block", "", '<style>body {font-variation-settings:"wght" 300;}</style>');
  for (const variant of ["title-text", "number-title-text"]) {
    const heading = page.locator(`[data-case="${variant}/md/text"] .openui-text-block-primary`);
    await expect(heading).toHaveCSS("font-variation-settings", "normal");
  }
});

for (const mode of ["light", "dark"] as const) {
  for (const layer of ["", "openui"]) {
    test(`IconText keeps TextBlock typography (${mode}, ${layer || "default"})`, async ({
      page,
    }) => {
      await open(page, "icon-text", layer, "", mode);
      const regularVariation = `"wght" ${mode === "dark" ? 420 : 440}`;
      for (const layout of ["horizontal", "vertical"]) {
        for (const bold of [false, true]) {
          const root = page.locator(`[data-case="${layout}/neutral/${bold}"]`);
          // #72's TextBlock size/variant rules win over IconText's horizontal font rule.
          // Check both the public part and the inner markdown content that inherits its font.
          for (const part of ["primary", "secondary"]) {
            const text = root.locator(`.openui-text-block-${part}`);
            const heavy = part === "primary" && bold;
            for (const element of [
              text,
              text.locator(".openui-inline-markdown-renderer-content"),
            ]) {
              await expect(element).toHaveCSS("font-weight", heavy ? "560" : "400");
              await expect(element).toHaveCSS(
                "font-variation-settings",
                heavy ? '"wght" 560' : regularVariation,
              );
              await expect(element).toHaveCSS(
                "font-size",
                part === "primary" && layout === "vertical" ? "16px" : "14px",
              );
            }
          }
        }
      }
    });
  }
}

for (const family of textFamilies) {
  for (const layer of ["", "openui"]) {
    test(`${family}: library styles survive html class replacement (${layer || "default"})`, async ({
      page,
    }) => {
      await open(page, family, layer);
      const snapshot = () =>
        page.locator("#root").evaluate((root, family) => {
          const properties = [
            "display",
            "color",
            "background-color",
            "font-size",
            "font-weight",
            "font-variation-settings",
            "line-height",
            "padding",
            "gap",
            "border-left-color",
            "width",
            "height",
          ];
          return [...root.querySelectorAll("[class]")]
            .filter((el) =>
              [...el.classList].some(
                (name) => name === `openui-${family}` || name.startsWith(`openui-${family}-`),
              ),
            )
            .map((el) => {
              el.getAnimations().forEach((animation) => animation.finish());
              const style = getComputedStyle(el);
              return Object.fromEntries(
                properties.map((key) => [key, style.getPropertyValue(key)]),
              );
            });
        }, family);
      const before = await snapshot();
      expect(before.length).toBeGreaterThan(0);
      await page.evaluate(() => {
        document.documentElement.className = "host-replaced-html";
      });
      expect(await snapshot()).toEqual(before);
    });
  }
}

for (const mode of ["light", "dark"]) {
  for (const layer of ["", "openui"]) {
    test(`TextBlock secondary tones win over the base colour (${mode}, ${layer || "default"})`, async ({
      page,
    }) => {
      await open(page, "text-block", layer, "", mode);
      await page.addStyleTag({
        content: `.openui-text-block {
          --openui-text-neutral-secondary: rgb(1, 2, 3);
          --openui-text-success-primary: rgb(4, 5, 6);
          --openui-text-danger-primary: rgb(7, 8, 9);
        }`,
      });
      for (const [tone, color] of [
        ["positive", "rgb(4, 5, 6)"],
        ["negative", "rgb(7, 8, 9)"],
      ]) {
        const secondary = page.locator(`.openui-text-block-secondary--secondary-tone-${tone}`);
        expect(await secondary.count()).toBe(3);
        for (const element of await secondary.all())
          await expect(element).toHaveCSS("color", color!);
      }
    });
  }
}
