import assert from "node:assert/strict";
import test from "node:test";
import { act, core, mount, React } from "../../Button/__tests__/consumer.mjs";
globalThis.HTMLFormElement = window.HTMLFormElement;
const { createElement: h, createRef } = React;
test("Radio group preserves controlled selection, native refs and disabled options", async () => {
  assert(core.RadioGroup && core.RadioItem, "Radio family must be exported");
  const ref = createRef();
  const values = [];
  const render = (value) =>
    h(
      core.RadioGroup,
      { value, onValueChange: (v) => values.push(v) },
      h(core.RadioItem, { ref, value: "a", label: "A" }),
      h(core.RadioItem, { value: "b", label: "B" }),
      h(core.RadioItem, { value: "c", label: "C", disabled: true }),
    );
  const view = await mount(render("a"));
  try {
    const buttons = view.container.querySelectorAll('[role="radio"]');
    assert.equal(ref.current, buttons[0]);
    assert.equal(buttons[0].getAttribute("aria-checked"), "true");
    await act(() => buttons[1].click());
    assert.deepEqual(values, ["b"]);
    assert.equal(buttons[0].getAttribute("aria-checked"), "true");
    await view.render(render("b"));
    assert.equal(buttons[1].getAttribute("aria-checked"), "true");
    await act(() => buttons[2].click());
    assert.deepEqual(values, ["b"]);
  } finally {
    await view.close();
  }
});
