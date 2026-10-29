// Public package seam: stable roots survive empty and populated frames.
// Run after build: pnpm exec vitest run test/unit/contract/SegmentedBar.contract.test.tsx.
import { SegmentedBar } from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { stableClassesIn } from "./collect";
it("exposes SegmentedBar's stable root on populated and empty frames", () => {
  for (const data of [[], [{ name: "A", value: 12 }]]) {
    const classes = stableClassesIn(
      renderToString(<SegmentedBar data={data} categoryKey="name" dataKey="value" />),
    );
    expect(classes.has("openui-segmented-bar")).toBe(true);
    expect(classes.has("openui-segmented-bar-root")).toBe(false);
    expect(classes.has("openui-segmented-bar-container")).toBe(false);
  }
});

import { otherChartContracts } from "./components";
import { describeContract } from "./defineContract";
describeContract(
  "SegmentedBar",
  otherChartContracts.find(({ folder }) => folder === "SegmentedBar"),
);
