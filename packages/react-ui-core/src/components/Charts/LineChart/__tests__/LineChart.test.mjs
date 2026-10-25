import assert from "node:assert/strict";
import test from "node:test";
import { core, mount, React } from "../../../Button/__tests__/consumer.mjs";
const { createElement: h } = React;

test("line empty data preserves its public empty state, class hook and live empty updates", async () => {
  assert.equal(typeof core.LineChart, "function", "LineChart public root export");
  const view = await mount(
    h(core.LineChart, { data: [], categoryKey: "name", className: "consumer" }),
  );
  try {
    assert.equal(view.container.textContent, "No data available");
    assert(view.container.firstElementChild.classList.contains("openui-line-chart-container"));
    assert(view.container.firstElementChild.classList.contains("consumer"));
    assert.equal(view.container.querySelector("svg"), null);
    await view.render(
      h(core.LineChart, { data: undefined, categoryKey: "name", className: "updated" }),
    );
    assert.equal(view.container.textContent, "No data available");
    assert(view.container.firstElementChild.classList.contains("updated"));
  } finally {
    await view.close();
  }
});

test("line condensed wrapper preserves the same empty-state forwarding", async () => {
  const view = await mount(
    h(core.LineChartCondensed, { data: [], categoryKey: "name", className: "condensed-consumer" }),
  );
  try {
    assert.equal(view.container.textContent, "No data available");
    assert(view.container.firstElementChild.classList.contains("condensed-consumer"));
  } finally {
    await view.close();
  }
});
