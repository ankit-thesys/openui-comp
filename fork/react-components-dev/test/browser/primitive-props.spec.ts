// Shared primitives take the look a card needs through public props, not the card's private
// variables (ADR 0001, Q14). The cards supply those props to the primitives a caller puts in their
// slots; a primitive's own prop still wins, and consumer CSS on each new modifier class beats the
// library before or after it, in default and layer mode.
import { expect, test, type Page } from "@playwright/test";

// The card fixture renders one family's cases, by its `family` parameter.
async function open(page: Page, family: string, layer = "", css = "") {
  const params = new URLSearchParams({ family, layer, css });
  await page.goto(`/card-blocks.html?${params}`);
  await expect(page.locator(".openui-context-card").first()).toBeVisible();
}

const finished = (page: Page) =>
  page.evaluate(() => document.getAnimations().forEach((animation) => animation.finish()));

test("photo cards give the Tags in their image slot the image surface", async ({ page }) => {
  for (const [family, card] of [
    ["visual-card-block", ".openui-visual-card"],
    ["context-card-block", '.openui-context-card[data-background-image="true"]'],
  ] as const) {
    await open(page, family);
    const tag = page.locator(`${card} .openui-tag`).first();
    await expect(tag).toHaveClass(/\bopenui-tag--surface-image\b/);
    await expect(tag).toHaveCSS("background-color", "rgba(0, 0, 0, 0.4)");
    await expect(tag).toHaveCSS("backdrop-filter", "blur(2px)");
  }
  // A context card without a photo (no data-background-image) leaves its Tag on its own surface.
  const plain = page.locator(".openui-context-card:not([data-background-image]) .openui-tag");
  await expect(plain.first()).toBeVisible();
  for (const tag of await plain.all()) {
    await expect(tag).not.toHaveClass(/--surface-/);
    await expect(tag).toHaveCSS("backdrop-filter", "none");
  }
});

test("snippet slots truncate their text: the left fills, the right aligns to the end", async ({
  page,
}) => {
  await open(page, "snippet-card-block");
  const lhs = page.locator(".openui-snippet-card-block-lhs");
  for (const block of [
    lhs.locator(".openui-text-block").first(),
    lhs.locator(".openui-icon-text").first(),
    lhs.locator(".openui-image-text").first(),
  ]) {
    await expect(block).toHaveClass(/--overflow-truncate\b/);
    await expect(block).toHaveClass(/--width-fill\b/);
    await expect(block).toHaveCSS("overflow-x", "hidden");
  }
  const primary = lhs.locator(".openui-text-block-primary").first();
  await expect(primary).toHaveCSS("white-space", "nowrap");
  await expect(primary).toHaveCSS("text-overflow", "ellipsis");

  const rhs = page.locator(".openui-snippet-card-block-rhs .openui-text-block").first();
  await expect(rhs).toHaveClass(/\bopenui-text-block--overflow-truncate\b/);
  await expect(rhs).toHaveClass(/\bopenui-text-block--align-right\b/);
  await expect(rhs).not.toHaveClass(/--width-fill/);
  await expect(rhs).toHaveCSS("text-align", "right");
});

test("composite cards give their inline markdown the surrounding typography", async ({ page }) => {
  await open(page, "composite-card-block");
  const card = page
    .locator(".openui-composite-card", { has: page.locator(".parity-block-markdown") })
    .first();
  const inline = card.locator(".openui-inline-markdown-renderer").last();
  await expect(inline).toHaveClass(/\bopenui-inline-markdown-renderer--typography-inherit\b/);
  await expect(inline.locator(".openui-markdown-renderer")).toHaveClass(
    /\bopenui-markdown-renderer--typography-inherit\b/,
  );
  const code = inline.locator(".openui-markdown-renderer-code");
  await expect(code).toHaveClass(/\bopenui-markdown-renderer-code--typography-inherit\b/);
  await expect(code).toHaveCSS("font-size", "12px");
  // Bold text keeps the surrounding size at medium weight.
  const strong = inline.locator("strong").first();
  const size = await inline.evaluate((el) => getComputedStyle(el).fontSize);
  await expect(strong).toHaveCSS("font-size", size);
  await expect(strong).toHaveCSS("font-weight", "560");
  // A full markdown block in the same card keeps the renderer's own typography.
  await expect(card.locator(".parity-block-markdown")).not.toHaveClass(/--typography-/);
});

// Consumer CSS on the property each new modifier sets, on the family that renders it.
const overrides: [family: string, selector: string, property: string, value: string][] = [
  ["visual-card-block", ".openui-tag--surface-image", "background-color", "rgb(1, 2, 3)"],
  ["visual-card-block", ".openui-tag--surface-image", "backdrop-filter", "none"],
  ["snippet-card-block", ".openui-text-block--overflow-truncate", "overflow-x", "visible"],
  ["snippet-card-block", ".openui-text-block--width-fill", "width", "37px"],
  ["snippet-card-block", ".openui-icon-text--overflow-truncate", "overflow-x", "visible"],
  ["snippet-card-block", ".openui-icon-text--width-fill", "width", "37px"],
  ["snippet-card-block", ".openui-image-text--overflow-truncate", "overflow-x", "visible"],
  ["snippet-card-block", ".openui-image-text--width-fill", "width", "37px"],
  [
    "composite-card-block",
    ".openui-markdown-renderer-code--typography-inherit",
    "font-size",
    "19px",
  ],
];
for (const layer of ["", "openui"])
  for (const position of ["before", "after"] as const)
    for (const [family, selector, property, value] of overrides)
      test(`${selector} ${property} overrides ${position} the library (${layer || "default"})`, async ({
        page,
      }) => {
        // Overflow takes the shorthand: one visible axis computes to auto beside a hidden one.
        const declared = property === "overflow-x" ? "overflow" : property;
        const css = `${selector} { ${declared}: ${value}; }`;
        await open(page, family, layer, position === "before" ? css : "");
        if (position === "after") await page.addStyleTag({ content: css });
        await finished(page);
        const parts = page.locator(selector);
        await expect(parts.first()).toBeVisible();
        for (const part of await parts.all()) await expect(part).toHaveCSS(property, value);
      });
