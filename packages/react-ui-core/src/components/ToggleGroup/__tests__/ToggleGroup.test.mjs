import assert from "node:assert/strict";
import test from "node:test";
import { act, core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h } = React;
test("Toggle group preserves multiple selection and disabled items", async () => {
  assert(core.ToggleGroup && core.ToggleItem, "Toggle family must be exported");
  const values = [];
  const view = await mount(
    h(
      core.ToggleGroup,
      { type: "multiple", defaultValue: ["a"], onValueChange: (v) => values.push(v) },
      h(core.ToggleItem, { value: "a" }, "A"),
      h(core.ToggleItem, { value: "b" }, "B"),
      h(core.ToggleItem, { value: "c", disabled: true }, "C"),
    ),
  );
  try {
    const buttons = view.container.querySelectorAll("button");
    assert.equal(buttons[0].getAttribute("aria-pressed"), "true");
    await act(() => buttons[1].click());
    assert.deepEqual(values, [["a", "b"]]);
    await act(() => buttons[2].click());
    assert.equal(values.length, 1);
    await act(() => buttons[0].click());
    assert.deepEqual(values[1], ["b"]);
  } finally {
    await view.close();
  }
});
