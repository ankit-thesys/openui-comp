import assert from "node:assert/strict";
import test from "node:test";
import { act, core, mount, React } from "../../Button/__tests__/consumer.mjs";
globalThis.HTMLFormElement = window.HTMLFormElement;
const { createElement: h, createRef } = React;
test("Switch group preserves controlled values, labels, refs and disabled behavior", async () => {
  assert(core.SwitchGroup && core.SwitchItem, "Switch family must be exported");
  const ref = createRef();
  const values = [];
  const render = (checked, disabled = false) =>
    h(
      core.SwitchGroup,
      { variant: "sunk" },
      h(core.SwitchItem, {
        ref,
        label: "Notify",
        description: "Email",
        checked,
        disabled,
        onChange: (v) => values.push(v),
      }),
    );
  const view = await mount(render(false));
  try {
    const button = view.container.querySelector('[role="switch"]');
    assert.equal(ref.current, button);
    await act(() => button.click());
    assert.deepEqual(values, [true]);
    assert.equal(button.getAttribute("aria-checked"), "false");
    await view.render(render(true, true));
    assert.equal(button.getAttribute("aria-checked"), "true");
    await act(() => button.click());
    assert.deepEqual(values, [true]);
    assert.equal(view.container.querySelector("label").htmlFor, button.id);
  } finally {
    await view.close();
  }
});
