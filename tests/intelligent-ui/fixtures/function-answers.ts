/**
 * Known answers for the library's 59 @functions, written down from sources outside the library's
 * code: arithmetic and the calendar, en-US number and date conventions, published reference values
 * (a mortgage table, NIST unit factors, the textbook standard-deviation example), the textbook
 * algorithms the descriptions name (Fisher–Yates, largest remainder), and the answers the source app
 * gave in #160. `source` says which, per function.
 *
 * Each `call` is openui-lang. `ROWS` stands for the sample rows below. Calls that read `$state`
 * declare it in `state`; `$nothing` is a variable that holds null, as unset state does. The random functions are checked with `Math.random` pinned to 0.5, and
 * `@Now`/`@Today` with the clock fixed at 2026-10-09T12:00:00Z, in UTC and en-US.
 */
export type Answer = { call: string; expected: unknown };
export type FunctionAnswers = { source: string; state?: string; answers: Answer[] };

export const ROWS = `[{region: "West", product: "A", amount: 10, date: "2026-10-01"}, {region: "East", product: "B", amount: 5, date: "2026-10-02"}, {region: "West", product: "B", amount: 7, date: "2026-10-09"}]`;

/** The value `Math.random` returns while the answers are checked. */
export const RANDOM = 0.5;
/** The instant the clock is fixed at while the answers are checked. */
export const NOW = "2026-10-09T12:00:00.000Z";

const a = (call: string, expected: unknown): Answer => ({ call, expected });

