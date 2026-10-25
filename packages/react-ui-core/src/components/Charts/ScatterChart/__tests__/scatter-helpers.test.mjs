import assert from "node:assert/strict";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";

const consumer = createRequire(
  process.env.CORE_CONSUMER
    ? path.resolve(process.env.CORE_CONSUMER, "package.json")
    : new URL("../../../../../package.json", import.meta.url),
);
const core = consumer("@openuidev/react-ui-core");

test("scatter dataset names preserve input ordering and handle missing data", () => {
  assert.equal(typeof core.getScatterDatasets, "function", "existing public Scatter helper");
  assert.deepEqual(
    core.getScatterDatasets([
      { name: "First", data: [{ x: 1, y: 2 }] },
      { name: "Second", data: [] },
    ]),
    ["First", "Second"],
  );
  assert.deepEqual(core.getScatterDatasets([]), []);
  assert.deepEqual(core.getScatterDatasets(undefined), []);
});

test("scatter flattening preserves metadata and existing palette/coercion behavior", () => {
  const points = core.transformScatterData(
    [
      { name: "A", data: [{ x: "2", y: 3, z: "4", label: "alpha", color: "ignored" }] },
      { name: "B", data: [{ x: 5, y: 6, z: 0 }] },
    ],
    ["A"],
    ["#123456"],
  );
  assert.deepEqual(points, [
    { x: 2, y: 3, z: 4, label: "alpha", color: "#123456", dataset: "A" },
    { x: 5, y: 6, z: undefined, color: "transparent", dataset: "B" },
  ]);
  assert.deepEqual(core.transformScatterData(undefined, [], []), []);
});

test("scatter domain and tooltip formatting retain existing edge cases", () => {
  const data = [
    {
      name: "A",
      data: [
        { x: -10, y: 20 },
        { x: 30, y: 40 },
      ],
    },
  ];
  assert.deepEqual(core.calculateScatterDomain(data, "y"), [18, 42]);
  // Existing public helper clamps the lower bound even for negative x data.
  assert.deepEqual(core.calculateScatterDomain(data, "x"), [0, 34]);
  assert.deepEqual(core.calculateScatterDomain([], "x"), [0, 100]);
  assert.deepEqual(
    core.calculateScatterDomain([{ name: "A", data: [{ x: 5, y: 5 }] }], "x"),
    [5, 5],
  );
  assert.equal(core.formatScatterTooltipValue("42", "ms"), "42 ms");
  assert.equal(core.formatScatterTooltipValue(42), "42");
});
