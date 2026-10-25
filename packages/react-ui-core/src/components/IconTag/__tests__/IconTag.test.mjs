import assert from "node:assert/strict";
import test from "node:test";
import { core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h } = React;
test("icon tags retain their native root ref and consumer class, and omit a missing icon", async () => {
  assert(core.IconTag, "public IconTag export");
  const ref = React.createRef();
  const view = await mount(
    h(core.IconTag, {
      ref,
      icon: { name: "globe", category: "finance" },
      size: "xl",
      variant: "inverted",
      className: "consumer",
    }),
  );
  try {
    assert.equal(ref.current, view.container.firstElementChild);
    assert(ref.current.classList.contains("consumer"));
    await view.render(h(core.IconTag, { ref, icon: { name: "" } }));
    assert.equal(view.container.innerHTML, "");
    assert.equal(ref.current, null);
  } finally {
    await view.close();
  }
});
