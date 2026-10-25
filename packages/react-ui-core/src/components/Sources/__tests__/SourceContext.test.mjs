import assert from "node:assert/strict";
import test from "node:test";
import { core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h } = React;
test("source providers enrich valid URLs, isolate nested consumers and update without stale sources", async () => {
  assert.equal(typeof core.CardSourceProvider, "function");
  const Reader = ({ name }) =>
    h("output", { "data-reader": name }, JSON.stringify(core.useCardSourceContext()));
  const outer = [{ title: "Reference", sourceName: "Docs", url: "https://docs.example.com/page" }];
  const tree = (sources) =>
    h(
      core.CardSourceProvider,
      { sources },
      h(Reader, { name: "outer" }),
      h(
        core.CardSourceProvider,
        { sources: [{ title: "Local", sourceName: "Notes" }] },
        h(Reader, { name: "inner" }),
      ),
    );
  const view = await mount(h(React.Fragment, null, h(Reader, { name: "empty" }), tree(outer)));
  const read = (name) =>
    JSON.parse(view.container.querySelector(`[data-reader="${name}"]`).textContent);
  try {
    assert.deepEqual(read("empty"), []);
    assert.deepEqual(read("outer"), [
      {
        ...outer[0],
        faviconUrl: "https://www.google.com/s2/favicons?sz=128&domain=docs.example.com",
      },
    ]);
    assert.deepEqual(read("inner"), [{ title: "Local", sourceName: "Notes", faviconUrl: "" }]);
    await view.render(tree(undefined));
    assert.deepEqual(read("outer"), []);
    assert.equal(core.CardSourceSchema.safeParse({ title: "A", sourceName: "B" }).success, true);
    assert.equal(core.CardSourceSchema.safeParse({ title: 2, sourceName: "B" }).success, false);
    assert.equal(core.getFaviconUrl("not a URL"), "");
  } finally {
    await view.close();
  }
});
test("opening a source rejects executable URL schemes and preserves safe opening defaults", () => {
  const calls = [];
  const previous = window.open;
  window.open = (...args) => {
    calls.push(args);
    return null;
  };
  try {
    for (const url of [
      undefined,
      "",
      " javascript:alert(1)",
      "java\tscript:alert(1)",
      "DATA:text/html,a",
      "vbscript:x",
      "file:///tmp/x",
    ])
      core.openSourceInNewTab(url);
    assert.deepEqual(calls, []);
    core.openSourceInNewTab(" https://example.com/reference ");
    assert.deepEqual(calls, [["https://example.com/reference", "_blank", "noopener,noreferrer"]]);
  } finally {
    window.open = previous;
  }
});
