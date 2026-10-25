import assert from "node:assert/strict";
import test from "node:test";
import { core, mount, React } from "../../../Button/__tests__/consumer.mjs";
const { createElement: h } = React;

test("bar empty data preserves its public empty state, class hook and live empty updates", async () => {
  assert.equal(typeof core.BarChart, "function", "BarChart public root export");
  const view = await mount(
    h(core.BarChart, { data: [], categoryKey: "name", className: "consumer" }),
  );
  try {
    assert.equal(view.container.textContent, "No data available");
    assert(view.container.firstElementChild.classList.contains("openui-bar-chart-container"));
    assert(view.container.firstElementChild.classList.contains("consumer"));
    assert.equal(view.container.querySelector("svg"), null);
    await view.render(
      h(core.BarChart, { data: undefined, categoryKey: "name", className: "updated" }),
    );
    assert.equal(view.container.textContent, "No data available");
    assert(view.container.firstElementChild.classList.contains("updated"));
  } finally {
    await view.close();
  }
});

test("bar condensed and horizontal wrappers retain the common hook-free empty boundary", async () => {
  for (const Component of [core.BarChartCondensed, core.HorizontalBarChart]) {
    assert.equal(typeof Component, "function");
    const view = await mount(
      h(Component, {
        data: [],
        categoryKey: "name",
        className: "wrapper-consumer",
        orientation: "horizontal",
      }),
    );
    try {
      assert.equal(view.container.textContent, "No data available");
      assert(view.container.firstElementChild.classList.contains("openui-bar-chart-container"));
      assert(view.container.firstElementChild.classList.contains("wrapper-consumer"));
    } finally {
      await view.close();
    }
  }
});
