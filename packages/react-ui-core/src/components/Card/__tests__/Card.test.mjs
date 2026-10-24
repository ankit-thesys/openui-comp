import assert from "node:assert/strict";
import test from "node:test";
import { act, core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h, createRef } = React;
test("Card preserves native props, ref, children and variant/width updates", async () => {
  assert(core.Card, "Card must be exported");
  const ref = createRef();
  let clicks = 0;
  const view = await mount(
    h(
      core.Card,
      { ref, id: "card", role: "region", style: { padding: 13 }, onClick: () => clicks++ },
      "Content",
    ),
  );
  try {
    const card = view.container.firstElementChild;
    assert.equal(ref.current, card);
    assert.equal(card.id, "card");
    assert.equal(card.getAttribute("role"), "region");
    assert.equal(card.textContent, "Content");
    assert.equal(card.style.padding, "13px");
    assert(card.classList.contains("openui-card-card"));
    assert(card.classList.contains("openui-card-standard"));
    await act(() => card.click());
    assert.equal(clicks, 1);
    await view.render(h(core.Card, { ref, variant: "sunk", width: "full" }, "Updated"));
    assert.equal(ref.current, card);
    assert(card.classList.contains("openui-card-sunk"));
    assert(card.classList.contains("openui-card-full"));
    assert.equal(card.textContent, "Updated");
  } finally {
    await view.close();
  }
});
