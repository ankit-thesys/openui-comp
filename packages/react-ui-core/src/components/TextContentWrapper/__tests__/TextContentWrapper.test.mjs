import assert from "node:assert/strict";
import test from "node:test";
import { act, core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h } = React;
test("TextContentWrapper preserves header, GFM, literal single dollars and client math rendering", async () => {
  assert(core.TextContentWrapper, "TextContentWrapper must be exported");
  const text =
    "**Rich** text around ~$886K and $literal$.\nnext line\n\n| Item | Value |\n| --- | --- |\n| A | 42 |\n\n$$\nx^2 + y^2\n$$";
  const view = await mount(
    h(core.TextContentWrapper, {
      textMarkdown: text,
      header: { heading: "**Heading**", description: "Description" },
      variant: "card",
      className: "custom",
    }),
  );
  try {
    assert(view.container.firstElementChild.classList.contains("custom"));
    assert.equal(
      view.container.querySelector(".openui-inline-header-heading strong").textContent,
      "Heading",
    );
    assert.equal(view.container.querySelector("table tbody tr").textContent, "A42");
    assert(view.container.textContent.includes("~$886K and $literal$"));
    assert.equal(view.container.querySelector("del"), null);
    assert(view.container.querySelector(".openui-markdown-renderer-card"));
    const deadline = Date.now() + 7000;
    while (!view.container.querySelector(".katex") && Date.now() < deadline)
      await act(async () => new Promise((resolve) => setTimeout(resolve, 20)));
    assert(
      view.container.querySelector(".katex"),
      "existing asynchronous client plugin renders math",
    );
    await view.render(h(core.TextContentWrapper, { textMarkdown: "Updated", variant: "clear" }));
    assert.equal(view.container.querySelector(".openui-inline-header"), null);
    assert.equal(view.container.querySelector(".katex"), null);
    assert.equal(
      view.container.querySelector(".openui-text-content-markdown").textContent,
      "Updated",
    );
  } finally {
    await view.close();
  }
});
