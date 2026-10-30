import { expect, test, type Page } from "@playwright/test";

const modalParts = [
  "modal",
  "modal-content",
  "modal-header",
  "modal-heading",
  "modal-main",
  "modal-main-image",
  "modal-carousel-container",
  "modal-carousel",
  "modal-button-container",
  "modal-left-button",
  "modal-right-button",
  "modal-thumbnail",
  "modal-thumbnail-image",
  "modal-close",
  "modal-scroll-left",
  "modal-scroll-right",
  "modal-icon",
].map((part) => `openui-image-gallery-${part}`);
const carouselParts = [
  "openui-carousel-button",
  "openui-carousel-button-left",
  "openui-carousel-button-right",
  "openui-carousel-previous",
  "openui-carousel-next",
  "openui-carousel-content",
  "openui-carousel-content-wrapper",
  "openui-carousel-item",
];
const override = {
  color: "rgb(1, 2, 3)",
  "background-color": "rgb(4, 5, 6)",
  "padding-top": "7px",
  "border-top-color": "rgb(11, 12, 13)",
  "border-radius": "3px",
};
const declarations = Object.entries(override)
  .map(([key, value]) => `${key}:${value};`)
  .join("");
const rules = (classes: string[]) =>
  classes
    .map((name) =>
      [
        "",
        ":hover",
        ":active",
        '[aria-pressed="true"]',
        '[data-mask="both"]',
        '[data-mask="left"]',
        '[data-mask="right"]',
      ]
        .map((state) => `.${name}${state}{${declarations}}`)
        .join("\n"),
    )
    .join("\n");

