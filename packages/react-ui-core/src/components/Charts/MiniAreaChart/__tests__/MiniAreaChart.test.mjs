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

test("mini area initial output keeps minimum square and single-value marker with palette precedence", () => {
  assert.equal(typeof core.MiniAreaChart, "function", "MiniAreaChart public root export");
  const markup = renderToStaticMarkup(
    React.createElement(core.MiniAreaChart, {
      data: [5],
      size: 80,
      useGradient: false,
      areaColor: "#aa0000",
      customPalette: ["#123456"],
      className: "consumer",
      onAreaClick() {},
    }),
  );
  assert.match(markup, /width:100px;height:100px/);
  assert.match(markup, /viewBox="0 0 100 100"/);
  assert.match(markup, /aria-label="Mini area chart"/);
  assert.match(markup, /openui-mini-chart--clickable/);
  assert.match(markup, /consumer/);
  assert.match(markup, /<circle[^>]+fill="#123456"/);
  assert.doesNotMatch(markup, /<linearGradient/);
});
