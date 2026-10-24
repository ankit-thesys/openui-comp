import assert from "node:assert/strict";
import test from "node:test";
import { act, core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h, createRef } = React;
test("TooltipWrapper leaves an empty tooltip's child interactive and preserves its ref and native props", async () => {
  assert.equal(typeof core.TooltipWrapper, "function", "public TooltipWrapper export");
  const ref = createRef();
  let clicks = 0;
  const view = await mount(
    h(
      core.TooltipWrapper,
      null,
      h("button", { ref, type: "button", id: "trigger", onClick: () => clicks++ }, "Details"),
    ),
  );
  try {
    const trigger = view.container.querySelector("button");
    assert.equal(ref.current, trigger);
    assert.equal(trigger.id, "trigger");
    await act(async () => trigger.click());
    assert.equal(clicks, 1);
    assert.equal(document.querySelector('[role="tooltip"]'), null);
    await view.render(
      h(core.TooltipWrapper, null, h("button", { ref, type: "button", disabled: true }, "Updated")),
    );
    assert.equal(ref.current.textContent, "Updated");
    assert.equal(ref.current.disabled, true);
  } finally {
    await view.close();
  }
});
