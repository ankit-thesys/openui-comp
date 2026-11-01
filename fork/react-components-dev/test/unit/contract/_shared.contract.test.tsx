import { ContextCardBlock, getComponentStyles } from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { describeContract } from "./defineContract";

const importedCss = getComponentStyles();

it("registers the shared card layout rules before its consumers render", () => {
  const html = renderToString(<ContextCardBlock items={[{ body: "One" }]} />);
  const classes = html
    .match(/class="([^"]*\bopenui-card-block-layout\b[^"]*)"/)![1]!
    .split(" ")
    .filter((name) => /^go\d+$/.test(name));
  expect(classes.length).toBeGreaterThan(0);
  for (const name of classes) expect(importedCss).toContain(`.${name}{`);
});

it("card layouts expose default axes and responsive parts through public blocks", () => {
  const html = renderToString(<ContextCardBlock items={[{ body: "One" }]} />);
  expect(html).toContain("openui-card-block-layout--size-small");
  expect(html).toContain("openui-card-block-layout--layout-grid");
  expect(html).toContain("openui-card-block-layout--responsive");
});

describeContract("_shared");
