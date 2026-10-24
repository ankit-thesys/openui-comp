import assert from "node:assert/strict";
import test from "node:test";
import { act, core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h, createRef } = React;
test("Foldable sections preserve public parts, refs, controlled expansion and native trigger behavior", async () => {
  assert(core.FoldableSectionRoot && core.SectionV2, "SectionBlock public parts must be exported");
  const rootRef = createRef(),
    triggerRef = createRef();
  const values = [];
  const render = (value) =>
    h(
      core.FoldableSectionRoot,
      { ref: rootRef, type: "multiple", value, onValueChange: (v) => values.push(v) },
      h(
        core.FoldableSectionItem,
        { value: "a" },
        h(core.FoldableSectionTrigger, {
          ref: triggerRef,
          text: "Details",
          "aria-label": "Details",
        }),
        h(core.FoldableSectionContent, null, "Body"),
      ),
    );
  const view = await mount(render([]));
  try {
    const trigger = view.container.querySelector("button");
    assert.equal(rootRef.current, view.container.firstElementChild);
    assert.equal(triggerRef.current, trigger);
    assert.equal(trigger.getAttribute("aria-expanded"), "false");
    assert.equal(
      trigger.querySelector("button"),
      null,
      "IconButton must not nest an interactive button",
    );
    await act(() => trigger.click());
    assert.deepEqual(values, [["a"]]);
    assert.equal(trigger.getAttribute("aria-expanded"), "false");
    await view.render(render(["a"]));
    assert.equal(trigger.getAttribute("aria-expanded"), "true");
    assert.equal(
      view.container.querySelector(".openui-foldable-section-content").textContent,
      "Body",
    );
    await view.render(h(core.SectionV2, { trigger: "Summary" }, h("p", null, "Content")));
    assert.equal(
      view.container.querySelector(".openui-section-v2-header-trigger").textContent,
      "Summary",
    );
    assert.equal(view.container.querySelector(".openui-section-v2-content").textContent, "Content");
  } finally {
    await view.close();
  }
});
