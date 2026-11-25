import assert from "node:assert/strict";
import test from "node:test";
import { act, core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h, createRef } = React;

test("Input retains native input/ref, size, error and styles APIs", async () => {
  const ref = createRef();
  let changes = 0;
  const props = {
    ref,
    size: "small",
    hasError: true,
    className: "consumer-input",
    styles: { padding: "23px" },
    "aria-label": "Name",
    defaultValue: "Ankit",
    onInput: () => changes++,
  };
  const view = await mount(h(core.Input, props));
  try {
    const input = view.container.querySelector("input");
    assert(input, "root Input renders a native input");
    assert.equal(ref.current, input);
    assert.equal(input.value, "Ankit");
    assert.equal(input.autocomplete, "off");
    assert.equal(input.getAttribute("aria-label"), "Name");
    for (const name of [
      "openui-input",
      "openui-input-small",
      "openui-input-error",
      "consumer-input",
    ])
      assert(input.classList.contains(name));
    assert.equal(input.style.padding, "23px");
    await act(async () => input.dispatchEvent(new Event("input", { bubbles: true })));
    assert.equal(changes, 1);
    await view.render(
      h(core.Input, {
        ...props,
        size: undefined,
        hasError: false,
        style: { padding: "31px" },
        autoComplete: "name",
        disabled: true,
      }),
    );
    assert(input.classList.contains("openui-input-medium"));
    assert(!input.classList.contains("openui-input-error"));
    assert.equal(
      input.style.padding,
      "31px",
      "native style keeps its existing precedence over styles",
    );
    assert.equal(input.autocomplete, "name");
    assert.equal(input.disabled, true);
  } finally {
    await view.close();
  }
});
