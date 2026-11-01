// Public package seam: stable roots survive empty and populated frames.
// Run after build: pnpm exec vitest run test/unit/contract/RadarChart.contract.test.tsx.
import { RadarChart } from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { stableClassesIn } from "./collect";
it("exposes RadarChart's stable root on populated and empty frames", () => {
  for (const data of [[], [{ name: "A", value: 12 }]]) {
    const classes = stableClassesIn(
      renderToString(
        <RadarChart data={data} categoryKey="name" legend={false} width={480} height={300} />,
      ),
    );
    expect(classes.has("openui-radar-chart")).toBe(true);
    expect(classes.has("openui-radar-chart-root")).toBe(false);
    expect(classes.has("openui-radar-chart-container")).toBe(false);
  }
});

import { otherChartContracts } from "./components";
import { describeContract } from "./defineContract";
describeContract(
  "RadarChart",
  otherChartContracts.find(({ folder }) => folder === "RadarChart"),
);
