import assert from "node:assert/strict";
import test from "node:test";
import { core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h } = React;
test("InlineMarkdownRenderer preserves empty output, flattened text, aligned GFM tables and citations", async () => {
  assert(core.InlineMarkdownRenderer, "InlineMarkdownRenderer must be exported");
  const view = await mount(h(core.InlineMarkdownRenderer, { content: "" }));
  try {
    assert.equal(view.container.innerHTML, "");
    const content =
      "**Bold** and *italic* and [Docs](https://example.com) with `code`.\n\n# Heading\n\n- first\n- second\n\n| Name | Score |\n| :--- | ---: |\n| Ada | 42 |\n\nEvidence [1][2].";
    const tree = (mode) =>
      h(
        core.ThemeProvider,
        { mode },
        h(
          core.CardSourceProvider,
          {
            sources: [
              { title: "First", sourceName: "Docs", url: "https://example.com/first" },
              { title: "Second", sourceName: "Docs", url: "https://example.com/second" },
            ],
          },
          h(core.InlineMarkdownRenderer, { content, className: "inline-custom" }),
        ),
      );
    await view.render(tree("light"));
    const span = view.container.querySelector(".openui-inline-markdown-renderer");
    assert(span.classList.contains("inline-custom"));
    assert.equal(span.querySelector("strong").textContent, "Bold");
    assert.equal(span.querySelector("em").textContent, "italic");
    assert.equal(
      span.querySelector("h1,h2,p,ol,ul,li"),
      null,
      "existing inline overrides flatten block tags",
    );
    assert(span.querySelector(".openui-markdown-renderer"), "preserve existing renderer wrapper");
    assert.equal(span.querySelector("table tbody tr").textContent, "Ada42");
    assert.equal(span.querySelectorAll("th")[1].style.textAlign, "right");
    assert.equal(span.querySelectorAll("td")[1].style.textAlign, "right");
    assert.equal(
      span.querySelectorAll('button[aria-label="Citations"]').length,
      1,
      "grouped source references produce one trigger",
    );
    await view.render(tree("dark"));
    assert(view.container.querySelector(".openui-inline-markdown-renderer--dark"));
    await view.render(h(core.InlineMarkdownRenderer, { content: "Evidence [1]." }));
    assert.equal(
      view.container.querySelectorAll('button[aria-label="Citations"]').length,
      0,
      "no sources preserves omitted citations",
    );
  } finally {
    await view.close();
  }
});