async function open(page: Page, family: string, layer: boolean, css = "") {
  // The full portal matrix exceeds Node's request-header limit when encoded in the URL.
  // A real stylesheet still loads before the fixture bundle, without truncating coverage.
  if (css)
    await page.route("**/media-consumer.css", (route) =>
      route.fulfill({ contentType: "text/css", body: css }),
    );
  await page.goto(
    `/media.html?family=${family}${layer ? "&layer=openui&recipe=theme,base,openui,components,utilities" : ""}${css ? "&sheet=media-consumer" : ""}`,
    { waitUntil: family === "image-block" ? "domcontentloaded" : "load" },
  );
}
async function portal(page: Page) {
  await page.locator(".openui-image-gallery-image").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  const track = page.locator(".openui-image-gallery-modal-carousel");
  await track.evaluate((el) => {
    // The component uses smooth scrolling. Set up a stable middle position before
    // interacting, rather than returning while the thumbnails are still moving.
    el.scrollTo({ left: 100, behavior: "instant" });
  });
  await expect(page.getByRole("button", { name: "Scroll images left" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Scroll images right" })).toBeVisible();
}
async function middle(page: Page) {
  await page.locator(".openui-carousel-content").evaluateAll((els) =>
    els.forEach((el) => {
      el.scrollLeft = 300;
    }),
  );
  await expect(page.locator(".openui-carousel-previous").first()).toBeVisible();
  await expect(page.locator('.openui-carousel-content[data-mask="both"]').first()).toBeVisible();
}
for (const layer of [false, true])
  for (const order of ["before", "after"] as const) {
    for (const family of ["image-gallery-modal", "carousel"] as const) {
      test(`${family} every measured/portal class overrides ${order}, layer=${layer}`, async ({
        page,
      }) => {
        const classes = family === "carousel" ? carouselParts : modalParts;
        const css = rules(classes);
        await open(page, family, layer, order === "before" ? css : "");
        if (family === "carousel") await middle(page);
        else await portal(page);
        if (order === "after") await page.addStyleTag({ content: css });
        for (const name of classes) {
          const elements = page.locator(`.${name}`);
          await expect(elements.first()).toBeAttached();
          const values = await elements.evaluateAll(
            (els, properties) =>
              els.map((el) => {
                el.getAnimations().forEach((a) => a.finish());
                const style = getComputedStyle(el);
                return Object.fromEntries(properties.map((p) => [p, style.getPropertyValue(p)]));
              }),
            Object.keys(override),
          );
          for (const value of values) expect(value, name).toEqual(override);
        }
        await page.evaluate(() => (document.documentElement.className = "consumer-html"));
        await expect(
          page
            .locator(family === "carousel" ? ".openui-carousel" : ".openui-image-gallery-modal")
            .first(),
        ).toHaveCSS("display", "flex");
      });
    }
    test(`image geometry and loading/error defaults override ${order}, layer=${layer}`, async ({
      page,
    }) => {
      const css =
        ".openui-image-aspect {padding-bottom:42px;} .openui-image-viewport {position:relative;} .openui-image {object-fit:contain;}";
      await open(page, "image", layer, order === "before" ? css : "");
      if (order === "after") await page.addStyleTag({ content: css });
      await expect(page.locator(".openui-image-aspect").first()).toHaveCSS(
        "padding-bottom",
        "42px",
      );
      await expect(page.locator(".openui-image-viewport").first()).toHaveCSS(
        "position",
        "relative",
      );
      await expect(page.locator(".openui-image--scale-fill").first()).toHaveCSS(
        "object-fit",
        "contain",
      );
      await page.locator(".openui-image").first().dispatchEvent("error");
      await expect(page.locator(".openui-image[data-error]").first()).toHaveCSS(
        "visibility",
        "hidden",
      );
      await page.addStyleTag({ content: ".openui-image[data-error] {visibility:visible;}" });
      await expect(page.locator(".openui-image[data-error]").first()).toHaveCSS(
        "visibility",
        "visible",
      );
      await page.locator(".openui-image").first().dispatchEvent("load");
      await expect(page.locator(".openui-image").first()).not.toHaveAttribute("data-error");
    });
    test(`custom ImageText size overrides ${order}, layer=${layer}`, async ({ page }) => {
      const css =
        ".openui-image-text-image-container {width:80px;height:80px;} .openui-text-block-primary {font-size:20px;}";
      await open(page, "image-text", layer, order === "before" ? css : "");
      if (order === "after") await page.addStyleTag({ content: css });
      const parts = page.locator(".openui-image-text-image-container");
      for (const part of await parts.all()) {
        await expect(part).toHaveCSS("width", "80px");
        await expect(part).toHaveCSS("height", "80px");
      }
      await expect(page.locator(".openui-text-block-primary").first()).toHaveCSS(
        "font-size",
        "20px",
      );
    });
  }

test("ImageBlock loads, fails, recovers and keeps responsive and spinner parts overridable", async ({
  page,
}) => {
  await page.route("**/media-pending.svg", () => {});
  await open(page, "image-block", false);
  const loading = page.locator('[data-case="loading"] .openui-image-block');
  await expect(loading.locator(".openui-image-block-loader")).toBeVisible();
  await expect(loading).toHaveAttribute("data-loading", "true");
  await expect(loading).toHaveAttribute("data-breakpoint", "mobile");
  const desktop = page.locator('[data-case="desktop-loaded"] .openui-image-block');
  await expect(desktop).not.toHaveAttribute("data-breakpoint", "mobile");
  const before = await loading
    .locator(".openui-image-block-loader")
    .evaluate((el) => getComputedStyle(el).transform);
  await page.waitForTimeout(150);
  expect(
    await loading
      .locator(".openui-image-block-loader")
      .evaluate((el) => getComputedStyle(el).transform),
  ).not.toBe(before);
  await page.addStyleTag({
    content:
      '.openui-image-block-loader {animation:none;width:31px;} .openui-image-block::before {background-image:none;} .openui-image-block[data-breakpoint="mobile"] {padding:9px;}',
  });
  await expect(loading.locator(".openui-image-block-loader")).toHaveCSS("width", "31px");
  await expect(loading).toHaveCSS("padding", "9px");
  expect(await loading.evaluate((el) => getComputedStyle(el, "::before").backgroundImage)).toBe(
    "none",
  );
  const img = loading.locator("img");
  await img.dispatchEvent("error");
  await expect(loading.locator(".openui-image-block-loader")).toHaveCount(0);
  await expect(loading).toHaveAttribute("data-error", "true");
  await page.addStyleTag({
    content:
      ".openui-image-block[data-error], .openui-image-block-image[data-error] {visibility:visible;}",
  });
  await expect(loading).toHaveCSS("visibility", "visible");
  await expect(img).toHaveCSS("visibility", "visible");
  await img.dispatchEvent("load");
  await expect(loading).not.toHaveAttribute("data-error");
});

test("Carousel controls scroll through right, both and left masks", async ({ page }) => {
  await open(page, "carousel", false);
  const root = page.locator(".openui-carousel--show-buttons").first();
  const track = root.locator(".openui-carousel-content");
  await expect(track).toHaveAttribute("data-mask", "right");
  await root.getByRole("button", { name: "Next card" }).click();
  await expect(track).toHaveAttribute("data-mask", "both");
  await track.evaluate((el) => {
    el.scrollLeft = el.scrollWidth;
  });
  await expect(track).toHaveAttribute("data-mask", "left");
  await root.getByRole("button", { name: "Previous card" }).click();
  await expect(track).toHaveAttribute("data-mask", "both");
});

test("gallery thumbnail keyboard selection and portal close preserve behavior", async ({
  page,
}) => {
  await open(page, "image-gallery-modal", false);
  await portal(page);
  const thumb = page.getByRole("button", { name: "Photo 2", exact: true });
  await thumb.focus();
  await page.keyboard.press("Enter");
  await expect(thumb).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".openui-image-gallery-modal-main-image")).toHaveAttribute(
    "alt",
    "Photo 2",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

// Every static media class also participates in both orders and both layer modes, including
// the pending loader and gallery's count-dependent layout states.
for (const family of [
  "image",
  "image-block",
  "image-text",
  "image-text-large",
  "image-gallery",
] as const)
  for (const layer of [false, true])
    for (const order of ["before", "after"] as const)
      test(`${family} every owned class overrides ${order}, layer=${layer}`, async ({ page }) => {
        if (family === "image-block") await page.route("**/media-pending.svg", () => {});
        await open(page, family, layer);
        const classes = await page
          .locator(`[class*="openui-${family}"]`)
          .evaluateAll(
            (els, prefix) => [
              ...new Set(
                els.flatMap((el) =>
                  [...el.classList].filter(
                    (name) => name === prefix || name.startsWith(`${prefix}-`),
                  ),
                ),
              ),
            ],
            `openui-${family}`,
          );
        expect(classes.length).toBeGreaterThan(0);
        const css = classes
          .map((name) =>
            ["", ":hover", '[data-breakpoint="mobile"]']
              .map((state) => `.${name}${state}{${declarations}}`)
              .join("\n"),
          )
          .join("\n");
        if (order === "before") await open(page, family, layer, css);
        else await page.addStyleTag({ content: css });
        for (const name of classes) {
          const els = page.locator(`.${name}`);
          await expect(els.first()).toBeAttached();
          const values = await els.evaluateAll(
            (els, properties) =>
              els.map((el) => {
                el.getAnimations().forEach((a) => {
                  if (a.effect?.getTiming().iterations === Infinity) {
                    a.pause();
                    a.currentTime = 0;
                  } else a.finish();
                });
                const style = getComputedStyle(el);
                return Object.fromEntries(properties.map((p) => [p, style.getPropertyValue(p)]));
              }),
            Object.keys(override),
          );
          for (const value of values) expect(value, name).toEqual(override);
        }
        await page.evaluate(() => (document.documentElement.className = "consumer-html"));
        await expect(page.locator(`.openui-${family}`).first()).toHaveCSS("display", "flex");
      });

for (const layer of [false, true])
  test(`portal emitted CSS keeps the selector and layer budget, layer=${layer}`, async ({
    page,
  }) => {
    await open(page, "image-gallery-modal", layer);
    const before = (await page.locator("#openui-styles").textContent()) ?? "";
    await portal(page);
    const after = (await page.locator("#openui-styles").textContent()) ?? "";
    const { rulesOf, ruleViolation } = await import("../unit/contract/checks");
    const previous = new Set(rulesOf(before).map((rule) => rule.selector));
    const added = rulesOf(after).filter((rule) => !previous.has(rule.selector));
    expect(added.length).toBeGreaterThan(0);
    expect(added.map((rule) => ruleViolation(rule, layer ? "openui" : "")).filter(Boolean)).toEqual(
      [],
    );
    // Photo 1 is clipped at this offset; hovering it scrolls the track again and
    // can move it out from under the pointer. Photo 2 stays clear of both controls.
    const selected = page.getByRole("button", { name: "Photo 2", exact: true });
    await expect(selected).toBeInViewport({ ratio: 1 });
    await selected.click();
    await expect(selected).toHaveAttribute("aria-pressed", "true");
    await page.mouse.move(0, 0);
    await expect(selected).toHaveCSS("opacity", "1");
    await selected.hover();
    await expect(selected).toHaveCSS("opacity", "0.8");
  });

for (const layer of [false, true])
  for (const order of ["before", "after"] as const)
    test(`ImageBlock runtime state overrides ${order}, layer=${layer}`, async ({ page }) => {
      await page.route("**/media-pending.svg", () => {});
      const css =
        ".openui-image-block[data-error], .openui-image-block-image[data-error] {visibility:visible;} .openui-image-block::before {background-image:none;} .openui-image-block-loader {animation:none;width:31px;}";
      await open(page, "image-block", layer, order === "before" ? css : "");
      if (order === "after") await page.addStyleTag({ content: css });
      const root = page.locator('[data-case="loading"] .openui-image-block');
      await expect(root.locator(".openui-image-block-loader")).toHaveCSS("width", "31px");
      expect(await root.evaluate((el) => getComputedStyle(el, "::before").backgroundImage)).toBe(
        "none",
      );
      await root.locator("img").dispatchEvent("error");
      await expect(root).toHaveAttribute("data-error", "true");
      await expect(root).toHaveCSS("visibility", "visible");
      await expect(root.locator("img")).toHaveCSS("visibility", "visible");
    });
