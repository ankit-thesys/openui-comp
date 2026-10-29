import { expect, test, type Page } from "@playwright/test";

const color = "rgb(1, 2, 3)";
const background = "rgb(4, 5, 6)";
const declarations = `color: ${color}; background-color: ${background}; padding: 7px 8px 9px 10px; border-color: rgb(11, 12, 13);`;

async function consumer(page: Page, css: string, order: "before" | "after", query = "") {
  await page.goto(
    `/disclosure.html?${query}&css=${order === "before" ? encodeURIComponent(css) : ""}`,
  );
  if (order === "after") await page.addStyleTag({ content: css });
}

for (const order of ["before", "after"] as const) {
  for (const family of ["accordion", "foldable-section"]) {
    test(`${family} open and closed state overrides win ${order} the library`, async ({ page }) => {
      const css = ["trigger", "content"]
        .flatMap((part) =>
          ["open", "closed"].map(
            (state) => `.openui-${family}-${part}[data-state="${state}"] { ${declarations} }`,
          ),
        )
        .join("\n");
      await consumer(page, css, order);
      const trigger = page.locator(`.openui-${family}-trigger`);
      const content = page.locator(`.openui-${family}-content`);
      for (const [index, state] of ["closed", "open", "closed"].entries()) {
        await expect(trigger).toHaveAttribute("data-state", state);
        await expect(content).toHaveAttribute("data-state", state);
        for (const element of [trigger, content]) {
          await expect(element).toHaveCSS("color", color);
          await expect(element).toHaveCSS("background-color", background);
          await expect(element).toHaveCSS("padding-top", "7px");
        }
        if (index === 2) continue;
        if (state === "open") await trigger.press("Enter");
        else if ((await trigger.getAttribute("data-state")) === "closed") await trigger.click();
      }
    });
  }

  for (const layer of ["", "openui"]) {
    test(`Modal portal overrides win ${order} the library in ${layer || "default"} mode`, async ({
      page,
    }) => {
      // Every stable part and the default size modifier, including the hover rule on close.
      const targets = [
        "openui-modal",
        "openui-modal--size-md",
        "openui-modal-overlay",
        "openui-modal-content",
        "openui-modal-header",
        "openui-modal-title",
        "openui-modal-close",
        "openui-modal-close-icon",
        "openui-modal-body",
      ];
      const css =
        targets.map((name) => `.${name} { ${declarations} }`).join("\n") +
        `.openui-modal-close:hover { ${declarations} }`;
      await consumer(page, css, order, `layer=${layer}`);
      await page.getByRole("button", { name: "Open modal", exact: true }).click();
      await expect(page.getByRole("dialog")).toBeVisible();
      expect(await page.locator("#root .openui-modal").count()).toBe(0);
      for (const name of targets) {
        await expect(page.locator(`.${name}`)).toHaveCSS("color", color);
        await expect(page.locator(`.${name}`)).toHaveCSS("background-color", background);
      }
      await page.getByRole("button", { name: "Close", exact: true }).hover();
      await expect(page.locator(".openui-modal-close")).toHaveCSS("color", color);
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).toHaveCount(0);
    });

    for (const side of ["top", "right", "bottom", "left"]) {
      test(`Tooltip ${side} portal overrides win ${order} the library in ${layer || "default"} mode`, async ({
        page,
      }) => {
        const targets = [
          "openui-tooltip-wrapper",
          "openui-tooltip-wrapper-body",
          "openui-tooltip-wrapper-heading",
          "openui-tooltip-wrapper-text",
        ];
        const css =
          targets.map((name) => `.${name} { ${declarations} }`).join("\n") +
          `.openui-tooltip-wrapper[data-state="delayed-open"] { ${declarations} }`;
        await consumer(page, css, order, `layer=${layer}&side=${side}`);
        await page.getByRole("button", { name: "Show tooltip", exact: true }).hover();
        await expect(page.locator(".openui-tooltip-wrapper")).toHaveAttribute(
          "data-state",
          "delayed-open",
        );
        expect(await page.locator("#root .openui-tooltip-wrapper").count()).toBe(0);
        for (const name of targets) {
          // Radix duplicates the content for screen readers; inspect the visible portal tree.
          const target =
            name === "openui-tooltip-wrapper"
              ? page.locator(`.${name}`)
              : page.locator(`.openui-tooltip-wrapper .${name}`).first();
          await expect(target).toHaveCSS("color", color);
          await expect(target).toHaveCSS("background-color", background);
        }
      });
    }
  }
}

test("disclosure styles register at render without adding html markers", async ({ page }) => {
  await page.goto("/disclosure.html?lazy=1");
  await page.waitForFunction(() => "mountFixture" in window);
  const before = await page.evaluate(() => ({
    html: document.documentElement.className,
    css: document.getElementById("_goober")!.textContent ?? "",
  }));
  expect(before.css).not.toContain("_openui-accordion-down");
  expect(before.css).not.toContain("_openui-modal-fade-in");
  await page.evaluate(() => (window as Window & { mountFixture: () => void }).mountFixture());
  await expect(page.locator(".openui-accordion-trigger")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.className)).toBe(before.html);
  const trigger = page.locator(".openui-accordion-trigger");
  const padding = await trigger.evaluate((el) => getComputedStyle(el).padding);
  await page.evaluate(() => {
    document.documentElement.className = "host-rewrite";
  });
  await expect(trigger).toHaveCSS("padding", padding);
});
