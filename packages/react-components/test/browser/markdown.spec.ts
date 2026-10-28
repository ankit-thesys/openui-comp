import { expect, test } from "@playwright/test";

for (const position of ["before", "after"] as const) {
  test(`markdown prose is restyled by a consumer selector loaded ${position} the library`, async ({
    page,
  }) => {
    const css = ".openui-markdown-renderer p { color: rgb(1, 2, 3); }";
    await page.goto(
      `/markdown.html${position === "before" ? `?css=${encodeURIComponent(css)}` : ""}`,
    );
    const paragraphs = page.getByTestId("markdown").locator("p");
    await expect(paragraphs.first()).toBeVisible();
    if (position === "after") await page.addStyleTag({ content: css });
    for (const paragraph of await paragraphs.all())
      await expect(paragraph).toHaveCSS("color", "rgb(1, 2, 3)");
  });
}

const targets = [
  ["openui-markdown-renderer", ".openui-markdown-renderer"],
  ["openui-markdown-renderer--variant-clear", ".openui-markdown-renderer--variant-clear"],
  ["openui-markdown-renderer--variant-card", ".openui-markdown-renderer--variant-card"],
  ["openui-markdown-renderer--variant-sunk", ".openui-markdown-renderer--variant-sunk"],
  ["openui-markdown-renderer-code", "p > code"],
  ["openui-markdown-renderer-link", "p > a"],
  ["openui-markdown-renderer-code-block", "pre > div"],
  ["openui-markdown-renderer-table", "table"],
  ["openui-markdown-renderer-table-container", ".openui-table-container"],
] as const;

for (const [className, selector] of targets) {
  for (const position of ["before", "after"] as const) {
    test(`.${className} overrides from ${position} the library`, async ({ page }) => {
      const css = `.${className} { color: rgb(1, 2, 3); background-color: rgb(4, 5, 6); padding: 7px; border: 3px solid rgb(11, 12, 13); border-radius: 2px; }`;
      await page.goto(
        `/markdown.html${position === "before" ? `?css=${encodeURIComponent(css)}` : ""}`,
      );
      const part = page.getByTestId("markdown").locator(selector).first();
      await expect(part).toBeVisible();
      if (position === "after") await page.addStyleTag({ content: css });
      await expect(part).toHaveCSS("color", "rgb(1, 2, 3)");
      await expect(part).toHaveCSS("background-color", "rgb(4, 5, 6)");
      await expect(part).toHaveCSS("padding", "7px");
      await expect(part).toHaveCSS("border-top-width", "3px");
      await expect(part).toHaveCSS("border-top-color", "rgb(11, 12, 13)");
      await expect(part).toHaveCSS("border-radius", "2px");
    });
  }
}

test("consumer components replace the defaults through options", async ({ page }) => {
  await page.goto("/markdown.html");
  await expect(page.getByTestId("custom-paragraph")).toHaveText("Custom link and code.");
  await expect(page.getByTestId("custom-link")).toHaveAttribute("href", "https://example.com");
  await expect(page.getByTestId("custom-code")).toHaveText("code");
  await expect(
    page
      .getByTestId("custom")
      .locator(".openui-markdown-renderer-code, .openui-markdown-renderer-link"),
  ).toHaveCount(0);
});

test("InlineMarkdownRenderer retains its inline root reset", async ({ page }) => {
  await page.goto("/markdown.html");
  const root = page.getByTestId("inline").locator(".openui-markdown-renderer");
  await expect(root).toHaveCSS("display", "inline");
  await expect(root).toHaveText("Inline markdown");
});

for (const position of ["before", "after"] as const) {
  test(`link hover and inline-code pseudo-elements can be restyled from ${position}`, async ({
    page,
  }) => {
    const css =
      '.openui-markdown-renderer-link:hover { text-decoration: overline; } .openui-markdown-renderer-code::before, .openui-markdown-renderer-code::after { content: "consumer"; }';
    await page.goto(
      `/markdown.html${position === "before" ? `?css=${encodeURIComponent(css)}` : ""}`,
    );
    const link = page.getByTestId("markdown").locator("p > a").first();
    await expect(link).toBeVisible();
    if (position === "after") await page.addStyleTag({ content: css });
    await link.hover();
    await expect(link).toHaveCSS("text-decoration-line", "overline");
    const code = page.getByTestId("markdown").locator("p > code").first();
    expect(
      await code.evaluate((el) => [
        getComputedStyle(el, "::before").content,
        getComputedStyle(el, "::after").content,
      ]),
    ).toEqual(['"consumer"', '"consumer"']);
  });
}

test("code and link typography honor the consumer's body font token", async ({ page }) => {
  await page.goto("/markdown.html?custom-font=1");
  for (const selector of [".openui-markdown-renderer-code", ".openui-markdown-renderer-link"]) {
    const part = page.getByTestId("markdown").locator(selector).first();
    await expect(part).toHaveCSS("font-size", "18px");
    await expect(part).toHaveCSS("line-height", "36px");
  }
});

test("links and inline code take the library's look, and inherit the quote's inside a blockquote", async ({
  page,
}) => {
  await page.goto("/markdown.html");
  const markdown = page.getByTestId("markdown").first();
  const look = (selector: string) =>
    markdown
      .locator(selector)
      .first()
      .evaluate((el) => {
        const style = getComputedStyle(el);
        const parent = getComputedStyle(el.parentElement!);
        return {
          inheritsColor: style.color === parent.color,
          inheritsLineHeight: style.lineHeight === parent.lineHeight,
          fontStyle: style.fontStyle,
        };
      });

  // Outside a quote the parts set their own colour, line-height and an upright style.
  expect(await look(".openui-markdown-renderer > p > a")).toMatchObject({
    inheritsColor: false,
    fontStyle: "normal",
  });
  expect(await look(".openui-markdown-renderer > p > code")).toMatchObject({ fontStyle: "normal" });
  // Inside one they inherit like the quote's other text, as in #72.
  for (const selector of ["blockquote p > a", "blockquote p > code"]) {
    expect(await look(selector)).toEqual({
      inheritsColor: true,
      inheritsLineHeight: true,
      fontStyle: "italic",
    });
  }
});
