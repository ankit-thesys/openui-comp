import assert from "node:assert/strict";
import test from "node:test";
import { act, core, mount, React } from "../../Button/__tests__/consumer.mjs";
globalThis.getComputedStyle = window.getComputedStyle.bind(window);
const { createElement: h, createRef } = React;
test("Checkbox group preserves ref, labels, state changes and disabled behavior", async () => {
  assert(core.CheckBoxGroup && core.CheckBoxItem, "Checkbox family must be exported");
  const ref = createRef();
  const values = [];
  const render = (disabled = false) =>
    h(
      core.CheckBoxGroup,
      { variant: "card" },
      h(core.CheckBoxItem, {
        ref,
        label: "Agree",
        description: "Terms",
        defaultChecked: false,
        disabled,
        onChange: (v) => values.push(v),
      }),
    );
  const view = await mount(render());
  try {
    const button = view.container.querySelector('[role="checkbox"]');
    assert.equal(ref.current, button);
    assert.equal(button.getAttribute("aria-checked"), "false");
    await act(() => button.click());
    assert.equal(button.getAttribute("aria-checked"), "true");
    assert.deepEqual(values, [true]);
    await view.render(render(true));
    await act(() => button.click());
    assert.deepEqual(values, [true]);
    assert(button.disabled);
    assert.equal(view.container.querySelector("label").htmlFor, button.id);
  } finally {
    await view.close();
  }
});
