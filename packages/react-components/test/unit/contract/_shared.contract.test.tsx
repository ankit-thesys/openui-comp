import { ContextCardBlock } from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { describeContract } from "./defineContract";
it("card layouts expose default axes and responsive parts through public blocks", () => {
  const html = renderToString(<ContextCardBlock items={[{ body: "One" }]} />);
  expect(html).toContain("openui-card-block-layout--size-small");
  expect(html).toContain("openui-card-block-layout--layout-grid");
  expect(html).toContain("openui-card-block-layout--responsive");
});

describeContract("_shared");
