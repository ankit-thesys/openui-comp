import { describe, expect, it } from "vitest";
import { library } from "../../lib/openuiIntelligentLibrary";
import { run } from "./run";

const rows = `[{id: 1, region: "West", product: "A", amount: 10, date: "2026-10-01"}, {id: 2, region: "East", product: "B", amount: 5, date: "2026-10-20"}, {id: 3, region: "West", product: "B", amount: 7, date: "2026-11-03"}]`;
const R = (expr: string) => expr.replaceAll("ROWS", rows);
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

// 1. Every optional setting changes the result.
const options: Record<string, string[]> = {
  "Slice.end": ["@Slice([1, 2, 3, 4], 1)", "@Slice([1, 2, 3, 4], 1, 2)"],
  "Range.step": ["@Range(0, 10)", "@Range(0, 10, 2)"],
  "Allocate.decimals": ["@Allocate(100, [1, 1, 1])", "@Allocate(100, [1, 1, 1], 0)"],
  "Format.kind": ["@Format(1234.5, \"number\")", "@Format(1234.5, \"currency\")", "@Format(0.25, \"percent\")", "@Format(1234567, \"compact\")"],
  "Format.decimals": ["@Format(1234.5678, \"number\", 0)", "@Format(1234.5678, \"number\", 2)"],
  "Format.currency": ["@Format(10, \"currency\")", "@Format(10, \"currency\", 2, \"EUR\")"],
  "Join.sep": ["@Join([\"a\", \"b\"])", "@Join([\"a\", \"b\"], \" / \")"],
  "Join.field": ["@Join(ROWS, \", \")", "@Join(ROWS, \", \", \"region\")"],
  "Plural.plural": ["@Plural(2, \"child\")", "@Plural(2, \"child\", \"children\")"],
  "Pad.char": ["@Pad(5, 3)", "@Pad(5, 3, \"x\")"],
  "Split.sep": ["@Split(\"a b,c\")", "@Split(\"a b,c\", \" \")"],
  "Duration.style": ["@Duration(3725, \"short\")", "@Duration(3725, \"clock\")"],
  "Default.value": ["@Default(null, \"fallback\")", "@Default(\"set\", \"fallback\")"],
  "FormatDate.style": ["date", "short", "long", "weekday", "month", "time", "datetime", "iso"].map((s) => `@FormatDate("2026-10-09T14:30:00", "${s}")`),
  "GroupBy.field": ["@GroupBy(ROWS, \"region\")", "@GroupBy(ROWS, \"region\", \"amount\")"],
  "GroupBy.agg": ["sum", "avg", "count", "min", "max"].map((a) => `@GroupBy(ROWS, "region", "amount", "${a}")`),
  "Pivot.field": ["@Pivot(ROWS, \"region\", \"product\")", "@Pivot(ROWS, \"region\", \"product\", \"amount\")"],
  "Pivot.agg": ["sum", "avg", "count", "min", "max"].map((a) => `@Pivot([{r: \"W\", p: \"A\", v: 2}, {r: \"W\", p: \"A\", v: 8}, {r: \"W\", p: \"B\", v: 4}, {r: \"E\", p: \"B\", v: 6}], "r", "p", "v", "${a}")`),
  "Top.direction": ["@Top(ROWS, \"amount\", 1, \"desc\")", "@Top(ROWS, \"amount\", 1, \"asc\")"],
  "Between.min": ["@Between(ROWS, \"amount\")", "@Between(ROWS, \"amount\", 6)"],
  "Between.max": ["@Between(ROWS, \"amount\", 1)", "@Between(ROWS, \"amount\", 1, 8)"],
  "Bucket.unit": ["day", "week", "month"].map((u) => `@Bucket(ROWS, "date", "${u}", "amount")`),
  "Bucket.field": ["@Bucket(ROWS, \"date\", \"month\")", "@Bucket(ROWS, \"date\", \"month\", \"amount\")"],
  "Bucket.agg": ["sum", "avg", "count", "min", "max"].map((a) => `@Bucket(ROWS, "date", "month", "amount", "${a}")`),
  "Histogram.min": ["@Histogram([1, 2, 3, 4, 9], 2)", "@Histogram([1, 2, 3, 4, 9], 2, 0)"],
  "Histogram.max": ["@Histogram([1, 2, 3, 4, 9], 2, 0)", "@Histogram([1, 2, 3, 4, 9], 2, 0, 20)"],
};

