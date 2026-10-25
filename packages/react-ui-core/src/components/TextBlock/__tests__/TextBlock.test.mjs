import assert from "node:assert/strict";
import test from "node:test";
import { core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h, createRef } = React;
test("TextBlockView preserves ref, defaults, rich text and tone/clamp/variant updates", async () => {
  assert(core.TextBlockView, "TextBlockView must be exported");
  const ref = createRef();
  const view = await mount(
    h(core.TextBlockView, {
      ref,
      primary: "**Title**",
      secondary: "*Details*",
      tertiary: "Hidden detail",
      className: "custom",
    }),
  );
  try {
    const block = view.container.firstElementChild;
    assert.equal(ref.current, block);
    for (const name of [
      "custom",
      "openui-text-block--title-text",
      "openui-text-block--type-text",
      "openui-text-block--size-sm",
      "openui-text-block--align-left",
    ])
      assert(block.classList.contains(name));
    assert.equal(block.querySelector(".openui-text-block__primary strong").textContent, "Title");
    assert.equal(block.querySelector(".openui-text-block__secondary em").textContent, "Details");
    assert.equal(block.querySelector(".openui-text-block__tertiary").textContent, "Hidden detail");
    await view.render(
      h(core.TextBlockView, {
        ref,
        primary: "42",
        secondary: "Down",
        variant: "highlight-text-number-subtext",
        type: "number",
        size: "lg",
        align: "right",
        secondaryTone: "negative",
        secondaryMaxLines: 2,
      }),
    );
    assert.equal(ref.current, block);
    for (const name of [
      "openui-text-block--highlight-text-number-subtext",
      "openui-text-block--type-number",
      "openui-text-block--size-lg",
      "openui-text-block--align-right",
    ])
      assert(block.classList.contains(name));
    const secondary = block.querySelector(".openui-text-block__secondary");
    assert.equal(secondary.tagName, "DIV");
    assert(secondary.classList.contains("openui-text-block__secondary--negative"));
    assert.equal(secondary.style.getPropertyValue("-webkit-line-clamp"), "2");
    assert.equal(secondary.style.overflow, "hidden");
    assert.equal(block.querySelector(".openui-text-block__tertiary"), null);
    await view.render(h(core.TextBlockView, { ref, primary: "Only primary" }));
    assert.equal(block.querySelector(".openui-text-block__secondary"), null);
  } finally {
    await view.close();
  }
});
