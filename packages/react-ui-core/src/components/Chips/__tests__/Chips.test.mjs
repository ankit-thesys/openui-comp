import assert from "node:assert/strict";
import test from "node:test";
import { act, core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h, createRef } = React;

test("Chips preserves controlled selection, refs, filtering and native disabled behavior", async () => {
  const ref = createRef(),
    toggles = [];
  const items = [
    { value: "", label: "Invalid" },
    { value: "a", label: "Alpha", icon: h("svg", { "aria-label": "Icon" }) },
    { value: "b", label: "Beta", disabled: true },
  ];
  const props = {
    ref,
    items,
    selected: ["a"],
    onToggle: (value) => toggles.push(value),
    className: "consumer",
    style: { gap: "19px" },
    "aria-label": "Choices",
  };
  const view = await mount(h(core.Chips, props));
  try {
    const list = view.container.querySelector('[role="listbox"]'),
      choices = [...view.container.querySelectorAll('[role="option"]')];
    assert.equal(ref.current, list);
    assert.equal(list.getAttribute("aria-multiselectable"), "true");
    assert(list.classList.contains("consumer"));
    assert.equal(list.style.gap, "19px");
    assert.equal(choices.length, 2);
    assert.equal(choices[0].getAttribute("aria-selected"), "true");
    await act(async () => {
      choices[0].click();
      choices[1].click();
    });
    assert.deepEqual(toggles, ["a"]);
    await view.render(h(core.Chips, { ...props, selected: [], disabled: true, type: "single" }));
    assert.equal(list.getAttribute("aria-multiselectable"), "false");
    assert.equal(choices[0].getAttribute("aria-selected"), "false");
    assert(choices.every((choice) => choice.disabled));
    assert(
      document.querySelector("#_goober")?.textContent.includes("openui-chip-item"),
      "styles arrive without a consumer CSS import",
    );
  } finally {
    await view.close();
  }
});
