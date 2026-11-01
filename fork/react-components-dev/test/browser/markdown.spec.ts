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

for (const position of ["before", "after"] as const) {
  test(`a bare element selector in the app, loaded ${position} the library, does not reach markdown prose`, async ({
    page,
  }) => {
    // The trade-off of prose rules weighing one class plus the tag: element-only rules such as
    // resets no longer restyle markdown; restyle it through .openui-markdown-renderer instead.
    const css = "p { color: rgb(1, 2, 3); }";
    await page.goto(
      `/markdown.html${position === "before" ? `?css=${encodeURIComponent(css)}` : ""}`,
    );
    const paragraph = page.getByTestId("markdown").locator(".openui-markdown-renderer > p").first();
    await expect(paragraph).toBeVisible();
    const library = await paragraph.evaluate((el) => getComputedStyle(el).color);
    if (position === "after") await page.addStyleTag({ content: css });
    expect(library).not.toBe("rgb(1, 2, 3)");
    await expect(paragraph).toHaveCSS("color", library);
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
  // Inside one they carry the quoted state and inherit like the quote's other text, as in #72.
  for (const selector of ["blockquote p > a", "blockquote p > code"]) {
    await expect(markdown.locator(selector).first()).toHaveAttribute("data-quoted", "true");
    expect(await look(selector)).toEqual({
      inheritsColor: true,
      inheritsLineHeight: true,
      fontStyle: "italic",
    });
  }
  await expect(markdown.locator(".openui-markdown-renderer > p > a").first()).not.toHaveAttribute(
    "data-quoted",
  );
});

// The quoted state is an attribute, so it works without style queries (Firefox included) and a
// consumer overrides it with the same state, as for any other.
for (const layer of ["", "openui"])
  for (const position of ["before", "after"] as const)
    test(`quoted links and code take consumer CSS ${position} the library (${layer || "default"})`, async ({
      page,
    }) => {
      const css = [".openui-markdown-renderer-link", ".openui-markdown-renderer-code"]
        .map((part) => `${part}[data-quoted] { color: rgb(1, 2, 3); line-height: 31px; }`)
        .join("\n");
      const params = new URLSearchParams({ layer });
      if (position === "before") params.set("css", css);
      await page.goto(`/markdown.html?${params}`);
      if (position === "after") await page.addStyleTag({ content: css });
      for (const selector of ["blockquote p > a", "blockquote p > code"]) {
        const part = page.getByTestId("markdown").locator(selector).first();
        await expect(part).toHaveCSS("color", "rgb(1, 2, 3)");
        await expect(part).toHaveCSS("line-height", "31px");
      }
    });

test('listLeadIn="spaced" spaces a paragraph from the list after it', async ({ page }) => {
  await page.goto("/markdown.html");
  const [flush, spaced] = await page
    .getByTestId("lead-in")
    .locator(".openui-markdown-renderer")
    .all();
  await expect(flush!).not.toHaveClass(/--list-lead-in-/);
  await expect(flush!.locator("p")).toHaveCSS("margin-bottom", "0px");
  await expect(spaced!).toHaveClass(/\bopenui-markdown-renderer--list-lead-in-spaced\b/);
  await expect(spaced!.locator("p")).toHaveCSS("margin-bottom", "8px");
});
