import assert from "node:assert/strict";
import test from "node:test";
import { act, core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h, createRef } = React;
test("CardHeader preserves content, actions, ref and native style precedence", async () => {
  assert(core.CardHeader, "CardHeader must be exported");
  const ref = createRef();
  let clicks = 0;
  const view = await mount(
    h(core.CardHeader, {
      ref,
      title: h("h2", null, "Title"),
      subtitle: "Detail",
      icon: h("svg", { "data-icon": "title" }),
      actions: [h(core.Button, { onClick: () => clicks++ }, "Act")],
      styles: { padding: 12 },
      style: { padding: 17 },
      "aria-label": "Heading",
    }),
  );
  try {
    const header = view.container.firstElementChild;
    assert.equal(ref.current, header);
    assert.equal(header.getAttribute("aria-label"), "Heading");
    assert.equal(header.style.padding, "17px");
    assert.equal(header.querySelector("h2").textContent, "Title");
    assert.equal(header.querySelector(".openui-header-bottom").textContent, "Detail");
    assert(header.querySelector('[data-icon="title"]'));
    await act(() => header.querySelector("button").click());
    assert.equal(clicks, 1);
    await view.render(h(core.CardHeader, { ref, title: "Next" }));
    assert.equal(header.querySelector(".openui-header-bottom"), null);
    assert.equal(header.querySelector(".openui-header-top-left").textContent, "Next");
  } finally {
    await view.close();
  }
});
