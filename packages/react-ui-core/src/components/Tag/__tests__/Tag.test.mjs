import assert from "node:assert/strict";
import test from "node:test";
import { core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h } = React;
test("tags preserve rich labels, optional icons, styles and forwarded refs", async () => {
  assert(core.Tag, "public Tag export");
  const ref = React.createRef();
  const view = await mount(
    h(core.Tag, {
      ref,
      text: h("strong", null, "Ready"),
      icon: h("svg", { "aria-label": "Status" }),
      size: "sm",
      variant: "success",
      className: "consumer",
      styles: { marginTop: 6 },
    }),
  );
  try {
    assert.equal(ref.current.textContent, "Ready");
    assert(ref.current.classList.contains("consumer"));
    assert.equal(ref.current.style.marginTop, "6px");
    assert(ref.current.querySelector('svg[aria-label="Status"]'));
    await view.render(h(core.Tag, { text: "Plain" }));
    assert.equal(view.container.textContent, "Plain");
    assert.equal(view.container.querySelector("svg"), null);
  } finally {
    await view.close();
  }
});
