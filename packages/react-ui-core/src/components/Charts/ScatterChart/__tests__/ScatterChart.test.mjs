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

test("scatter initial empty markup preserves message and consumer class", () => {
  assert.equal(typeof core.ScatterChart, "function", "ScatterChart public root export");
  const markup = renderToStaticMarkup(
    React.createElement(core.ScatterChart, { data: [], className: "consumer" }),
  );
  assert.match(markup, /openui-scatter-chart-container/);
  assert.match(markup, /consumer/);
  assert.match(markup, /No data available/);
  assert.doesNotMatch(markup, /<svg/);
});
