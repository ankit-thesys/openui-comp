import assert from "node:assert/strict";
import test from "node:test";
import { core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h } = React;
test("icon text composes real markdown labels, retains its root ref and updates optional content", async () => {
  assert(core.IconText, "public IconText export");
  const ref = React.createRef();
  const view = await mount(
    h(core.IconText, {
      ref,
      icon: { name: "globe" },
      title: "**Revenue**",
      subtitle: "[Details](https://example.com)",
      iconVariant: "soft",
      className: "consumer",
    }),
  );
  try {
    assert.equal(ref.current, view.container.firstElementChild);
    assert(ref.current.classList.contains("consumer"));
    assert.equal(ref.current.querySelector("strong").textContent, "Revenue");
    const link = ref.current.querySelector("a");
    assert.equal(link.href, "https://example.com/");
    assert.equal(link.target, "_blank");
    await view.render(
      h(core.IconText, {
        ref,
        icon: { name: "" },
        title: "Updated",
        layout: "vertical",
        bold: true,
        iconVariant: "filled",
      }),
    );
    assert.equal(ref.current.textContent, "Updated");
    assert.equal(ref.current.querySelector("a"), null);
  } finally {
    await view.close();
  }
});
