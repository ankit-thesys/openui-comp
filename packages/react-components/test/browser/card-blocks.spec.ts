import { expect, test, type Page } from "@playwright/test";
const families = [
  "composite-card-block",
  "context-card-block",
  "visual-card-block",
  "overview-card-block",
  "snippet-card-block",
  "option-cards",
  "card-block-layout",
];
const css =
  "color:rgb(1,2,3);background-color:rgb(4,5,6);padding:7px 8px 9px 10px;border-color:rgb(11,12,13);";
async function open(page: Page, query: string, before = "") {
  await page.goto(`/card-blocks.html?${query}&css=${encodeURIComponent(before)}`);
  await expect(page.locator(".openui-context-card").first()).toBeVisible();
}
for (const order of ["before", "after"] as const)
  for (const layer of ["", "openui"]) {
    test(`card state overrides win ${order} in ${layer || "default"} mode`, async ({ page }) => {
      const clickable = [
        "composite-card",
        "context-card",
        "visual-card",
        "overview-card-block-card",
        "snippet-card-block-card",
      ];
      const rules =
        clickable
          .flatMap((name) =>
            ["hover", "focus-visible"].map(
              (state) => `.openui-${name}--clickable:${state}{${css}}`,
            ),
          )
          .join("\n") +
        ['[aria-checked="true"]', ":disabled"]
          .map((state) => `.openui-option-cards-card${state}{${css}}`)
          .join("\n");
      await open(page, `layer=${layer}`, order === "before" ? rules : "");
      if (order === "after") await page.addStyleTag({ content: rules });
      for (const name of clickable) {
        const card = page.locator(`.openui-${name}--clickable`).first();
        await card.hover();
        await expect(card).toHaveCSS("background-color", "rgb(4, 5, 6)");
        await expect(card).toHaveCSS("padding-top", "7px");
        await page.mouse.move(0, 0);
        await card.focus();
        await page.keyboard.press("Tab");
        await page.keyboard.press("Shift+Tab");
        await expect(card).toHaveCSS("color", "rgb(1, 2, 3)");
      }
      const radio = page.getByRole("radio", { name: "One First" });
      await radio.click();
      await expect(radio).toHaveAttribute("aria-checked", "true");
      await radio.hover();
      await expect(radio).toHaveCSS("background-color", "rgb(4, 5, 6)");
      await expect(page.getByRole("radio", { name: "Two Second" })).toHaveCSS(
        "color",
        "rgb(1, 2, 3)",
      );
    });
    test(`Snippet tooltip portal overrides win ${order} in ${layer || "default"} mode`, async ({
      page,
    }) => {
      const names = [
        "openui-tooltip-wrapper",
        "openui-tooltip-wrapper-body",
        "openui-tooltip-wrapper-heading",
        "openui-tooltip-wrapper-text",
      ];
      const rules = names.map((name) => `.${name}{${css}}`).join("\n");
      await open(page, `layer=${layer}`, order === "before" ? rules : "");
      if (order === "after") await page.addStyleTag({ content: rules });
      await page.locator("[data-truncated-snippet] .openui-snippet-card-block-lhs").hover();
      const tooltip = page.locator(".openui-tooltip-wrapper");
      await expect(tooltip).toBeVisible();
      expect(await page.locator("#root .openui-tooltip-wrapper").count()).toBe(0);
      for (const name of names) {
        const part = name === names[0] ? tooltip : tooltip.locator(`.${name}`).first();
        await expect(part).toHaveCSS("background-color", "rgb(4, 5, 6)");
      }
    });
    for (const family of families)
      test(`${family} every rendered owned class overrides ${order} in ${layer || "default"} mode`, async ({
        page,
      }) => {
        await open(page, `family=${family}&layer=${layer}`);
        const names = await page.locator("[data-parity-case]").evaluateAll((elements, family) => {
          const names = new Set<string>();
          for (const element of elements)
            for (const node of element.querySelectorAll("[class]"))
              for (const name of node.classList) {
                if (
                  [
                    "openui-card-block-layout",
                    `openui-${family}`,
                    "openui-composite-card",
                    "openui-context-card",
                    "openui-visual-card",
                  ].some((prefix) => name.startsWith(prefix))
                )
                  names.add(name);
              }
          return [...names];
        }, family);
        expect(names.length).toBeGreaterThan(0);
        test.setTimeout(180_000);
        const states = [
          "",
          ":hover",
          ":focus-visible",
          ":disabled",
          '[aria-checked="true"]',
          '[data-background-image="true"]',
          '[data-columns="1"]',
          '[data-columns="2"]',
          '[data-columns="3"]',
          '[data-span="full"]',
          '[data-mask="left"]',
          '[data-mask="right"]',
          '[data-mask="both"]',
        ];
        for (const name of names) {
          // One consumer class per page: a root override must never mask a broken modifier.
          const rule = `${states.map((state) => `.${name}${state}`).join(",")}{${css}}`;
          await open(page, `family=${family}&layer=${layer}`, order === "before" ? rule : "");
          if (order === "after") await page.addStyleTag({ content: rule });
          const values = await page.locator(`[data-parity-case] .${name}`).evaluateAll((elements) =>
            elements.map((element) => {
              element.getAnimations().forEach((animation) => animation.finish());
              const style = getComputedStyle(element);
              return {
                color: style.color,
                background: style.backgroundColor,
                padding: style.padding,
                border: style.borderColor,
              };
            }),
          );
          expect(values.length).toBeGreaterThan(0);
          for (const value of values)
            expect(value, name).toEqual({
              color: "rgb(1, 2, 3)",
              background: "rgb(4, 5, 6)",
              padding: "7px 8px 9px 10px",
              border: "rgb(11, 12, 13)",
            });
        }
      });
  }

