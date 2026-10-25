import assert from "node:assert/strict";
import test from "node:test";
import { core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h } = React;
test("MarkDownRenderer preserves rich content, safe defaults, variants and updates", async () => {
  assert(core.MarkDownRenderer, "MarkDownRenderer must be exported");
  const text =
    "# Title\n\n**Bold** and `inline`.\n\n[Docs](https://example.com)\n\n[Unsafe](javascript:alert(1))\n\n<script>window.injected=true</script>\n\n```js\nconst answer = 42;\n```";
  const view = await mount(
    h(core.MarkDownRenderer, { textMarkdown: text, variant: "sunk", className: "custom" }),
  );
  try {
    assert.equal(view.container.querySelector("h1").textContent, "Title");
    assert.equal(view.container.querySelector("strong").textContent, "Bold");
    assert.equal(
      view.container.querySelector(".openui-markdown-renderer-code").textContent,
      "inline",
    );
    assert.equal(
      view.container.querySelector(".openui-code-block-wrapper code").textContent,
      "const answer = 42;",
    );
    const docs = [...view.container.querySelectorAll("a")].find((a) => a.textContent === "Docs");
    assert.equal(docs.getAttribute("href"), "https://example.com");
    assert.equal(docs.target, "_blank");
    assert.equal(docs.rel, "noopener noreferrer");
    const unsafe = [...view.container.querySelectorAll("a")].find(
      (a) => a.textContent === "Unsafe",
    );
    assert.equal(unsafe.getAttribute("href"), "");
    assert.equal(view.container.querySelector("script"), null);
    assert.equal(window.injected, undefined);
    assert(view.container.firstElementChild.classList.contains("custom"));
    assert(
      view.container.firstElementChild.classList.contains("openui-markdown-renderer-card-sunk"),
    );
    await view.render(
      h(core.MarkDownRenderer, {
        textMarkdown: "Updated",
        variant: "clear",
        options: { components: { p: ({ children }) => h("p", { "data-custom": true }, children) } },
      }),
    );
    assert.equal(view.container.querySelector("[data-custom]").textContent, "Updated");
    assert(
      !view.container.firstElementChild.classList.contains("openui-markdown-renderer-card-sunk"),
    );
  } finally {
    await view.close();
  }
});
