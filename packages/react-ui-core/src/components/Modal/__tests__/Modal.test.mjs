import assert from "node:assert/strict";
import test from "node:test";
import { act, core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h } = React;
test("Modal opens in a body portal, focuses its dialog and reports dismissal through the controlled callback", async () => {
  assert.equal(typeof core.Modal, "function", "public Modal export");
  const events = [];
  const render = (open, size = "md") =>
    h(
      core.Modal,
      { open, size, title: "Review", onOpenChange: (value) => events.push(value) },
      h("button", { type: "button" }, "Action"),
    );
  const view = await mount(render(false));
  try {
    assert.equal(document.querySelector('[role="dialog"]'), null);
    await view.render(render(true));
    const dialog = document.querySelector('[role="dialog"]');
    assert(dialog);
    assert.equal(
      view.container.querySelector('[role="dialog"]'),
      null,
      "portal is outside consumer container",
    );
    assert.equal(document.activeElement, dialog);
    assert.equal(dialog.getAttribute("aria-modal"), "true");
    assert.equal(
      document.getElementById(dialog.getAttribute("aria-labelledby")).textContent,
      "Review",
    );
    await act(async () => dialog.querySelector('[aria-label="Close"]').click());
    assert.deepEqual(events, [false]);
    assert.equal(
      document.querySelector('[role="dialog"]'),
      dialog,
      "controlled open remains pinned until consumer updates",
    );
    await act(async () =>
      document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true })),
    );
    await act(async () => document.querySelector(".openui-modal-overlay").click());
    assert.deepEqual(events, [false, false, false]);
    await view.render(render(true, "lg"));
    assert(dialog.classList.contains("openui-modal-lg"));
    await view.render(render(false));
    assert.equal(document.querySelector('[role="dialog"]'), null);
    assert(
      document.querySelector("#_goober")?.textContent.includes("openui-modal-sr-only"),
      "owned styles arrive without CSS imports",
    );
  } finally {
    await view.close();
  }
});
