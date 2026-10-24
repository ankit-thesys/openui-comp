import assert from "node:assert/strict";
import test from "node:test";
import { core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h } = React;
test("Separator preserves orientation, semantics, native attributes and overrides", async () => {
  assert(core.Separator, "Separator must be exported");
  const view = await mount(
    h(core.Separator, {
      orientation: "vertical",
      decorative: false,
      id: "divider",
      className: "custom",
      style: { height: 50 },
    }),
  );
  try {
    const separator = view.container.firstElementChild;
    assert.equal(separator.id, "divider");
    assert.equal(separator.getAttribute("role"), "separator");
    assert.equal(separator.getAttribute("aria-orientation"), "vertical");
    assert.equal(separator.getAttribute("data-orientation"), "vertical");
    assert.equal(separator.style.height, "50px");
    assert(separator.classList.contains("custom"));
    await view.render(h(core.Separator, { decorative: true }));
    assert.equal(separator.getAttribute("data-orientation"), "horizontal");
    assert.equal(separator.getAttribute("role"), "none");
    assert.equal(separator.getAttribute("aria-orientation"), null);
  } finally {
    await view.close();
  }
});
