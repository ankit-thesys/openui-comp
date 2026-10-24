import assert from "node:assert/strict";
import test from "node:test";
import { act, core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h } = React;
test("listed source items support Enter and Space navigation with consumer callbacks", async () => {
  assert(core.ListedSourceItem, "public ListedSourceItem export");
  const calls = [];
  const previous = window.open;
  window.open = (...args) => {
    calls.push(args);
    return null;
  };
  let selected = 0;
  const view = await mount(
    h(core.ListedSourceItem, {
      title: "Reference",
      sourceName: "Docs",
      faviconUrl: "",
      sourceId: 3,
      url: "https://example.com",
      onClick: () => selected++,
    }),
  );
  try {
    const item = view.container.querySelector('[role="button"]');
    assert.equal(item.tabIndex, 0);
    assert.equal(item.dataset.sourceId, "3");
    for (const key of ["Enter", " "])
      await act(async () =>
        item.dispatchEvent(
          new window.KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }),
        ),
      );
    assert.equal(selected, 2);
    assert.deepEqual(
      calls,
      Array(2).fill(["https://example.com", "_blank", "noopener,noreferrer"]),
    );
  } finally {
    window.open = previous;
    await view.close();
  }
});
test("empty source lists do not render a misleading sources heading", async () => {
  assert(core.ListedSources, "public ListedSources export");
  assert(core.Sources, "public Sources export");
  const view = await mount(
    h(React.Fragment, null, h(core.ListedSources, { sources: [] }), h(core.Sources)),
  );
  try {
    assert.equal(view.container.textContent, "");
  } finally {
    await view.close();
  }
});
