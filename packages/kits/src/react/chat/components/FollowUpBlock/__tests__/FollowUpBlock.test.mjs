import assert from "node:assert/strict";
import test from "node:test";
import { act, kit, mount, React } from "../../FollowUpItem/__tests__/consumer.mjs";

const { createElement: h, createRef } = React;

test("FollowUpBlock forwards container props and renders related queries in order", async () => {
  const ref = createRef();
  const props = {
    ref,
    className: "consumer-block",
    style: { width: "320px" },
    "aria-label": "Queries",
  };
  let submitted = "";
  const item = (text) =>
    h(kit.FollowUpItem, {
      key: text,
      text,
      onClick: () => {
        submitted = text;
      },
    });
  const view = await mount(h(kit.FollowUpBlock, props, [item("Explain"), item("Compare")]));
  try {
    const block = ref.current;
    assert.equal(block.getAttribute("aria-label"), "Queries");
    assert.equal(block.style.width, "320px");
    assert(block.classList.contains("consumer-block"));
    assert(block.classList.contains("openui-follow-up-block"));
    assert.equal(block.firstElementChild.textContent, "Related Queries");
    assert.deepEqual(
      [...block.querySelectorAll("button")].map((el) => el.textContent),
      ["Explain", "Compare"],
    );
    await act(async () => block.querySelectorAll("button")[1].click());
    assert.equal(submitted, "Compare");
    await view.render(h(kit.FollowUpBlock, props, item("Refreshed")));
    assert.equal(ref.current, block);
    assert.equal(block.querySelectorAll("button").length, 1);
    assert.equal(block.lastElementChild.textContent, "Refreshed");
  } finally {
    await view.close();
  }
});
