import assert from "node:assert/strict";
import test from "node:test";
import { core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h } = React;
test("CodeBlock preserves code, language, custom theme and updates through the public root", async () => {
  assert(core.CodeBlock, "CodeBlock must be exported");
  const view = await mount(
    h(core.CodeBlock, {
      language: "javascript",
      codeString: "const value = 42;",
      theme: {
        'pre[class*="language-"]': { backgroundColor: "rgb(1, 2, 3)" },
        'code[class*="language-"]': { color: "rgb(4, 5, 6)" },
      },
    }),
  );
  try {
    assert.equal(view.container.querySelector("code").textContent, "const value = 42;");
    assert.equal(
      view.container.querySelector(".openui-code-block-syntax-highlighter").style.backgroundColor,
      "rgb(1, 2, 3)",
    );
    assert.equal(view.container.querySelector("button").getAttribute("aria-label"), "Copy code");
    assert(view.container.querySelector("code").classList.contains("language-javascript"));
    await view.render(h(core.CodeBlock, { language: "text", codeString: "first\nsecond\n" }));
    assert.equal(view.container.querySelector("code").textContent, "first\nsecond\n");
    assert.equal(
      view.container.querySelector(".openui-code-block-syntax-highlighter").style.backgroundColor,
      "rgb(30, 30, 30)",
    );
    assert.equal(view.container.querySelector("button").getAttribute("aria-label"), "Copy code");
  } finally {
    await view.close();
  }
});
