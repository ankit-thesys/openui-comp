import assert from "node:assert/strict";
import test from "node:test";
import { core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h } = React;
test("public standalone stacked legend preserves rows, callbacks, formatting and show-more updates", async () => {
  assert(core.StackedLegend, "StackedLegend public root export");
  assert.equal(core.CHART_CLASS_PREFIX, "openui");
  const items = Array.from({ length: 8 }, (_, i) => ({
    key: String(i),
    label: `Item ${i}`,
    color: "#123456",
    value: i + 1,
  }));
  const calls = [];
  const props = {
    items,
    layout: "showMore",
    onItemToggle: (key) => calls.push(key),
    className: "consumer-legend",
    style: { width: 300 },
  };
  const view = await mount(h(core.StackedLegend, props));
  try {
    const rows = () => view.container.querySelectorAll(".openui-stacked-legend__item");
    assert.equal(rows().length, 6);
    assert.equal(
      view.container.querySelector(".openui-stacked-legend__item-value").textContent,
      "2.8%",
    );
    await React.act(async () => rows()[1].click());
    assert.deepEqual(calls, ["1"]);
    await React.act(async () => view.container.querySelector("button").click());
    assert.equal(rows().length, 8);
    assert.equal(view.container.querySelector("button").textContent, "Show less");
    await React.act(async () => view.container.querySelector("button").click());
    assert.equal(rows().length, 6);
    await view.render(
      h(core.StackedLegend, { ...props, format: "number", hiddenKeys: new Set(["0"]) }),
    );
    assert.equal(rows()[0].style.opacity, "0.3");
    assert.equal(
      view.container.querySelector(".openui-stacked-legend__item-value").textContent,
      "1",
    );
    assert.equal(view.container.firstElementChild.style.width, "300px");
    await view.render(h(core.StackedLegend, { items: [], layout: "showMore" }));
    assert.equal(rows().length, 0);
  } finally {
    await view.close();
  }
});
test("public print context stays distinct from legend state and absent-provider fallback", async () => {
  assert(core.PrintContextProvider, "PrintContextProvider public root export");
  assert(core.PrintContext, "PrintContext public root export");
  assert(core.LegendStoreProvider, "LegendStoreProvider public root export");
  function Read() {
    const print = core.usePrintContext();
    const legend = core.useLegendEntry(undefined);
    return h("output", null, `${Boolean(print)}/${legend === undefined}`);
  }
  const view = await mount(h(Read));
  try {
    assert.equal(view.container.textContent, "false/true");
    await view.render(
      h(
        core.PrintContextProvider,
        null,
        h(
          core.LegendStoreProvider,
          { legendKey: "one" },
          h(Read),
          h(core.StackedLegend, { legendKey: "one" }),
        ),
      ),
    );
    assert.equal(view.container.textContent, "true/true");
  } finally {
    await view.close();
  }
});
