import assert from "node:assert/strict";
import test from "node:test";
import { core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h } = React;
test("metric variants preserve previous values, trend signs, subtext placement and refs", async () => {
  assert(core.MetricIndicatorWithStrikethrough, "public strikethrough metric");
  assert(core.MetricIndicatorInline, "public inline metric");
  const ref = React.createRef();
  const view = await mount(
    h(core.MetricIndicatorWithStrikethrough, {
      ref,
      value: "42",
      previousValue: "50",
      subtext: "per day",
      trend: { direction: "down", value: -2 },
      className: "custom",
    }),
  );
  try {
    assert.equal(ref.current, view.container.firstElementChild);
    assert(ref.current.classList.contains("custom"));
    assert.equal(
      ref.current.querySelector(".openui-metric-indicator__previous-value").textContent,
      "50",
    );
    assert.equal(ref.current.querySelector(".openui-metric-indicator__trend").textContent, "--2%");
    assert.equal(
      ref.current.querySelector(".openui-metric-indicator__subtext").parentElement,
      ref.current,
    );
    await view.render(
      h(core.MetricIndicatorInline, {
        ref,
        value: "0",
        subtext: "today",
        trend: { direction: "up", value: 0 },
      }),
    );
    assert.equal(ref.current.querySelector(".openui-metric-indicator__trend").textContent, "+0%");
    assert.equal(ref.current.querySelector(".openui-metric-indicator__previous-value"), null);
    assert.equal(
      ref.current.querySelector(".openui-metric-indicator__subtext").parentElement.className,
      "openui-metric-indicator__row",
    );
    await view.render(h(core.MetricIndicatorInline, { ref, value: "12" }));
    assert.equal(ref.current.querySelector(".openui-metric-indicator__trend"), null);
    assert.equal(ref.current.querySelector(".openui-metric-indicator__subtext"), null);
  } finally {
    await view.close();
  }
  assert.equal(ref.current, null);
});
