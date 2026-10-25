import assert from "node:assert/strict";
import test from "node:test";
import { core, React, require } from "../../Button/__tests__/consumer.mjs";
const { renderToStaticMarkup } = require("react-dom/server");
const { createElement: h } = React;
test("snippet cards preserve slots, chevron fallback, item grouping and consumer attributes", () => {
  assert(core.SnippetCardBlock, "public SnippetCardBlock export");
  const items = [
    { id: "a", lhs: "Left A", rhs: "Value A" },
    { id: "b", lhs: "Left B" },
    { id: "c", lhs: null, rhs: 0 },
  ];
  const root = document.createElement("div");
  root.innerHTML = renderToStaticMarkup(
    h(core.SnippetCardBlock, {
      items,
      clickable: true,
      onItemClick: () => {},
      className: "custom",
      gap: "2rem",
      "aria-label": "Values",
    }),
  );
  const block = root.firstElementChild;
  assert.equal(block.dataset.cardType, "SnippetCard");
  assert.equal(block.getAttribute("aria-label"), "Values");
  assert(block.classList.contains("custom"));
  assert.equal(block.style.getPropertyValue("--openui-small-card-gap"), "2rem");
  assert.deepEqual(
    [...block.querySelectorAll(".openui-small-card-block__row")].map((n) => n.children.length),
    [2, 1],
  );
  assert.equal(block.querySelectorAll('[role="button"]').length, 3);
  assert.equal(block.querySelectorAll(".openui-value-card__chevron").length, 1);
  assert.deepEqual(
    [...block.querySelectorAll(".openui-value-card__rhs-content")].map((n) => n.textContent),
    ["Value A", "0"],
  );
  root.innerHTML = renderToStaticMarkup(h(core.SnippetCardBlock, { items, clickable: true }));
  assert.equal(root.querySelector('[role="button"]'), null);
  assert.equal(root.querySelector(".openui-value-card__chevron"), null);
  assert.equal(root.querySelectorAll(".openui-value-card--static").length, 3);
  root.innerHTML = renderToStaticMarkup(h(core.SnippetCardBlock, { items: [] }));
  assert.equal(root.firstElementChild.dataset.count, "0");
});