describe("every optional setting changes the result", () => {
  for (const [name, exprs] of Object.entries(options)) {
    it(name, () => {
      const results = exprs.map((e) => run(R(e)));
      const errors = results.flatMap((r, i) => [...r.parseErrors, ...r.runtimeErrors].map((m) => `${exprs[i]}: ${m}`));
      const identical: string[] = [];
      results.forEach((a, i) => results.slice(i + 1).forEach((b, j) => same(a.value, b.value) && identical.push(`${exprs[i]} = ${exprs[i + j + 1]} → ${JSON.stringify(a.value)}`)));
      expect({ errors, identical }).toEqual({ errors: [], identical: [] });
    });
  }
  it("Random.integer", () => {
    const ints = Array.from({ length: 30 }, () => run("@Random(0, 10, true)").value as number);
    const floats = Array.from({ length: 30 }, () => run("@Random(0, 10, false)").value as number);
    expect(ints.every(Number.isInteger)).toBe(true);
    expect(floats.some((n) => !Number.isInteger(n))).toBe(true);
  });
});

// 2. A normal call returns what the signature promises.
const samples: Record<string, string> = {
  Append: "@Append([1, 2], 3)", Prepend: "@Prepend([1, 2], 0)", Concat: "@Concat([1], [2])", Remove: "@Remove(ROWS, \"id\", 1)",
  RemoveAt: "@RemoveAt([1, 2, 3], 1)", Update: "@Update(ROWS, \"id\", 1, \"amount\", 99)", Toggle: "@Toggle([1, 2], 2)",
  Includes: "@Includes([1, 2], 2)", Find: "@Find(ROWS, \"id\", 2)", IndexOf: "@IndexOf([1, 2], 2)", Take: "@Take([1, 2, 3], 2)",
  Slice: "@Slice([1, 2, 3], 1)", Unique: "@Unique([1, 1, 2])", Reverse: "@Reverse([1, 2])", Range: "@Range(0, 3)", Pick: "@Pick([1, 2])",
  Shuffle: "@Shuffle([1, 2, 3])", Flatten: "@Flatten([[1], [2]])", Chunk: "@Chunk([1, 2, 3], 2)", Pow: "@Pow(2, 3)", Sqrt: "@Sqrt(9)",
  Random: "@Random(0, 1)", Clamp: "@Clamp(5, 0, 3)", Percent: "@Percent(1, 4)", Lerp: "@Lerp(0, 10, 0.5)", Allocate: "@Allocate(100, [1, 1])",
  Payment: "@Payment(1000, 0.05, 12)", Convert: "@Convert(1, \"km\", \"mi\")", Format: "@Format(1234.5)", Join: "@Join([\"a\", \"b\"])",
  Plural: "@Plural(2, \"apple\")", Pad: "@Pad(5, 3)", Upper: "@Upper(\"a\")", Lower: "@Lower(\"A\")", Trim: "@Trim(\" a \")",
  Capitalize: "@Capitalize(\"hello\")", Split: "@Split(\"a,b\", \",\")", Replace: "@Replace(\"a-b\", \"-\", \"+\")", Duration: "@Duration(90)",
  Default: "@Default(null, \"x\")", MixColor: "@MixColor(\"#000000\", \"#ffffff\", 0.5)", Now: "@Now()", Today: "@Today()",
  FormatDate: "@FormatDate(\"2026-10-09\")", AddDays: "@AddDays(\"2026-10-09\", 1)", AddMonths: "@AddMonths(\"2026-10-09\", 1)",
  DaysBetween: "@DaysBetween(\"2026-10-01\", \"2026-10-09\")", MonthsBetween: "@MonthsBetween(\"2026-01-15\", \"2026-10-09\")",
  StartOf: "@StartOf(\"2026-10-09\", \"month\")", GroupBy: "@GroupBy(ROWS, \"region\", \"amount\")", Pivot: "@Pivot(ROWS, \"region\", \"product\", \"amount\")",
  Top: "@Top(ROWS, \"amount\", 1)", Between: "@Between(ROWS, \"amount\", 1, 10)", Bucket: "@Bucket(ROWS, \"date\", \"month\", \"amount\")",
  Cumulative: "@Cumulative(ROWS, \"amount\")", MovingAvg: "@MovingAvg(ROWS, \"amount\", 2)", Change: "@Change(110, 100)",
  Histogram: "@Histogram([1, 2, 3, 4], 2)", Stats: "@Stats([1, 2, 3])",
};
const spec = library.toSpec() as unknown as { functions: Record<string, { signature: string }> | { name: string; signature: string }[] };
const signatures = Array.isArray(spec.functions)
  ? Object.fromEntries(spec.functions.map((f) => [f.name, f.signature]))
  : Object.fromEntries(Object.entries(spec.functions).map(([n, f]) => [n, f.signature]));
