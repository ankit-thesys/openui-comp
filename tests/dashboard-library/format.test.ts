import {
  columnDecimals,
  computeDelta,
  deltaTone,
  formatValue,
  isDurationFormat,
  isRateFormat,
  isRatioFormat,
  padDecimals,
  type ValueFormat,
} from "@openuidev/dashboard-library-next";
import { describe, expect, test } from "vitest";

// Literal expectations from the source's documented en-US rules; never derive
// an expected string through the formatter being tested.
describe("Format presets and overrides", () => {
  test.each<[number, ValueFormat, string]>([
    [1284.25, "number", "1,284.25"],
    [12904, "compact", "12.9K"],
    [1284.5, "currency", "$1,285"],
    [4950000, "currency-compact", "$4.95M"],
    [1284.5, "currency-precise", "$1,284.50"],
    [3.21, "percent", "3.2%"],
    [0.0321, "ratio", "3.2%"],
    [3.2, "multiplier", "3.2x"],
    [238, "duration", "3m 58s"],
    [238, "ms", "238 ms"],
    [2.5, "days", "2.5d"],
    [1284.5, { type: "currency", currency: "EUR", decimals: 2 }, "€1,284.50"],
    [12.345, { type: "number", decimals: 1, prefix: "~", suffix: " seats" }, "~12.3 seats"],
    [12, { type: "currency-precise", decimals: 3 }, "$12.000"],
    [12.345, { type: "percent", decimals: 2 }, "12.35%"],
    [2, { type: "multiplier", decimals: 2 }, "2.00x"],
    [2.567, { type: "days", decimals: 2 }, "2.57d"],
    [1284, "compact", "1.3K"],
    [4210000, "compact", "4.21M"],
    [12400000, "compact", "12.4M"],
    [4210000000, "compact", "4.21B"],
    [12499, { type: "compact", decimals: 2 }, "12.5K"],
    [12499, { type: "currency-compact", decimals: 2 }, "$12.5K"],
    [0.0321, "percent", "<0.1%"],
    [99.999, "percent", "99.999%"],
    [-0.01, "percent", "-<0.1%"],
    [0, "ratio", "0%"],
    [0.00002, "number", "<0.01"],
    [-0.001, { type: "number", decimals: 1 }, "<0.1"],
  ])("%s as %j → %s", (value, format, expected) => {
    expect(formatValue(value, format)).toBe(expected);
  });

  test.each<[number, ValueFormat, string]>([
    [0.041, "duration", "41ms"],
    [1.4, "duration", "1.4s"],
    [-238, "duration", "-3m 58s"],
    [3600, "duration", "1h"],
    [3660, "duration", "1h 1m"],
    [367200, "duration", "4d 6h"],
    [257760, "duration", "3d"],
    [0, "duration", "0s"],
    [59.6, "duration", "1m"],
    [1450, "ms", "1.45 s"],
    [-1450, "ms", "-1.45 s"],
    [2, "days", "2d"],
  ])("duration %s as %s → %s", (value, format, expected) => {
    expect(formatValue(value, format)).toBe(expected);
  });

  test.each<[number, ValueFormat, string]>([
    [12904, "number", "12.9K"],
    [12904, "currency", "$12.9K"],
    [1284, "currency-precise", "$1,284"],
    [238, "duration", "4m"],
    [5400, "duration", "1.5h"],
    [259200, "duration", "3d"],
    [45, "duration", "45s"],
    [1450, "ms", "1.5s"],
    [238, "ms", "238ms"],
    [0.0321, "percent", "0.03%"],
    [3, "multiplier", "3x"],
  ])("axis %s as %s → %s", (value, format, expected) => {
    expect(formatValue(value, format, { axis: true })).toBe(expected);
  });

  test("missing, text and nonfinite values", () => {
    for (const value of [null, undefined, ""]) expect(formatValue(value)).toBe("—");
    expect(formatValue("Operational")).toBe("Operational");
    expect(formatValue(NaN)).toBe("NaN");
    expect(formatValue(Infinity)).toBe("Infinity");
    expect(formatValue(1234)).toBe("1,234");
  });
});

describe("Previous values and GoodWhen", () => {
  test.each<[number, number, ValueFormat, unknown]>([
    [112.4, 100, "number", { text: "+12.4%", direction: "up" }],
    [80, 100, "number", { text: "-20%", direction: "down" }],
    [100, 100, "number", { text: "0%", direction: "flat" }],
    [350, 100, "number", { text: "+250%", direction: "up" }],
    [100.03, 100, "number", { text: "+0.03%", direction: "up" }],
    [0, 100, "number", { text: "-100%", direction: "down" }],
    [3.1, 2.9, "percent", { text: "+0.2 pts", direction: "up" }],
    [0.031, 0.029, "ratio", { text: "+0.2 pts", direction: "up" }],
    [99.74, 99.71, "percent", { text: "+0.03 pts", direction: "up" }],
    [7.4, 7.4, "percent", { text: "0 pts", direction: "flat" }],
    [-48000, 12000, "currency", { text: "-$60,000", direction: "down" }],
    [12000, -48000, "currency", { text: "+$60,000", direction: "up" }],
    [-12, -12, "number", { text: "0", direction: "flat" }],
    [10, 0, "number", null],
    [NaN, 10, "number", null],
    [10, Infinity, "number", null],
  ])("delta %s vs %s (%s)", (current, previous, format, expected) => {
    expect(computeDelta(current, previous, format)).toEqual(expected);
  });

  test.each([
    ["up", "up", "good"],
    ["down", "up", "bad"],
    ["flat", "up", "neutral"],
    ["up", "down", "bad"],
    ["down", "down", "good"],
    ["flat", "down", "neutral"],
    ["up", "neutral", "neutral"],
    ["down", "neutral", "neutral"],
    ["flat", "neutral", "neutral"],
  ] as const)("%s when good is %s → %s", (direction, goodWhen, expected) => {
    expect(deltaTone(direction, goodWhen)).toBe(expected);
  });
  test("default GoodWhen is up", () => expect(deltaTone("up")).toBe("good"));
});

test("format classifiers and aligned column decimals", () => {
  expect(isRatioFormat({ type: "ratio" })).toBe(true);
  expect(isRatioFormat("percent")).toBe(false);
  expect(isDurationFormat("duration")).toBe(true);
  expect(isDurationFormat("ms")).toBe(false);
  expect(isRateFormat("percent")).toBe(true);
  expect(isRateFormat("ratio")).toBe(true);
  expect(isRateFormat()).toBe(false);
  expect(columnDecimals(["35%", "35.12%"])).toBe(2);
  expect(columnDecimals(["$950", "$1.2K"])).toBe(0);
  expect(columnDecimals(["—"])).toBe(0);
  expect(padDecimals("35%", 1)).toBe("35.0%");
  expect(padDecimals("+$1.2K", 2)).toBe("+$1.20K");
  expect(padDecimals("—", 2)).toBe("—");
});
