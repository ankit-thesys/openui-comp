import assert from "node:assert/strict";
import test from "node:test";
import { act, core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h, createRef } = React;
// Standard jsdom globals required by Radix's public DOM APIs; no layout mocks.
globalThis.getComputedStyle = window.getComputedStyle.bind(window);
globalThis.CustomEvent = window.CustomEvent;
globalThis.Node = window.Node;
globalThis.MutationObserver = window.MutationObserver;
globalThis.requestAnimationFrame = (callback) => setTimeout(callback, 16);
globalThis.cancelAnimationFrame = clearTimeout;

test("Accordion expands and collapses through its public trigger, preserving refs and disabled state", async () => {
  assert.equal(typeof core.Accordion, "object", "public Accordion export");
  const rootRef = createRef(),
    triggerRef = createRef();
  const changes = [];
  const item = (value, disabled = false) =>
    h(
      core.AccordionItem,
      { value, disabled },
      h(core.AccordionTrigger, { text: value, ref: value === "Alpha" ? triggerRef : undefined }),
      h(core.AccordionContent, null, `${value} details`),
    );
  const view = await mount(
    h(
      core.Accordion,
      {
        type: "single",
        collapsible: true,
        ref: rootRef,
        onValueChange: (v) => changes.push(v),
        className: "consumer",
        style: { maxWidth: "420px" },
      },
      item("Alpha"),
      item("Beta", true),
    ),
  );
  try {
    const triggers = [...view.container.querySelectorAll("button")];
    assert.equal(rootRef.current, view.container.firstElementChild);
    assert.equal(triggerRef.current, triggers[0]);
    assert(rootRef.current.classList.contains("consumer"));
    assert.equal(rootRef.current.style.maxWidth, "420px");
    assert.equal(triggers[0].getAttribute("aria-expanded"), "false");
    await act(async () => triggers[0].click());
    assert.equal(triggers[0].getAttribute("aria-expanded"), "true");
    assert(view.container.textContent.includes("Alpha details"));
    await act(async () => triggers[0].click());
    assert.equal(triggers[0].getAttribute("aria-expanded"), "false");
    assert.equal(triggers[1].disabled, true);
    await act(async () => triggers[1].click());
    assert.deepEqual(changes, ["Alpha", ""]);
    assert(
      document.querySelector("#_goober")?.textContent.includes("openui-accordion-trigger"),
      "styles arrive automatically",
    );
  } finally {
    await view.close();
  }
});
