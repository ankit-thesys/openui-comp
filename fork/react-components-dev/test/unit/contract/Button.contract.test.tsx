import { Button, getComponentStyles } from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { describeContract } from "./defineContract";

const importedCss = getComponentStyles();

it("registers Button rules before its first render", () => {
  const html = renderToString(<Button>Save</Button>);
  const classes = html
    .match(/class="([^"]+)"/)![1]!
    .split(" ")
    .filter((name) => /^go\d+$/.test(name));
  expect(classes.length).toBeGreaterThan(0);
  for (const name of classes) expect(importedCss).toContain(`.${name}{`);
});

describeContract("Button");
