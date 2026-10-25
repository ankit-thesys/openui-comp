import assert from "node:assert/strict";
import test from "node:test";
import { act, kit, mount, React } from "./consumer.mjs";

const { createElement: h, createRef } = React;

test("FollowUpItem preserves native props, refs, text/icon order and disabled clicks through the chat import", async () => {
  const ref = createRef();
  let clicks = 0;
  const props = {
    ref,
    text: "Explain the result",
    icon: h("span", null, "→"),
    type: "button",
    className: "consumer-follow-up",
    style: { marginTop: "9px" },
    "aria-label": "Ask a follow-up",
    onClick: () => clicks++,
  };
  const view = await mount(h(kit.FollowUpItem, props));
  try {
    const button = view.container.querySelector("button");
    assert.equal(ref.current, button);
    assert.equal(button.type, "button");
    assert.equal(button.textContent, "Explain the result→");
    assert.equal(button.getAttribute("aria-label"), "Ask a follow-up");
    assert.equal(button.style.marginTop, "9px");
    assert(button.classList.contains("openui-follow-up-item"));
    assert(button.classList.contains("consumer-follow-up"));
    await act(async () => button.click());
    assert.equal(clicks, 1);
    await view.render(h(kit.FollowUpItem, { ...props, disabled: true, text: "Updated" }));
    button.click();
    assert.equal(clicks, 1);
    assert.equal(button.textContent, "Updated→");
    assert(document.querySelector("#_goober")?.textContent, "styles arrive without a CSS import");
  } finally {
    await view.close();
  }
});