const kind = (v: unknown) => (Array.isArray(v) ? "array" : v === null ? "null" : typeof v);
const promised = (signature: string) => {
  const ret = signature.split("→")[1]!.trim();
  if (ret === "any") return null;
  if (ret.includes("|")) return ret.split("|").map((t) => (t.trim().endsWith("[]") ? "array" : t.trim()));
  if (ret.endsWith("[]") || ret.endsWith("[]>")) return ["array"];
  if (ret.startsWith("{") || ret.startsWith("Record")) return ["object"];
  return [ret];
};

describe("a normal call returns what the signature promises", () => {
  it("covers every function", () => expect(Object.keys(samples).sort()).toEqual(Object.keys(signatures).sort()));
  for (const [name, expr] of Object.entries(samples)) {
    it(name, () => {
      const result = run(R(expr));
      const want = promised(signatures[name]!);
      const errors = [...result.parseErrors, ...result.runtimeErrors];
      expect(errors).toEqual([]);
      if (want) expect(want).toContain(kind(result.value));
      if (typeof result.value === "number") expect(Number.isFinite(result.value)).toBe(true);
    });
  }
});

// 3. Awkward input never throws, and never hands NaN or Infinity to the page.
const awkward = ["null", "\"\"", "[]", "\"abc\"", "0", "-1"];
describe("awkward input is handled", () => {
  for (const [name, signature] of Object.entries(signatures)) {
    it(name, () => {
      const arity = (signature.match(/\(([^)]*)\)/)![1]!.match(/[a-zA-Z]+\??:/g) ?? []).length;
      const outcomes: string[] = [];
      for (const bad of awkward) {
        const args = Array.from({ length: arity }, () => bad).join(", ");
        const expr = `@${name}(${args})`;
        let outcome: string;
        try {
          const result = run(expr);
          const v = result.value;
          const errs = [...result.parseErrors, ...result.runtimeErrors];
          if (typeof v === "number" && !Number.isFinite(v)) outcome = `${expr} → ${v}`;
          else if (typeof v === "string" && /NaN|Infinity|undefined|\[object Object\]/.test(v)) outcome = `${expr} → "${v}"`;
          else if (errs.length) outcome = "";
          else outcome = "";
        } catch (error) {
          outcome = `${expr} THREW ${(error as Error).message}`;
        }
        if (outcome) outcomes.push(outcome);
      }
      expect(outcomes).toEqual([]);
    });
  }
});
