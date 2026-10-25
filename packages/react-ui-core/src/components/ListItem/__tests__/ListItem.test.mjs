import assert from "node:assert/strict";
import test from "node:test";
import { core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h } = React;
test("list items preserve slots, action callback, root ref and inherited keyboard behavior", async () => {
  assert(core.ListItem, "public ListItem export");
  const ref = React.createRef();
  let clicks = 0;
  const view = await mount(
    h(core.ListItem, {
      ref,
      title: h("strong", null, "Title"),
      subtitle: "Details",
      actionLabel: "Open",
      actionIcon: h("span", null, "→"),
      onClick: () => clicks++,
      index: 2,
      className: "custom",
      style: { opacity: 0.7 },
    }),
  );
  try {
    assert.equal(ref.current, view.container.firstElementChild);
    assert(ref.current.classList.contains("custom"));
    assert.equal(ref.current.style.opacity, "0.7");
    assert.equal(ref.current.querySelector(".openui-list-item-indicator-number").textContent, "3");
    const target = ref.current.querySelector('[role="button"]');
    assert.equal(target.tabIndex, 0);
    await React.act(async () =>
      target.dispatchEvent(new window.MouseEvent("click", { bubbles: true })),
    );
    assert.equal(clicks, 1);
    await React.act(async () =>
      target.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Enter", bubbles: true })),
    );
    assert.equal(clicks, 1, "legacy ListItem does not implement keyboard activation");
    await view.render(
      h(core.ListItem, {
        ref,
        variant: "image",
        image: { alt: "Missing image" },
        actionLabel: "Hidden",
      }),
    );
    assert.equal(ref.current.querySelector("img").getAttribute("alt"), "Missing image");
    assert.equal(ref.current.querySelector("[role=button]"), null);
    assert.equal(ref.current.querySelector(".openui-list-item-action"), null);
    await view.render(
      h(core.ListItem, { ref, variant: "icon", icon: h("span", { "data-icon": true }, "Icon") }),
    );
    assert(ref.current.querySelector("[data-icon]"));
    assert.equal(ref.current.querySelector(".openui-list-item-title"), null);
  } finally {
    await view.close();
  }
});
