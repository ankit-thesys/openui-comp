import { describe, expect, test } from "vitest";
import { chipAlign, niceTicks } from "../../packages/libraries/dashboard/src/shared/chartHelpers";

// Chart plumbing is internal, so these unit tests import it from source. Expected ticks are
// worked out by hand from the 1, 2, 2.5, 5 × 10ⁿ rule.
describe("niceTicks", () => {
  const rows = (values: number[]) => values.map((s0, i) => ({ label: `c${i}`, s0 }));
  test("round steps where Recharts counted in 950K", () => {
    expect(niceTicks(rows([3700000, 2100000, 1800000, 950000]), ["s0"])).toEqual([
      0, 1000000, 2000000, 3000000, 4000000,
    ]);
  });
  test("whole-number data never gets a 2.5 step", () => {
    expect(niceTicks(rows([10, 12, 9]), ["s0"], [], { integers: true })).toEqual([0, 5, 10, 15]);
    expect(niceTicks(rows([1, 9]), ["s0"], [], { integers: true })).toEqual([0, 2, 4, 6, 8, 10]);
    expect(niceTicks(rows([0.3, 0.9]), ["s0"])).toEqual([0, 0.25, 0.5, 0.75, 1]);
  });
  test("stacks count by their sums, negatives reach below zero, references count", () => {
    const stack = [
      { label: "a", s0: 30, s1: 50 },
      { label: "b", s0: -20, s1: 10 },
    ];
    // Sums 80 and −20: a span of 100 in four steps is 25.
    expect(niceTicks(stack, ["s0", "s1"], [], { stacked: true })).toEqual([
      -25, 0, 25, 50, 75, 100,
    ]);
    expect(niceTicks(rows([40, 60]), ["s0"], [150])).toEqual([0, 50, 100, 150]);
  });
  test("nothing to scale leaves the axis to Recharts", () => {
    expect(niceTicks(rows([0, 0]), ["s0"])).toBeUndefined();
    expect(niceTicks([], ["s0"])).toBeUndefined();
  });
});

describe("chipAlign", () => {
  const rows = (values: number[]) => values.map((s0, i) => ({ label: `p${i}`, s0 }));
  test("a reference chip moves to the end only when the start is the crowded side", () => {
    // Starts at the 100% target and climbs away: the chip at the start would cover the line.
    expect(chipAlign(rows([100, 101, 110, 120, 130]), ["s0"], 100)).toBe("end");
    // Climbs to the target: the start is clear.
    expect(chipAlign(rows([70, 80, 90, 95, 100]), ["s0"], 100)).toBe("start");
    // Equally close at both ends: the usual start.
    expect(chipAlign(rows([100, 50, 100]), ["s0"], 100)).toBe("start");
  });
});
