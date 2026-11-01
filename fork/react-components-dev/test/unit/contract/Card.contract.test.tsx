import { Card } from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { describeContract } from "./defineContract";
describeContract("Card");

it("Card exposes its default variant and width for single-class overrides", () => {
  const html = renderToString(<Card>Body</Card>);
  expect(html).toContain("openui-card--variant-card");
  expect(html).toContain("openui-card--width-standard");
  expect(html).not.toContain("openui-card-root");
});
