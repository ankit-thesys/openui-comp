import assert from "node:assert/strict";
import test from "node:test";
import { act, core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h, createRef } = React;

test("IconButton preserves native refs, icon, state updates and asChild interaction", async () => {
  assert(core.IconButton, "IconButton must be available from the public root");
  const ref = createRef();
  let clicks = 0;
  const icon = h("svg", { "data-icon": "check", "aria-hidden": true });
  const view = await mount(
    h(core.IconButton, {
      ref,
      icon,
      "aria-label": "Confirm",
      onClick: () => clicks++,
      size: "small",
      shape: "circle",
    }),
  );
  try {
    const button = view.container.querySelector("button");
    assert.equal(ref.current, button);
    assert.equal(button.getAttribute("aria-label"), "Confirm");
    assert(button.classList.contains("openui-icon-button-small"));
    assert(button.classList.contains("openui-icon-button-circle"));
    assert(button.querySelector('[data-icon="check"]'));
    await act(() => button.click());
    assert.equal(clicks, 1);
    await view.render(
      h(core.IconButton, {
        ref,
        icon,
        disabled: true,
        onClick: () => clicks++,
        appearance: "destructive",
        variant: "secondary",
      }),
    );
    assert(button.disabled);
    assert(button.classList.contains("openui-icon-button-destructive-secondary"));
    await act(() => button.click());
    assert.equal(clicks, 1);
    await view.render(
      h(
        core.IconButton,
        { icon, asChild: true, "aria-label": "Navigate" },
        h("a", { href: "#next" }, "Next"),
      ),
    );
    assert.equal(view.container.querySelector("button"), null);
    assert.equal(view.container.querySelector("a").getAttribute("href"), "#next");
    assert(view.container.querySelector("a svg"));
  } finally {
    await view.close();
  }
});
