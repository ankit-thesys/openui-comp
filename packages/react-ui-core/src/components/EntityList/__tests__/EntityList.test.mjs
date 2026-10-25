import assert from "node:assert/strict";
import test from "node:test";
import { core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h } = React;
test("entity rows preserve markdown, numeric variants, compact omission and live updates", async () => {
  assert(core.EntityList, "public EntityList export");
  const ref = React.createRef();
  const props = {
    ref,
    className: "custom",
    header: { left: "Header", right: "Amount" },
    footer: { left: "Total", right: "10", rightVariant: "number" },
    rows: [
      { left: "**Name**", right: "[Site](https://example.com)" },
      { left: "Count", right: "10", rightVariant: "number" },
    ],
  };
  const view = await mount(h(core.EntityList, props));
  try {
    assert.equal(ref.current, view.container.firstElementChild);
    assert(ref.current.classList.contains("custom"));
    assert.equal(ref.current.querySelectorAll(".openui-entity-list__row").length, 4);
    assert.equal(ref.current.querySelector("strong").textContent, "Name");
    assert.equal(ref.current.querySelector("a").getAttribute("href"), "https://example.com");
    assert.equal(
      ref.current.querySelector(".openui-entity-list__cell-right--footer").textContent,
      "10",
    );
    await view.render(h(core.EntityList, { ...props, size: "small" }));
    assert.equal(ref.current.querySelectorAll(".openui-entity-list__row").length, 2);
    assert.equal(ref.current.querySelector(".openui-entity-list__row--header"), null);
    assert.equal(ref.current.querySelector(".openui-entity-list__row--footer"), null);
    await view.render(h(core.EntityList, { ref }));
    assert.equal(ref.current.textContent, "");
  } finally {
    await view.close();
  }
});
