import assert from "node:assert/strict";
import test from "node:test";
import { core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h } = React;
test("InlineHeader preserves empty, heading and description markdown with class customization", async () => {
  assert(core.InlineHeader, "InlineHeader must be exported");
  const view = await mount(h(core.InlineHeader, {}));
  try {
    assert.equal(view.container.innerHTML, "");
    await view.render(
      h(core.InlineHeader, {
        heading: "**Heading**",
        description: "*Description*",
        className: "custom",
      }),
    );
    assert(view.container.firstElementChild.classList.contains("custom"));
    assert.equal(
      view.container.querySelector(".openui-inline-header-heading strong").textContent,
      "Heading",
    );
    assert.equal(
      view.container.querySelector(".openui-inline-header-description em").textContent,
      "Description",
    );
    await view.render(h(core.InlineHeader, { description: "Description only" }));
    assert.equal(view.container.querySelector(".openui-inline-header-heading"), null);
    assert.equal(
      view.container.querySelector(".openui-inline-header-description").textContent,
      "Description only",
    );
  } finally {
    await view.close();
  }
});
