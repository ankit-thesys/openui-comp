import assert from "node:assert/strict";
import test from "node:test";
import { core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h, createRef } = React;
globalThis.HTMLFormElement = window.HTMLFormElement;
globalThis.DocumentFragment = window.DocumentFragment;
globalThis.CustomEvent = window.CustomEvent;

test("Select retains public parts, trigger refs, size updates, native attributes and disabled state", async () => {
  const ref = createRef();
  const tree = (size, disabled) =>
    h(
      core.Select,
      { defaultValue: "a", size, disabled },
      h(
        core.SelectTrigger,
        { ref, className: "consumer", style: { width: "210px" }, "aria-label": "Plan" },
        h(core.SelectValue, { placeholder: "Choose" }),
      ),
    );
  const view = await mount(tree("sm", false));
  try {
    const trigger = view.container.querySelector('[role="combobox"]');
    assert.equal(ref.current, trigger);
    assert.equal(trigger.getAttribute("aria-label"), "Plan");
    assert(trigger.classList.contains("openui-select-trigger-sm"));
    assert(trigger.classList.contains("consumer"));
    assert.equal(trigger.style.width, "210px");
    assert.equal(trigger.getAttribute("data-state"), "closed");
    await view.render(tree("lg", true));
    assert(trigger.classList.contains("openui-select-trigger-lg"));
    assert.equal(trigger.disabled, true);
    for (const name of [
      "SelectContent",
      "SelectGroup",
      "SelectItem",
      "SelectLabel",
      "SelectSeparator",
    ])
      assert(core[name], name);
  } finally {
    await view.close();
  }
});
