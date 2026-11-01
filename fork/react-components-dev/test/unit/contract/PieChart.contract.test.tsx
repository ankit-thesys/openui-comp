// Public package seam: a consumer can target PieChart's root without a legacy alias.
// Run after build: pnpm exec vitest run test/unit/contract/PieChart.contract.test.tsx.
import { PieChart } from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { stableClassesIn } from "./collect";

it("exposes PieChart's stable root on populated and empty frames", () => {
  for (const data of [[], [{ name: "A", value: 12 }]]) {
    const classes = stableClassesIn(
      renderToString(
        <PieChart
          data={data}
          categoryKey="name"
          dataKey="value"
          legend={false}
          width={480}
          height={300}
        />,
      ),
    );
    expect(classes.has("openui-pie-chart")).toBe(true);
    expect(classes.has("openui-pie-chart-root")).toBe(false);
    expect(classes.has("openui-pie-chart-container")).toBe(false);
  }
});

import { otherChartContracts } from "./components";
import { describeContract } from "./defineContract";
describeContract(
  "PieChart",
  otherChartContracts.find(({ folder }) => folder === "PieChart"),
);
