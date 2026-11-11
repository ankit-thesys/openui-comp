import assert from "node:assert/strict";
import test from "node:test";
import { act, core, mount, React } from "./consumer.mjs";
const { createElement: h, createRef } = React;

test("Button preserves refs, icon order, native events and disabled semantics through the root import", async () => {
  const ref = createRef();
  let clicks = 0;
  const props = {
    ref,
    type: "submit",
    className: "consumer-button",
    "aria-label": "Save record",
    onClick: () => clicks++,
    iconLeft: h("span", null, "Left"),
    iconRight: h("span", null, "Right"),
  };
  const view = await mount(h(core.Button, props, "Save"));
  try {
    const button = view.container.querySelector("button");
    assert(button, "root Button renders a native button");
    assert.equal(ref.current, button);
    assert.equal(button.type, "submit");
    assert.equal(button.textContent, "LeftSaveRight");
    assert.equal(button.getAttribute("aria-label"), "Save record");
    for (const name of [
      "openui-button-base",
      "openui-button-base-primary",
      "openui-button-base-medium",
      "consumer-button",
    ])
      assert(button.classList.contains(name));
    await act(async () => button.click());
    assert.equal(clicks, 1);
    await view.render(h(core.Button, { ...props, disabled: true }, "Save"));
    button.click();
    assert.equal(clicks, 1);
    assert(document.querySelector("#_goober")?.textContent, "styles arrive without a CSS import");
  } finally {
    await view.close();
  }
});