export const functionAnswers: Record<string, FunctionAnswers> = {
  // Lists
  Append: {
    source: "list semantics: the item goes on the end, a list item stays one item",
    state: "$nothing = null",
    answers: [
      a("@Append([1, 2], 3)", [1, 2, 3]),
      a('@Append([], "a")', ["a"]),
      a("@Append([1], [2])", [1, [2]]),
      a("@Append($nothing, 1)", null),
    ],
  },
  Prepend: {
    source: "list semantics: the item goes first",
    answers: [a("@Prepend([2, 3], 1)", [1, 2, 3]), a('@Prepend([], "a")', ["a"])],
  },
  Concat: {
    source: "list semantics: the second list follows the first",
    answers: [a("@Concat([1], [2, 3])", [1, 2, 3]), a("@Concat([], [])", [])],
  },
  Remove: {
    source: "#160 source app: removes every item whose field equals the value, comparing loosely",
    answers: [
      a('@Remove(["a", "b", "a"], "", "a")', ["b"]),
      a('@Remove([{id: 1}, {id: 2}], "id", 2)', [{ id: 1 }]),
      a('@Remove([{id: 1}], "id", "1")', []),
      a('@Remove([{p: {id: 1}}, {p: {id: 2}}], "p.id", 1)', [{ p: { id: 2 } }]),
      a('@Remove(["a"], "", "z")', ["a"]),
    ],
  },
  RemoveAt: {
    source: "list semantics, with a negative index counting from the end as in Array.prototype.at",
    answers: [
      a('@RemoveAt(["a", "b", "c"], 1)', ["a", "c"]),
      a('@RemoveAt(["a", "b", "c"], -1)', ["a", "b"]),
      a('@RemoveAt(["a", "b", "c"], 9)', ["a", "b", "c"]),
      a("@RemoveAt([], 0)", []),
    ],
  },
  Update: {
    source: "#160 source app: sets one field on the items whose key field matches",
    answers: [
      a('@Update([{id: 1, done: false}, {id: 2, done: false}], "id", 2, "done", true)', [
        { id: 1, done: false },
        { id: 2, done: true },
      ]),
      a('@Update([{id: 1}], "id", 3, "x", 5)', [{ id: 1 }]),
      a('@Update([], "id", 1, "x", 5)', []),
    ],
  },
  Toggle: {
    source: "set semantics: adds a missing item, removes a present one",
    answers: [
      a('@Toggle(["a"], "b")', ["a", "b"]),
      a('@Toggle(["a", "b"], "a")', ["b"]),
      a("@Toggle([], 1)", [1]),
    ],
  },
  Includes: {
    source: "list membership, and substring search on text",
    answers: [
      a("@Includes([1, 2], 2)", true),
      a("@Includes([1, 2], 3)", false),
      a('@Includes("Hello world", "world")', true),
      a('@Includes("Hello", "z")', false),
      a('@Includes([], "a")', false),
    ],
  },
  Find: {
    source: "the first item whose field matches, or nothing",
    answers: [
      a('@Find([{n: "a", v: 1}, {n: "b", v: 2}], "n", "b")', { n: "b", v: 2 }),
      a('@Find([{n: "a"}], "n", "z")', null),
    ],
  },
  IndexOf: {
    source:
      "zero-based position, -1 when absent, as in Array.prototype.indexOf; objects compare by value",
    answers: [
      a('@IndexOf(["a", "b"], "b")', 1),
      a('@IndexOf(["a", "b"], "z")', -1),
      a("@IndexOf([], 1)", -1),
      a("@IndexOf([{a: 1, b: [2]}, {a: 2}], {b: [2], a: 1})", 0),
    ],
  },
  Take: {
    source: "the first n items; a negative n takes from the end",
    answers: [
      a("@Take([1, 2, 3], 2)", [1, 2]),
      a("@Take([1, 2, 3], -1)", [3]),
      a("@Take([1, 2, 3], 0)", []),
      a("@Take([], 5)", []),
    ],
  },
  Slice: {
    source: "Array.prototype.slice and String.prototype.slice",
    answers: [
      a("@Slice([1, 2, 3, 4], 1, 3)", [2, 3]),
      a("@Slice([1, 2, 3], -2)", [2, 3]),
      a('@Slice("Saturday", 0, 3)', "Sat"),
      a('@Slice("report.pdf", -3)', "pdf"),
    ],
  },
  Unique: {
    source: "first occurrence kept, objects compared by value",
    answers: [
      a('@Unique([1, 1, 2, "a", "a"])', [1, 2, "a"]),
      a("@Unique([{a: 1}, {a: 1}, {a: 2}])", [{ a: 1 }, { a: 2 }]),
      a("@Unique([])", []),
    ],
  },
  Reverse: {
    source: "list semantics",
    answers: [a("@Reverse([1, 2, 3])", [3, 2, 1]), a("@Reverse([])", [])],
  },
  Range: {
    source: "Python's range(start, stop, step): stop excluded",
    answers: [
      a("@Range(0, 3)", [0, 1, 2]),
      a("@Range(1, 10, 3)", [1, 4, 7]),
      a("@Range(3, 0, -1)", [3, 2, 1]),
      a("@Range(0, 0.3, 0.1)", [0, 0.1, 0.2]),
      a("@Range(5, 0)", []),
      a("@Range(0, 5, 0)", null),
    ],
  },
  Pick: {
    source: "a uniform pick, index floor(random × length): 0.5 picks the middle of three",
    answers: [a('@Pick(["a", "b", "c"])', "b"), a("@Pick([])", null)],
  },
  Shuffle: {
    source:
      "Durstenfeld's Fisher–Yates shuffle, j = floor(random × (i + 1)), worked by hand for random = 0.5",
    answers: [a("@Shuffle([1, 2, 3, 4])", [1, 4, 2, 3]), a("@Shuffle([])", [])],
  },
  Flatten: {
    source: "one level of Array.prototype.flat",
    answers: [a("@Flatten([[1, 2], [3], 4])", [1, 2, 3, 4]), a("@Flatten([])", [])],
  },
  Chunk: {
    source: "consecutive groups of n, the last one shorter",
    answers: [a("@Chunk([1, 2, 3, 4, 5], 2)", [[1, 2], [3, 4], [5]]), a("@Chunk([1], 0)", null)],
  },

  // Numbers
  Pow: {
    source: "arithmetic; no real result (0⁻¹, a negative base to a fractional power) is null",
    answers: [
      a("@Pow(2, 10)", 1024),
      a("@Pow(9, 0.5)", 3),
      a("@Pow(2, -1)", 0.5),
      a("@Pow(0, -1)", null),
      a("@Pow(-8, 1 / 3)", null),
    ],
  },
  Sqrt: {
    source: "arithmetic; the square root of a negative number has no real value",
    answers: [a("@Sqrt(9)", 3), a("@Sqrt(0)", 0), a("@Sqrt(2.25)", 1.5), a("@Sqrt(-1)", null)],
  },
  Random: {
    source:
      "min + random × (max − min), and the MDN inclusive-integer recipe min + floor(random × (max − min + 1))",
    answers: [
      a("@Random(0, 10)", 5),
      a("@Random(10, 0)", 5),
      a("@Random(1, 6, true)", 4),
      a("@Random(0.2, 0.8, true)", null),
    ],
  },
  Clamp: {
    source: "arithmetic: the value held between the bounds",
    answers: [a("@Clamp(5, 0, 3)", 3), a("@Clamp(-1, 0, 3)", 0), a("@Clamp(2, 0, 3)", 2)],
  },
  Percent: {
    source: "arithmetic: part ÷ whole × 100",
    answers: [a("@Percent(3, 4)", 75), a("@Percent(1, 8)", 12.5), a("@Percent(-1, 4)", -25)],
  },
  Lerp: {
    source: "linear interpolation a + (b − a) × t",
    answers: [
      a("@Lerp(0, 10, 0.25)", 2.5),
      a("@Lerp(10, 0, 1)", 0),
      a("@Lerp(10, 20, 0.25)", 12.5),
    ],
  },
  Allocate: {
    source:
      "the largest-remainder method (Fowler's money allocation): splits add back up to the total",
    answers: [
      a("@Allocate(100, [1, 1, 1])", [33.34, 33.33, 33.33]),
      a("@Allocate(10, [1, 2, 1])", [2.5, 5, 2.5]),
      a("@Allocate(7, [1, 1], 0)", [4, 3]),
      a("@Allocate(5, [1, -1])", null),
    ],
  },
  Payment: {
    source:
      "the annuity formula; a $300,000, 30-year loan at 6% a year (0.5% a month) costs $1,798.65 a month in any mortgage table",
    answers: [
      a("@Round(@Payment(300000, 0.5, 360), 2)", 1798.65),
      a("@Payment(1200, 0, 12)", 100),
      a("@Payment(1000, 1, 0)", null),
    ],
  },
  Convert: {
    source: "NIST SP 811 factors: 1 mi = 1.609344 km, 1 US cup = 236.5882 mL, °F = °C × 9/5 + 32",
    answers: [
      a('@Round(@Convert(10, "km", "mi"), 3)', 6.214),
      a('@Round(@Convert(1, "mi", "km"), 3)', 1.609),
      a('@Convert(100, "c", "f")', 212),
      a('@Convert(-40, "f", "c")', -40),
      a('@Round(@Convert(2, "CUP", "ml"))', 473),
      a('@Convert(1, "kg", "m")', null),
    ],
  },
  MixColor: {
    source: "per-channel linear mix: halfway between ff and 00 is 127.5, which rounds to 80 (hex)",
    answers: [
      a('@MixColor("#ffffff", "#000000", 0.5)', "#808080"),
      a('@MixColor("#fff", "#0285ff", 1)', "#0285ff"),
      a('@MixColor("#ff0000", "#0000ff", 0)', "#ff0000"),
      a('@MixColor("red", "#000000", 0.5)', null),
    ],
  },
  Change: {
    source: "percentage change (new − old) ÷ |old| × 100",
    answers: [
      a("@Change(120, 100)", 20),
      a("@Change(80, 100)", -20),
      a("@Change(-50, -100)", 50),
      a("@Change(5, 0)", null),
    ],
  },
  Stats: {
    source:
      "the textbook population standard-deviation example: 2, 4, 4, 4, 5, 5, 7, 9 has mean 5 and σ = 2",
    answers: [
      a("@Stats([2, 4, 4, 4, 5, 5, 7, 9])", {
        count: 8,
        min: 2,
        max: 9,
        mean: 5,
        median: 4.5,
        stdev: 2,
      }),
      a("@Stats([3, 1, 2]).median", 2),
      a("@Stats([])", { count: 0, min: 0, max: 0, mean: 0, median: 0, stdev: 0 }),
    ],
  },

  // Text
  Format: {
    source: "en-US number formatting (CLDR): grouping commas, $ and € symbols, M for millions",
    answers: [
      a("@Format(12345.678)", "12,345.68"),
      a('@Format(12345.6, "number")', "12,345.6"),
      a('@Format(2.5, "number", 0)', "3"),
      a('@Format(1234.5, "currency")', "$1,234.50"),
      a('@Format(1234.5, "currency", 0, "EUR")', "€1,235"),
      a('@Format(45, "percent")', "45%"),
      a('@Format(12.345, "percent", 1)', "12.3%"),
      a('@Format(1234567, "compact")', "1.2M"),
      a('@Format(1234567, "compact", null, "USD")', "$1.2M"),
      a('@Format(999, "compact")', "999"),
      a('@Format(-5, "currency")', "-$5.00"),
    ],
  },
  Join: {
    source: "Array.prototype.join, skipping empty items",
    answers: [
      a('@Join(["a", "b"])', "a, b"),
      a('@Join(["a", "b"], " / ")', "a / b"),
      a('@Join([{n: "x"}, {n: "y"}], "\\n", "n")', "x\ny"),
      a('@Join(["a", null, "b"], "-")', "a-b"),
      a("@Join([])", ""),
    ],
  },
  Plural: {
    source:
      "English plurals: 1 takes the singular, 0 and many the plural; counts get grouping commas",
    answers: [
      a('@Plural(1, "guest")', "1 guest"),
      a('@Plural(3, "guest")', "3 guests"),
      a('@Plural(0, "item")', "0 items"),
      a('@Plural(2, "person", "people")', "2 people"),
      a('@Plural(1500, "step")', "1,500 steps"),
    ],
  },
  Pad: {
    source: "String.prototype.padStart",
    answers: [a("@Pad(7, 2)", "07"), a('@Pad("5", 3, " ")', "  5"), a("@Pad(123, 2)", "123")],
  },
  Upper: {
    source: "String.prototype.toUpperCase",
    answers: [a('@Upper("abc")', "ABC"), a('@Upper("straße")', "STRASSE"), a('@Upper("")', "")],
  },
  Lower: {
    source: "String.prototype.toLowerCase",
    state: "$nothing = null",
    answers: [a('@Lower("AbC")', "abc"), a("@Lower($nothing)", null)],
  },
  Trim: {
    source: "String.prototype.trim",
    answers: [a('@Trim("  hi there ")', "hi there"), a('"[" + @Trim(" x ") + "]"', "[x]")],
  },
  Capitalize: {
    source: "title case: the first letter of each word, after a space or hyphen",
    answers: [
      a('@Capitalize("new york-city trip")', "New York-City Trip"),
      a('@Capitalize("élan vital")', "Élan Vital"),
    ],
  },
  Split: {
    source: "split on a separator (comma by default), dropping empty pieces",
    answers: [
      a('@Split("a, b,,c")', ["a", "b", "c"]),
      a('@Split("eggs\\nmilk", "\\n")', ["eggs", "milk"]),
      a('@Split("")', []),
    ],
  },
  Replace: {
    source: "String.prototype.replaceAll; an empty search changes nothing",
    answers: [
      a('@Replace("a-b-c", "-", " / ")', "a / b / c"),
      a('@Replace("abc", "", "x")', "abc"),
    ],
  },
  Duration: {
    source: "clock arithmetic: 4800 s is 1 h 20 min, 245 s is 4 min 5 s",
    answers: [
      a("@Duration(4800)", "1h 20m"),
      a("@Duration(245)", "4m 05s"),
      a("@Duration(45)", "45s"),
      a('@Duration(4805, "clock")', "1:20:05"),
      a('@Duration(245, "clock")', "4:05"),
    ],
  },
  Default: {
    source: "a fallback for null or an empty string only; 0 and false are real values",
    state: "$dflt = null",
    answers: [
      a('@Default("", 0)', 0),
      a('@Default(null, "n/a")', "n/a"),
      a("@Default(0, 5)", 0),
      a("@Default(false, true)", false),
      a("@Default($dflt, 0) + 1", 1),
    ],
  },

  // Dates
  FormatDate: {
    source: "en-US date conventions (CLDR); 9 October 2026 is a Friday",
    answers: [
      a('@FormatDate("2026-10-09")', "Oct 9, 2026"),
      a('@FormatDate("2026-10-09", "short")', "Oct 9"),
      a('@FormatDate("2026-10-09", "long")', "Friday, October 9, 2026"),
      a('@FormatDate("2026-10-09", "weekday")', "Fri"),
      a('@FormatDate("2026-10-09", "month")', "Oct 2026"),
      a('@FormatDate("2026-10-09", "iso")', "2026-10-09"),
      a('@FormatDate("2026-10-09T21:30:00Z", "time")', "9:30 PM"),
      a('@FormatDate("2026-10-09T21:30:00Z", "datetime")', "Oct 9, 9:30 PM"),
      a('@FormatDate(0, "iso")', "1970-01-01"),
      a('@FormatDate("2026-02-30")', null),
    ],
  },
  AddDays: {
    source: "the calendar: 2026 is not a leap year",
    answers: [
      a('@AddDays("2026-10-09", 3)', "2026-10-12"),
      a('@AddDays("2026-12-30", 5)', "2027-01-04"),
      a('@AddDays("2026-03-01", -1)', "2026-02-28"),
      a('@AddDays("2028-03-01", -1)', "2028-02-29"),
    ],
  },
  AddMonths: {
    source: "the calendar, a month-end date clamped to the shorter month",
    answers: [
      a('@AddMonths("2026-01-31", 1)', "2026-02-28"),
      a('@AddMonths("2026-10-09", -12)', "2025-10-09"),
      a('@AddMonths("2026-11-15", 3)', "2027-02-15"),
    ],
  },
  DaysBetween: {
    source: "the calendar: 9 Oct to 25 Dec 2026 is 22 + 30 + 25 = 77 days",
    state: "$nothing = null",
    answers: [
      a('@DaysBetween("2026-10-09", "2026-12-25")', 77),
      a('@DaysBetween("2026-12-25", "2026-10-09")', -77),
      a('@DaysBetween("2026-10-09", "2026-10-09")', 0),
      a('@DaysBetween("2026-10-09", $nothing)', null),
    ],
  },
  MonthsBetween: {
    source: "whole months completed, as an age in months is counted",
    answers: [
      a('@MonthsBetween("1990-05-20", "2026-05-19")', 431),
      a('@MonthsBetween("1990-05-20", "2026-05-20")', 432),
      a('@MonthsBetween("2020-11-15", "2026-10-20")', 71),
    ],
  },
  StartOf: {
    source: "ISO 8601 weeks start on Monday; 5 October 2026 is a Monday",
    answers: [
      a('@StartOf("2026-10-09", "week")', "2026-10-05"),
      a('@StartOf("2026-10-11", "week")', "2026-10-05"),
      a('@StartOf("2026-10-09", "month")', "2026-10-01"),
      a('@StartOf("2026-10-09", "year")', "2026-01-01"),
    ],
  },
  Now: {
    source: "the fixed clock",
    answers: [a("@Now()", NOW), a('@FormatDate(@AddDays(@Now(), 1), "short")', "Oct 10")],
  },
  Today: {
    source: "the fixed clock's calendar day in UTC",
    answers: [a("@Today()", "2026-10-09")],
  },

  // Data
  GroupBy: {
    source: "SQL GROUP BY over ROWS: West has 10 and 7, East has 5",
    answers: [
      a('@GroupBy(ROWS, "region", "amount")', [
        { key: "West", value: 17 },
        { key: "East", value: 5 },
      ]),
      a('@GroupBy(ROWS, "region")', [
        { key: "West", value: 2 },
        { key: "East", value: 1 },
      ]),
      a('@GroupBy(ROWS, "region", "amount", "avg")', [
        { key: "West", value: 8.5 },
        { key: "East", value: 5 },
      ]),
      a('@GroupBy(ROWS, "region", "amount", "max")', [
        { key: "West", value: 10 },
        { key: "East", value: 5 },
      ]),
      a('@GroupBy([], "region")', []),
    ],
  },
  Pivot: {
    source: "a spreadsheet pivot table over ROWS, empty cells as 0",
    answers: [
      a('@Pivot(ROWS, "region", "product", "amount")', [
        { key: "West", A: 10, B: 7 },
        { key: "East", A: 0, B: 5 },
      ]),
      a('@Pivot(ROWS, "product", "region")', [
        { key: "A", West: 1, East: 0 },
        { key: "B", West: 1, East: 1 },
      ]),
    ],
  },
  Top: {
    source: "SQL ORDER BY … LIMIT n over ROWS",
    answers: [
      a('@Top(ROWS, "amount", 2).amount', [10, 7]),
      a('@Top(ROWS, "amount", 1, "asc").amount', [5]),
      a('@Top(ROWS, "amount", 0)', []),
    ],
  },
  Between: {
    source: "SQL BETWEEN, both ends included, over ROWS",
    answers: [
      a('@Between(ROWS, "date", "2026-10-02", "2026-10-09").amount', [5, 7]),
      a('@Between(ROWS, "date", null, "2026-10-01").amount', [10]),
      a('@Between(ROWS, "amount", 6, 10).amount', [10, 7]),
    ],
  },
  Bucket: {
    source:
      "calendar buckets over ROWS: 1 and 2 Oct fall in the ISO week of Mon 28 Sep, 9 Oct in the week of 5 Oct",
    answers: [
      a('@Bucket(ROWS, "date", "week", "amount")', [
        { key: "2026-09-28", value: 15 },
        { key: "2026-10-05", value: 7 },
      ]),
      a('@Bucket(ROWS, "date", "month", "amount")', [{ key: "2026-10", value: 22 }]),
      a('@Bucket(ROWS, "date", "day").value', [1, 1, 0, 0, 0, 0, 0, 0, 1]),
    ],
  },
  Cumulative: {
    source: "a running total",
    answers: [
      a('@Cumulative([1, 2, 3], "")', [1, 3, 6]),
      a('@Cumulative([{d: 1, v: 2}, {d: 2, v: 3}], "v")', [
        { d: 1, v: 2 },
        { d: 2, v: 5 },
      ]),
    ],
  },
  MovingAvg: {
    source: "a trailing moving average over up to n points",
    answers: [
      a('@MovingAvg([2, 4, 6, 8], "", 2)', [2, 3, 5, 7]),
      a('@MovingAvg([{v: 3}, {v: 6}, {v: 9}], "v", 3).v', [3, 4.5, 6]),
    ],
  },
  Histogram: {
    source:
      "equal-width bins from min to max, the last bin closed; the description promises {key, value} rows, key the bin's start",
    answers: [
      a("@Histogram([0.1, 0.2, 0.3, 0.9], 2, 0, 1)", [
        { key: "0", value: 3 },
        { key: "0.5", value: 1 },
      ]),
      a("@Histogram([0, 1, 2], 2, 0, 1).value", [1, 1]),
      a("@Histogram([1200, 1350, 1990], 2).key", ["1200", "1595"]),
    ],
  },
};

/** The names the library documents, for a check that no function goes untested. */
export const FUNCTION_COUNT = 59;
