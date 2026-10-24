import assert from "node:assert/strict";
import test from "node:test";
import { act, core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h, createRef } = React;

test("TextArea retains rows, ref, native props, error state and text entry", async () => {
  const ref = createRef();
  let changes = 0;
  const props = {
    ref,
    className: "consumer-notes",
    hasError: true,
    placeholder: "Notes",
    defaultValue: "Hello",
    style: { padding: "29px" },
    onInput: () => changes++,
  };
  const view = await mount(h(core.TextArea, props));
  try {
    const textarea = view.container.querySelector("textarea");
    assert(textarea, "root TextArea renders a native textarea");
    assert.equal(ref.current, textarea);
    assert.equal(textarea.rows, 3);
    assert.equal(textarea.value, "Hello");
    assert.equal(textarea.placeholder, "Notes");
    assert.equal(textarea.style.padding, "29px");
    for (const name of ["openui-textarea", "openui-textarea-error", "consumer-notes"])
      assert(textarea.classList.contains(name));
    await act(async () => textarea.dispatchEvent(new Event("input", { bubbles: true })));
    assert.equal(changes, 1);
    await view.render(h(core.TextArea, { ...props, rows: 7, hasError: false, disabled: true }));
    assert.equal(textarea.rows, 7);
    assert.equal(textarea.disabled, true);
    assert(!textarea.classList.contains("openui-textarea-error"));
  } finally {
    await view.close();
  }
});
