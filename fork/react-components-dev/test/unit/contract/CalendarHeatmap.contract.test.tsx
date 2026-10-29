// Public package seam: stable roots survive empty and populated frames.
// Run after build: pnpm exec vitest run test/unit/contract/CalendarHeatmap.contract.test.tsx.
import { CalendarHeatmap } from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { stableClassesIn } from "./collect";
it("exposes CalendarHeatmap's stable root on populated and empty frames", () => {
  for (const data of [[], [{ name: "A", value: 12 }]]) {
    const classes = stableClassesIn(
      renderToString(
        <CalendarHeatmap
          data={data.map((row) => ({ date: "2026-01-05", value: row.value }))}
          range={["2026-01-01", "2026-01-31"]}
          width={480}
          height={300}
        />,
      ),
    );
    expect(classes.has("openui-calendar-heatmap")).toBe(true);
    expect(classes.has("openui-calendar-heatmap-root")).toBe(false);
    expect(classes.has("openui-calendar-heatmap-container")).toBe(false);
  }
});

import { otherChartContracts } from "./components";
import { describeContract } from "./defineContract";
describeContract(
  "CalendarHeatmap",
  otherChartContracts.find(({ folder }) => folder === "CalendarHeatmap"),
);
