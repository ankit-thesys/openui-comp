import assert from "node:assert/strict";
import test from "node:test";
import { core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h } = React;
test("tag blocks preserve child order, consumer styles and refs", async () => {
  assert(core.TagBlock, "public TagBlock export");
  const ref = React.createRef();
  const view = await mount(
    h(
      core.TagBlock,
      { ref, className: "consumer", styles: { gap: 11 } },
      h(core.Tag, { text: "One" }),
      h(core.Tag, { text: "Two" }),
    ),
  );
  try {
    assert.equal(ref.current.textContent, "OneTwo");
    assert.equal(ref.current.style.gap, "11px");
    assert(ref.current.classList.contains("consumer"));
  } finally {
    await view.close();
  }
});
