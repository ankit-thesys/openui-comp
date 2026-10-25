import assert from "node:assert/strict";
import test from "node:test";
import { core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h } = React;
test("VisualCardBlock preserves slots, refs, keyboard callbacks and empty updates", async () => {
  assert(core.VisualCardBlock, "public block export");
  assert(core.VisualCard, "public card export");
  const ref = React.createRef();
  const calls = [];
  const items = Array.from({ length: 4 }, (_, i) => ({
    id: String(i),
    header: h("b", null, "Header"),
    body: "Body",
    title: "Title",
    tag: h("span", null, "Tag"),
    footer: { price: "$10", button: h("button", null, "Buy") },
  }));
  const props = {
    items,
    ref,
    gap: 7,
    clickable: true,
    className: "custom",
    onItemClick: (i) => calls.push(i),
  };
  const view = await mount(h(core.VisualCardBlock, props));
  try {
    assert.equal(ref.current, view.container.firstElementChild);
    assert(ref.current.classList.contains("custom"));
    assert.equal(ref.current.querySelectorAll(".openui-visual-first-card").length, 4);
    assert.equal(ref.current.style.getPropertyValue("--openui-medium-card-gap"), "7px");
    assert.equal(ref.current.querySelector(".openui-visual-first-card__tag").textContent, "Tag");
    assert.equal(
      ref.current.querySelector(".openui-visual-first-card__bottom").textContent,
      "Body",
    );
    const second = ref.current.querySelectorAll('[role="button"]')[1];
    await React.act(async () => second.click());
    for (const key of ["Enter", " "])
      await React.act(async () =>
        second.dispatchEvent(new window.KeyboardEvent("keydown", { key, bubbles: true })),
      );
    assert.deepEqual(calls, [1, 1, 1]);
    await view.render(h(core.VisualCardBlock, { ...props, items: [], clickable: false }));
    assert.equal(ref.current.querySelectorAll(".openui-visual-first-card").length, 0);
    await view.render(h(core.VisualCard, { ref, item: {}, className: "single" }));
    assert(ref.current.classList.contains("single"));
    assert.equal(ref.current.getAttribute("role"), null);
    assert.equal(ref.current.getAttribute("tabindex"), null);
  } finally {
    await view.close();
  }
});
