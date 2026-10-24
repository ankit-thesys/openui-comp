import assert from "node:assert/strict";
import test from "node:test";
import { core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h, createRef } = React;
test("FormControl propagates errors and Hint allows an explicit override", async () => {
  assert(core.FormControl && core.Hint, "FormControl and Hint must be exported");
  const ref = createRef();
  const view = await mount(
    h(
      core.FormControl,
      { ref, hasError: true },
      h(core.Input, { placeholder: "Email" }),
      h(core.Hint, null, "Invalid"),
      h(core.Hint, { hasError: false }, "Help"),
    ),
  );
  try {
    assert.equal(ref.current, view.container.firstElementChild);
    assert(view.container.querySelector("input").classList.contains("openui-input-error"));
    const hints = view.container.querySelectorAll(".openui-hint");
    assert(hints[0].classList.contains("openui-hint-error"));
    assert(!hints[1].classList.contains("openui-hint-error"));
  } finally {
    await view.close();
  }
});
