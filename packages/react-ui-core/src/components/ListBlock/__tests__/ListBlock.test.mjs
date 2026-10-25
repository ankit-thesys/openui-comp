import assert from "node:assert/strict";
import test from "node:test";
import { core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h } = React;
test("list blocks share subtitle spacing and override child index, size and variant without replacing actions", async () => {
  assert(core.ListBlock, "public ListBlock export");
  const ref = React.createRef();
  let clicks = 0;
  const children = [
    h(core.ListItem, {
      key: "a",
      title: "First",
      index: 9,
      variant: "icon",
      size: "default",
      onClick: () => clicks++,
    }),
    h(core.ListItem, { key: "b", title: "Second", subtitle: "Details" }),
  ];
  const view = await mount(
    h(
      core.ListBlock,
      { ref, size: "small", className: "custom", style: { opacity: 0.5 } },
      children,
    ),
  );
  try {
    assert.equal(ref.current, view.container.firstElementChild);
    assert(ref.current.classList.contains("custom"));
    assert.equal(ref.current.style.opacity, "0.5");
    assert.deepEqual(
      [...ref.current.querySelectorAll(".openui-list-item-indicator-number")].map(
        (n) => n.textContent,
      ),
      ["1", "2"],
    );
    assert.equal(ref.current.querySelectorAll(".openui-list-item-wrapper--small").length, 2);
    assert.equal(ref.current.querySelector(".openui-list-item-indicator-no-subtitle"), null);
    await React.act(async () => ref.current.querySelector('[role="button"]').click());
    assert.equal(clicks, 1);
    await view.render(
      h(core.ListBlock, { ref, variant: "icon" }, [
        h(core.ListItem, {
          key: "x",
          title: "Only",
          icon: h("span", { "data-icon": true }, "Icon"),
        }),
      ]),
    );
    assert(ref.current.querySelector("[data-icon]"));
    assert(ref.current.querySelector(".openui-list-item-indicator-no-subtitle"));
    assert.equal(ref.current.querySelector(".openui-list-item-indicator-number"), null);
    await view.render(h(core.ListBlock, { ref }, []));
    assert.equal(ref.current.textContent, "");
  } finally {
    await view.close();
  }
});
