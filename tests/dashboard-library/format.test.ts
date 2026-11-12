import { describe, expect, test } from "vitest";
import {
  columnDecimals,
  computeDelta,
  dateLabels,
  deltaTone,
  formatDateText,
  formatValue,
  isDurationFormat,
  isRateFormat,
  isRatioFormat,
  padDecimals,
  parseDateText,
  type ValueFormat,
} from "../../packages/libraries/dashboard/src/shared/format";

// Format is internal (the package exports the library, its theme and its prompt pieces), so these unit tests
// import it from source. Literal expectations from the source's documented en-US rules; never
// derive an expected string through the formatter being tested.
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
    // Compact currency drops trailing zeros on every engine: V8 before the 2023 Intl change
    // (Node 22) padded it to the currency's 2 digits ($12.50K, $12.0K, $4.90M).
    [12000, "currency-compact", "$12K"],
    [12904, "currency-compact", "$12.9K"],
    [4900000, "currency-compact", "$4.9M"],
    [950, "currency-compact", "$950"],
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
    [12000, "currency", "$12K"],
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
    // A margin written as a number with a "%" suffix is a rate too: 8.7% → 10.6% is +1.9 points, not +21.8%.
    [10.6, 8.7, { type: "number", suffix: "%" }, { text: "+1.9 pts", direction: "up" }],
    [10.6, 8.7, { type: "number", suffix: " %" }, { text: "+1.9 pts", direction: "up" }],
    [10.6, 8.7, { type: "number", suffix: " pts" }, { text: "+21.8%", direction: "up" }],
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

describe("formatDateText", () => {
  const thisYear = new Date().getFullYear();
  test("reads ISO dates and timestamps as a short day", () => {
    // A bare date is local midnight, so it is the day it says in every time zone.
    expect(formatDateText("2012-04-23")).toBe("Apr 23, 2012");
    expect(formatDateText(`${thisYear}-04-02`)).toBe("Apr 2");
    // A timestamp is an instant: it reads as that instant's local day.
    const stamp = "2012-04-23T16:37:11.912Z";
    expect(formatDateText(stamp)).toBe(
      new Date(stamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    );
    expect(formatDateText("2026-04-01 21:01:20+05:30")).not.toBeNull();
  });
  test("reads every shape APIs send, the same in every browser", () => {
    // A space for "T" and an offset without a colon are normalised before parsing.
    expect(formatDateText("2012-04-23 12:00:00")).toBe("Apr 23, 2012");
    expect(formatDateText("2012-04-23T12:00:00-0000")).toBe(formatDateText("2012-04-23T12:00:00Z"));
    expect(formatDateText(" 2012-04-23 ")).toBe("Apr 23, 2012");
  });
  test("an impossible day stays as written instead of rolling over", () => {
    for (const text of ["2026-02-30", "2026-02-29", "2026-04-31", "2026-13-01", "2026-00-10"]) {
      expect(formatDateText(text)).toBeNull();
    }
    expect(formatDateText("2024-02-29")).toBe("Feb 29, 2024");
  });
  test("leaves everything else alone", () => {
    for (const text of [
      "4.18.1",
      "MIT",
      "2026-04",
      "20260401",
      "Apr 2",
      "",
      "lodash/lodash",
      "2026/04/01",
      "2026-04-01T25:00:00",
    ]) {
      expect(formatDateText(text)).toBeNull();
    }
    expect(formatDateText(1712000000)).toBeNull();
    expect(formatDateText(null)).toBeNull();
  });
});

describe("dates from data sources (live demo findings)", () => {
  const thisYear = new Date().getFullYear();
  test("the en-US toLocaleString() shape reads as its day; other locale shapes stay text", () => {
    expect(formatDateText("10/01/2026, 12:00:00 AM")).toBe(
      thisYear === 2026 ? "Oct 1" : "Oct 1, 2026",
    );
    expect(formatDateText("1/2/2012, 3:04:05 PM")).toBe("Jan 2, 2012");
    expect(formatDateText("1/2/2012 3:04 PM")).toBe("Jan 2, 2012");
    expect(parseDateText("10/01/2026, 12:00:00 AM")).toMatchObject({ unit: "day", time: false });
    expect(parseDateText("10/01/2026, 9:30:00 PM")).toMatchObject({ unit: "day", time: true });
    // No AM/PM: day-first or month-first can't be told apart, so it stays as written.
    for (const text of [
      "10/01/2026",
      "01.10.2026, 00:00:00",
      "13/01/2026, 12:00:00 AM",
      "02/30/2026, 12:00:00 AM",
      "10/01/2026, 13:00:00 PM",
    ]) {
      expect(formatDateText(text)).toBeNull();
    }
  });
  test("a year and month reads as a month only where a whole set is months", () => {
    expect(formatDateText("2025-11")).toBeNull();
    expect(formatDateText("2025-11", { months: true })).toBe("Nov 2025");
    expect(parseDateText("2025-13", { months: true })).toBeNull();
  });
  test("chart labels: days, months, the year only when needed, times only when days repeat", () => {
    const days = dateLabels(["2025-05-12", "2025-05-13", "2025-05-14"])!;
    expect(["2025-05-12", "2025-05-14"].map(days)).toEqual(["May 12, 2025", "May 14, 2025"]);
    const current = dateLabels([`${thisYear}-05-12`, `${thisYear}-05-13`])!;
    expect(current(`${thisYear}-05-13`)).toBe("May 13");
    const months = dateLabels(["2025-11", "2025-12", "2026-01"])!;
    expect(["2025-11", "2026-01"].map(months)).toEqual(["Nov 2025", "Jan 2026"]);
    const hours = dateLabels(["2025-05-12T09:00:00", "2025-05-12T13:30:00"])!;
    expect(hours("2025-05-12T13:30:00")).toBe("May 12, 2025, 1:30 PM");
    const us = dateLabels(["10/01/2025, 12:00:00 AM", "10/02/2025, 12:00:00 AM"])!;
    expect(us("10/02/2025, 12:00:00 AM")).toBe("Oct 2, 2025");
    // Any label that isn't a date, or a mix of days and months, leaves every label as written.
    expect(dateLabels(["Jan", "Feb"])).toBeNull();
    expect(dateLabels(["2025-05-12", "Total"])).toBeNull();
    expect(dateLabels(["2025-05-12", "2025-06"])).toBeNull();
    expect(dateLabels([])).toBeNull();
  });
});