test("card keyboard activation and option disabled/selected precedence", async ({ page }) => {
  await open(page, "");
  const interactive = page.locator('[data-activation-count] [role="button"]');
  for (const card of await interactive.all()) {
    await card.press("Enter");
    await card.press(" ");
  }
  await expect(page.locator("[data-activation-count]")).toHaveAttribute(
    "data-activation-count",
    "10",
  );
  const one = page.getByRole("radio", { name: "One First" });
  const two = page.getByRole("radio", { name: "Two Second" });
  const border = await two.evaluate((el) => getComputedStyle(el).borderColor);
  await two.hover();
  await expect(two).toHaveCSS("border-color", border);
  await one.press(" ");
  await expect(one).toHaveAttribute("aria-checked", "true");
  const selected = await one.evaluate((el) => {
    el.getAnimations().forEach((animation) => animation.finish());
    return getComputedStyle(el).borderColor;
  });
  expect(selected).not.toBe(border);
  await one.hover();
  await expect(one).toHaveCSS("border-color", selected);
  await one.press(" ");
  await expect(one).toHaveAttribute("aria-checked", "false");
});

test("card styles register lazily and survive html class replacement", async ({ page }) => {
  await page.goto("/card-blocks.html?lazy=1");
  await page.waitForFunction(() => "mountFixture" in window);
  const before = await page.evaluate(() => ({
    html: document.documentElement.className,
    css: document.getElementById("_goober")?.textContent ?? "",
  }));
  expect(before.css).not.toContain("--_openui-context-card-background");
  expect(before.css).not.toContain("--_openui-card-block-layout-gap");
  await page.evaluate(() => (window as Window & { mountFixture: () => void }).mountFixture());
  await expect(page.locator(".openui-context-card").first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.className)).toBe(before.html);
  const card = page.locator(".openui-context-card").first();
  const padding = await card.evaluate((el) => getComputedStyle(el).padding);
  await page.evaluate(() => {
    document.documentElement.className = "host-rewrite";
  });
  await expect(card).toHaveCSS("padding", padding);
});

test("disabled selected option retains its border and text colors on hover", async ({ page }) => {
  await open(page, "family=option-cards");
  const card = page
    .locator('[data-parity-case] .openui-option-cards-card[aria-checked="true"]:disabled')
    .first();
  const before = await card.evaluate((el) => ({
    border: getComputedStyle(el).borderColor,
    color: getComputedStyle(el.querySelector(".openui-option-cards-title")!).color,
  }));
  await card.hover();
  await expect(card).toHaveCSS("border-color", before.border);
  await expect(card.locator(".openui-option-cards-title")).toHaveCSS("color", before.color);
});

for (const order of ["before", "after"] as const)
  for (const layer of ["", "openui"])
    test(`image and overlay pseudo-element overrides win ${order} in ${layer || "default"} mode`, async ({
      page,
    }) => {
      const rules = `.openui-visual-card::before { background-image:none; transform:none; }
    .openui-visual-card::after { background:rgb(4,5,6); }
    .openui-context-card::before { background:rgb(4,5,6); }`;
      await open(page, `family=visual-card-block&layer=${layer}`, order === "before" ? rules : "");
      if (order === "after") await page.addStyleTag({ content: rules });
      const card = page.locator('[data-parity-case="true/true"] .openui-visual-card--clickable');
      await expect(card).toBeVisible();
      await expect(card).toHaveAttribute("style", /--_openui-visual-card-image:.*url\(/);
      await card.hover();
      expect(
        await card.evaluate((el) => {
          el.getAnimations().forEach((animation) => animation.finish());
          return {
            image: getComputedStyle(el, "::before").backgroundImage,
            zoom: getComputedStyle(el, "::before").transform,
            overlay: getComputedStyle(el, "::after").backgroundColor,
          };
        }),
      ).toEqual({ image: "none", zoom: "none", overlay: "rgb(4, 5, 6)" });
      await open(page, `family=context-card-block&layer=${layer}`, order === "before" ? rules : "");
      if (order === "after") await page.addStyleTag({ content: rules });
      const context = page
        .locator('[data-parity-case] .openui-context-card[data-background-image="true"]')
        .first();
      await expect(context).toBeVisible();
      expect(await context.evaluate((el) => getComputedStyle(el, "::before").content)).toBe('""');
      expect(await context.evaluate((el) => getComputedStyle(el, "::before").backgroundColor)).toBe(
        "rgb(4, 5, 6)",
      );
    });
