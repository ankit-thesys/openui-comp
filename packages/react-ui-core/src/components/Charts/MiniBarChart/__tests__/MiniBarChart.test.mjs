import assert from "node:assert/strict";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
const consumer = createRequire(
  process.env.CORE_CONSUMER
    ? path.resolve(process.env.CORE_CONSUMER, "package.json")
    : new URL("../../../../../package.json", import.meta.url),
);
const React = consumer("react");
const { renderToStaticMarkup } = consumer("react-dom/server");
const core = consumer("@openuidev/react-ui-core");

test("mini bar initial output retains signed nonzero bars and explicit color", () => {
  assert.equal(typeof core.MiniBarChart, "function", "MiniBarChart public root export");
  const markup = renderToStaticMarkup(
    React.createElement(core.MiniBarChart, {
      data: [10, 0, -5],
      size: 120,
      barColor: "#123456",
      className: "consumer",
    }),
  );
  assert.match(markup, /viewBox="0 0 120 120"/);
  assert.match(markup, /aria-label="Mini bar chart"/);
  assert.equal((markup.match(/class="openui-mini-bar-chart-bar"/g) || []).length, 2);
  assert.equal((markup.match(/fill="#123456"/g) || []).length, 2);
  assert.doesNotMatch(markup, /openui-mini-chart--clickable/);
  assert.match(markup, /consumer/);
});
