import assert from "node:assert/strict";
import test from "node:test";
import { core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h } = React;
test("text content preserves nested children and consumer customization across variants", async () => {
  assert(core.TextContent, "public TextContent export");
  const render = (variant) =>
    h(
      core.TextContent,
      { variant, className: "consumer", style: { padding: 19 } },
      h("p", null, "Description"),
    );
  const view = await mount(render(undefined));
  try {
    for (const variant of [undefined, "clear", "card", "sunk"]) {
      await view.render(render(variant));
      const content = view.container.firstElementChild;
      assert.equal(content.querySelector("p").textContent, "Description");
      assert.equal(content.style.padding, "19px");
      assert(content.classList.contains("consumer"));
    }
  } finally {
    await view.close();
  }
});
