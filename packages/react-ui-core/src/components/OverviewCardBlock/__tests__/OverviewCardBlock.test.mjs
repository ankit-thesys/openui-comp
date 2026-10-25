import assert from "node:assert/strict";
import test from "node:test";
import { core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h } = React;
test("overview cards preserve grid grouping, original item callbacks, refs and gap overrides", async () => {
  assert(core.OverviewCardBlock, "public OverviewCardBlock export");
  const ref = React.createRef();
  const items = Array.from({ length: 5 }, (_, i) => ({
    id: `card-${i}`,
    top: h("span", null, `Top ${i}`),
    bottom: { value: String(i) },
  }));
  const calls = [];
  const props = {
    ref,
    items,
    clickable: true,
    onItemClick: (...args) => calls.push(args),
    gap: 8,
    className: "custom",
    "aria-label": "Metrics",
  };
  const view = await mount(h(core.OverviewCardBlock, props));
  try {
    assert.equal(ref.current, view.container.firstElementChild);
    assert.equal(ref.current.getAttribute("aria-label"), "Metrics");
    assert.equal(ref.current.dataset.cardType, "OverviewCard");
    assert(ref.current.classList.contains("custom"));
    assert.equal(ref.current.style.getPropertyValue("--openui-small-card-gap"), "8px");
    assert.deepEqual(
      [...ref.current.querySelectorAll(".openui-small-card-block__row")].map(
        (n) => n.children.length,
      ),
      [3, 2],
    );
    const second = ref.current.querySelectorAll('[role="button"]')[1];
    await React.act(async () => second.click());
    await React.act(async () =>
      second.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Enter", bubbles: true })),
    );
    await React.act(async () =>
      second.dispatchEvent(new window.KeyboardEvent("keydown", { key: " ", bubbles: true })),
    );
    assert.deepEqual(calls, [
      [items[1], 1],
      [items[1], 1],
      [items[1], 1],
    ]);
    for (const [count, rows] of [
      [0, []],
      [1, [1]],
      [2, [2]],
      [3, [3]],
      [4, [2, 2]],
    ]) {
      await view.render(
        h(core.OverviewCardBlock, {
          ...props,
          items: items.slice(0, count),
          gap: 0,
          onItemClick: undefined,
        }),
      );
      assert.deepEqual(
        [...ref.current.querySelectorAll(".openui-small-card-block__row")].map(
          (n) => n.children.length,
        ),
        rows,
      );
      assert.equal(ref.current.querySelector('[role="button"]'), null);
      assert.equal(
        ref.current.style.getPropertyValue("--openui-small-card-gap"),
        "",
        "legacy numeric zero does not create gap override",
      );
    }
    await view.render(
      h(core.OverviewCardBlock, {
        ...props,
        gap: "2rem",
        style: { "--openui-small-card-gap": "3px" },
      }),
    );
    assert.equal(ref.current.style.getPropertyValue("--openui-small-card-gap"), "3px");
  } finally {
    await view.close();
  }
});
