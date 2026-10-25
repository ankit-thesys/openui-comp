import assert from "node:assert/strict";
import test from "node:test";
import { core, mount, React } from "../../../Button/__tests__/consumer.mjs";
const { createElement: h } = React;

test("area empty data preserves its public empty state, class hook and live empty updates", async () => {
  assert.equal(typeof core.AreaChart, "function", "AreaChart public root export");
  const view = await mount(
    h(core.AreaChart, { data: [], categoryKey: "name", className: "consumer" }),
  );
  try {
    assert.equal(view.container.textContent, "No data available");
    assert(view.container.firstElementChild.classList.contains("openui-area-chart-container"));
    assert(view.container.firstElementChild.classList.contains("consumer"));
    assert.equal(view.container.querySelector("svg"), null);
    await view.render(
      h(core.AreaChart, { data: undefined, categoryKey: "name", className: "updated" }),
    );
    assert.equal(view.container.textContent, "No data available");
    assert(view.container.firstElementChild.classList.contains("updated"));
  } finally {
    await view.close();
  }
});
