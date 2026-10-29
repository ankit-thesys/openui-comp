import { SnippetCardBlock } from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { describeContract } from "./defineContract";
it("SnippetCardBlock names both value slots and only true clickable cards", () => {
  const html = renderToString(<SnippetCardBlock items={[{ lhs: "Label", rhs: "Value" }]} />);
  expect(html).toContain("openui-snippet-card-block-lhs");
  expect(html).toContain("openui-snippet-card-block-rhs-content");
  expect(html).not.toContain("--static");
});

describeContract("SnippetCardBlock");
