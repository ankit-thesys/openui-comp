import { OverviewCardBlock } from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { describeContract } from "./defineContract";
it("OverviewCardBlock exposes its root and owned card parts", () => {
  const html = renderToString(
    <OverviewCardBlock items={[{ top: "Top" }]} clickable onItemClick={() => {}} />,
  );
  expect(html).toContain("openui-overview-card-block-card");
  expect(html).toContain("openui-overview-card-block-card--clickable");
  expect(html).not.toContain("openui-overview-card__");
});

describeContract("OverviewCardBlock");
