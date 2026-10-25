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

test("mini line initial output keeps a single-point marker, custom stroke and click hook", () => {
  assert.equal(typeof core.MiniLineChart, "function", "MiniLineChart public root export");
  const markup = renderToStaticMarkup(
    React.createElement(core.MiniLineChart, {
      data: [{ value: 5, label: "Only" }],
      size: 100,
      lineColor: "#123456",
      strokeWidth: 3,
      className: "consumer",
      onLineClick() {},
    }),
  );
  assert.match(markup, /aria-label="Mini line chart"/);
  assert.match(markup, /openui-mini-chart--clickable/);
  assert.match(markup, /class="openui-mini-line-chart-point/);
  assert.match(markup, /stroke="#123456"/);
  assert.match(markup, /stroke-width="3"/);
  assert.match(markup, /consumer/);
});
