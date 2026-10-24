import assert from "node:assert/strict";
import test from "node:test";
import { act, core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h, createRef } = React;
test("Buttons preserves layout, native attributes and child interactions", async () => {
  assert(core.Buttons, "Buttons must be exported");
  const ref = createRef();
  let clicks = 0;
  const view = await mount(
    h(
      core.Buttons,
      { ref, variant: "vertical", "aria-label": "Actions" },
      h(core.Button, { onClick: () => clicks++ }, "Save"),
    ),
  );
  try {
    assert.equal(ref.current, view.container.firstElementChild);
    assert(ref.current.classList.contains("openui-buttons-vertical"));
    assert.equal(ref.current.getAttribute("aria-label"), "Actions");
    await act(() => view.container.querySelector("button").click());
    assert.equal(clicks, 1);
  } finally {
    await view.close();
  }
});
