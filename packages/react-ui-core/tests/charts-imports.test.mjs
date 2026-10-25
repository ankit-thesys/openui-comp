// JavaScript/Goober pruning; math vendor assets have separate delivery coverage.
import { build } from "esbuild";
import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
const consumer = process.env.CORE_CONSUMER || fileURLToPath(new URL("..", import.meta.url));
test("Button and individual chart root imports prune unrelated chart implementations and styles", async () => {
  for (const name of ["Button", "PieChart", "CalendarHeatmap", "SegmentedBar"]) {
    const result = await build({
      stdin: {
        contents: `import {${name}} from '@openuidev/react-ui-core'; console.log(${name});`,
        resolveDir: consumer,
      },
      bundle: true,
      platform: "browser",
      format: "esm",
      minify: true,
      write: false,
      metafile: true,
      external: ["*.css"],
      define: { "process.env.NODE_ENV": '"production"' },
    });
    const retained = Object.values(result.metafile.outputs).flatMap((out) =>
      Object.entries(out.inputs)
        .filter(([, value]) => value.bytesInOutput > 0)
        .map(([name]) => name),
    );
    assert(
      retained.every((file) => !file.includes("packages/react-ui/src")),
      "no legacy production implementation",
    );
    const chartFiles = retained.filter((file) => file.includes("/components/Charts/"));
    if (name === "Button") {
      assert.equal(chartFiles.length, 0, JSON.stringify(chartFiles));
      assert(
        retained.every((file) => !/[\\/]d3-[^/\\]+[\\/]/.test(file)),
        "Button retains no D3 code",
      );
    } else {
      assert(
        chartFiles.some((file) => file.includes(`/Charts/${name}/`)),
        `${name} implementation retained`,
      );
      const familyNames = chartFiles
        .map((file) => file.split("/Charts/")[1].split("/")[0])
        .filter(
          (family) =>
            family.endsWith("Chart") ||
            [
              "CalendarHeatmap",
              "SegmentedBar",
              "MiniAreaChart",
              "MiniBarChart",
              "MiniLineChart",
            ].includes(family),
        );
      assert.deepEqual([...new Set(familyNames)], [name], JSON.stringify(chartFiles));
    }
    assert(
      result.outputFiles.every((file) => !file.text.includes("katex/dist/katex.min.css")),
      "no math CSS in focused chart bundle",
    );
  }
});
