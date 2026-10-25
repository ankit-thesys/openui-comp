import assert from "node:assert/strict";
import test from "node:test";
import { act, core, mount, React } from "../../Button/__tests__/consumer.mjs";
const { createElement: h } = React;
test("citation items open safe sources and still notify consumers when a source URL is rejected", async () => {
  assert(core.CitationItem, "public CitationItem export");
  const calls = [];
  const previous = window.open;
  window.open = (...args) => {
    calls.push(args);
    return null;
  };
  let selected = 0;
  const render = (url) =>
    h(core.CitationItem, {
      title: "Reference",
      sourceName: "Docs",
      faviconUrl: "",
      url,
      onClick: () => selected++,
    });
  const view = await mount(render("https://example.com/reference"));
  try {
    assert.match(view.container.textContent, /ReferenceDocs/);
    await act(async () => view.container.querySelector("button").click());
    assert.deepEqual(calls, [["https://example.com/reference", "_blank", "noopener,noreferrer"]]);
    await view.render(render("java\tscript:alert(1)"));
    await act(async () => view.container.querySelector("button").click());
    assert.equal(calls.length, 1);
    assert.equal(selected, 2);
  } finally {
    window.open = previous;
    await view.close();
  }
});
test("markdown citation spans resolve one-based sources and preserve ordinary span content", async () => {
  assert(core.TextContentCitation, "public TextContentCitation export");
  const marker = (indices) =>
    h(
      core.TextContentCitation,
      {
        node: {
          properties: { "data-component-type": "citation", "data-citation-indices": indices },
        },
      },
      "[1]",
    );
  const sources = [
    { title: "Reference", sourceName: "Docs" },
    { title: " ", sourceName: "Empty" },
  ];
  const view = await mount(
    h(
      core.CardSourceProvider,
      { sources },
      h(core.TextContentCitation, { title: "Plain" }, "Text"),
      marker("1,2,99"),
      marker("0,2,99"),
    ),
  );
  try {
    assert.equal(view.container.querySelector('[title="Plain"]').textContent, "Text");
    assert.equal(view.container.querySelectorAll('[aria-label="Citations"]').length, 1);
    await view.render(marker("1"));
    assert.equal(view.container.textContent, "");
  } finally {
    await view.close();
  }
});
