import assert from "node:assert/strict";
import test from "node:test";
import { core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h, createRef } = React;
test("Label preserves association, required marker, disabled class and native ref", async () => {
  assert(core.Label, "Label must be exported");
  const ref = createRef();
  const view = await mount(
    h(core.Label, { ref, htmlFor: "email", required: true, disabled: true }, "Email"),
  );
  try {
    const label = view.container.querySelector("label");
    assert.equal(ref.current, label);
    assert.equal(label.htmlFor, "email");
    assert.equal(label.textContent, "Email*");
    assert(label.classList.contains("openui-label-disabled"));
  } finally {
    await view.close();
  }
});
