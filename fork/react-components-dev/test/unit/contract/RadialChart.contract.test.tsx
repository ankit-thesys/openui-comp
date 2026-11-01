// Public package seam: stable roots survive empty and populated frames.
// Run after build: pnpm exec vitest run test/unit/contract/RadialChart.contract.test.tsx.
import { RadialChart } from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { stableClassesIn } from "./collect";
it("exposes RadialChart's stable root on populated and empty frames", () => {
  for (const data of [[], [{ name: "A", value: 12 }]]) {
    const classes = stableClassesIn(
      renderToString(
        <RadialChart
          data={data}
          categoryKey="name"
          dataKey="value"
          legend={false}
          width={480}
          height={300}
        />,
      ),
    );
    expect(classes.has("openui-radial-chart")).toBe(true);
    expect(classes.has("openui-radial-chart-root")).toBe(false);
    expect(classes.has("openui-radial-chart-container")).toBe(false);
  }
});

import { otherChartContracts } from "./components";
import { describeContract } from "./defineContract";
describeContract(
  "RadialChart",
  otherChartContracts.find(({ folder }) => folder === "RadialChart"),
);
