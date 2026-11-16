import { library } from "@openuidev/intelligent-ui-library";
import { functionAnswers, ROWS } from "../fixtures/function-answers";

/**
 * Small programs for #203's behaviour checks: one control or action each, with a line of text that
 * reads its state back, so a spec can drive it like a user and read the result off the page. The
 * gallery's own programs cover the larger tools (the quiz, the steps viewer, the map).
 */
const programs = {
  "behaviour-form": `root = Card([Title("Join the list", "md"), form])
$email = ""
$age = null
form = Form([Input($email, "Email", "text", "you@example.com", {required: true, email: true}), Input($age, "Age", "number", null, {min: 18}), Button("Sign me up", @ToAssistant("Sign me up", {source: "newsletter"}))])`,

  "behaviour-controls": `root = Col([slider, Text("Volume is " + $volume), seg, Text("Showing " + $mode), radios, Text("Size " + $size), check, Text($done ? "Ticked" : "Not ticked"), date, Text("Date " + $day)], 3)
$volume = 5
$mode = "alpha"
$size = "M"
$done = false
$day = "2026-10-14"
slider = Slider($volume, 0, 10, 1, "Volume")
seg = SegmentedControl($mode, [{value: "alpha", label: "Alpha"}, {value: "beta", label: "Beta"}])
radios = RadioGroup($size, ["S", "M", "L"], "Size")
check = Checkbox($done, "Water the plants", true)
date = DatePicker($day, "Day", "2026-10-01", "2026-10-31")`,

  "behaviour-popover": `root = Col([Row([Text("Inflation adjusts nominal GDP"), Popover("the details", [Text("Hidden content", "sm"), Button("Inside", @Set($n, 1))])], 2), Button("Elsewhere", @Set($n, 2))])
$n = 0`,

  "behaviour-actions": `root = Col([open, ask, plain, Row([add, reset], 2), Text("Count " + $count + ", name " + $name)], 3)
$count = 0
$name = "Ada"
open = Button("Open docs", @OpenUrl("https://example.com/docs"))
ask = Button("Ask", @ToAssistant("Tell me more", {id: 7}))
plain = Button("Just a label")
add = Button("Add", Action([@Set($count, $count + 1), @Set($name, "Grace")]))
reset = Button("Start over", @Reset($count, $name))`,

  "behaviour-code": `root = Col([Code("x = 1", "python")])`,

  "behaviour-radio-rules": `root = Form([list, cards, pills, Button("Send", @ToAssistant("Send"))])
$a = ""
$b = ""
$c = ""
list = RadioGroup($a, ["Alpha", "Beta"], "List", "list", {required: true})
cards = RadioGroup($b, [{value: "x", label: "Ex", description: "The first"}, {value: "y", label: "Why", description: "The second"}], "Cards", "cards", {required: true})
pills = RadioGroup($c, ["One", "Two"], "Pills", "pills", {required: true})`,

  "behaviour-popover-scroll": `root = Col([Row([Text("Read"), Popover("the details", [Text("Hidden content", "sm")])], 2), Box([], null, null, null, null, null, null, "100%", 2400)])`,

  // The patterns the prompt teaches for working tools, from #160's patterns suite.
  "behaviour-patterns": `root = Col([Text("People: " + @Join($people)), Text("Name: [" + $name + "]"), add, toggles, Text("Split: " + @Join(@Each($items, "it", it.name + "=" + @Join(it.people, "+")), "; ")), Text("Shares: " + shares), Text("Balances: " + @Join(@Each(rows, "r", r.year + ":" + r.balance), ", ")), Button("Four years", @Set($years, 4)), Text("Door " + $door), Button("Pick a door", @Set($door, @Random(0, 2, true)))], 2)
$people = ["You"]
$name = "Alex"
$items = [{name: "Mains", people: ["A", "B"]}, {name: "Wine", people: ["A"]}]
$bill = [{amount: 30, people: ["A", "B"]}, {amount: 10, people: ["A"]}]
$years = 2
$door = -1
add = Button("Add person", Action([@Set($people, @Append($people, $name)), @Set($name, "")]))
toggles = Col(@Each($items, "it", Row(@Each(["A", "B"], "p", Button(it.name + " " + p, @Set($items, @Update($items, "name", it.name, "people", @Toggle(it.people, p))))), 2)), 2)
shares = @Join(@Each(["A", "B"], "p", p + " owes " + @Sum(@Each($bill, "it", @Includes(it.people, p) ? it.amount / @Count(it.people) : 0))), ", ")
rows = @Each(@Range(0, $years + 1), "y", {year: y, balance: @Round(1000 * @Pow(1.05, y), 2)})`,
} as const;

/**
 * Every @function's answers as two programs: a button per function whose @ToAssistant context holds
 * each call's value, keyed by the answer's index in fixtures/function-answers.ts (`c0`, `c1`, …).
 * Clicking it hands the values to the host exactly as the evaluator produced them. Calls whose
 * answer is null are bad input, which the Renderer also reports through `onError`, so they get a
 * program of their own and the first one has to render cleanly.
 */
const functionsProgram = (nulls: boolean) => {
  const names = Object.keys(functionAnswers).filter((name) =>
    functionAnswers[name]!.answers.some((answer) => (answer.expected === null) === nulls),
  );
  const buttons = names.map((name) => {
    const context = functionAnswers[name]!.answers.flatMap((answer, index) =>
      (answer.expected === null) === nulls
        ? [`c${index}: ${answer.call.replaceAll("ROWS", ROWS)}`]
        : [],
    ).join(", ");
    return `f${name} = Button("${name}", @ToAssistant("${name}", {${context}}))`;
  });
  const state = [...new Set(names.flatMap((name) => functionAnswers[name]!.state ?? []))];
  return [`root = Col([${names.map((name) => `f${name}`).join(", ")}])`, ...state, ...buttons].join(
    "\n",
  );
};

/** Values that a model's state can hold by mistake, passed to every argument of every function. */
export const AWKWARD = ["null", '""', "[]", '"abc"', "0", "-1"];

/**
 * Every function called with each awkward value in every argument, through $variables so the calls
 * reach the functions instead of stopping at the parser. One button per function; its context has a
 * value per awkward input, keyed `k0`, `k1`, ….
 */
const awkwardProgram = () => {
  const schema = library.toJSONSchema().functions ?? {};
  const names = Object.keys(schema);
  const buttons = names.map((name) => {
    const arity = Object.keys(
      (schema[name] as { params: { properties: Record<string, unknown> } }).params.properties,
    ).length;
    const context = AWKWARD.map(
      (_, index) =>
        `k${index}: @${name}(${Array.from({ length: arity }, () => `$aw${index}`).join(", ")})`,
    ).join(", ");
    return `a${name} = Button("${name}", @ToAssistant("${name}", {${context}}))`;
  });
  return [
    `root = Col([${names.map((name) => `a${name}`).join(", ")}])`,
    ...AWKWARD.map((value, index) => `$aw${index} = ${value}`),
    ...buttons,
  ].join("\n");
};

const OPTION_ROWS = `[{id: 1, region: "West", product: "A", amount: 10, date: "2026-10-01"}, {id: 2, region: "East", product: "B", amount: 5, date: "2026-10-20"}, {id: 3, region: "West", product: "B", amount: 7, date: "2026-11-03"}]`;

/**
 * Calls that differ only in one optional argument, from #160's edge-case suite: each set must give
 * pairwise different results, or the argument does nothing.
 */
export const optionSets: Record<string, string[]> = {
  "Slice.end": ["@Slice([1, 2, 3, 4], 1)", "@Slice([1, 2, 3, 4], 1, 2)"],
  "Range.step": ["@Range(0, 10)", "@Range(0, 10, 2)"],
  "Allocate.decimals": ["@Allocate(100, [1, 1, 1])", "@Allocate(100, [1, 1, 1], 0)"],
  "Format.kind": [
    '@Format(1234.5, "number")',
    '@Format(1234.5, "currency")',
    '@Format(0.25, "percent")',
    '@Format(1234567, "compact")',
  ],
  "Format.decimals": ['@Format(1234.5678, "number", 0)', '@Format(1234.5678, "number", 2)'],
  "Format.currency": ['@Format(10, "currency")', '@Format(10, "currency", 2, "EUR")'],
  "Join.sep": ['@Join(["a", "b"])', '@Join(["a", "b"], " / ")'],
  "Join.field": ['@Join(ROWS, ", ", "region")', '@Join(ROWS, ", ", "product")'],
  "Plural.plural": ['@Plural(2, "child")', '@Plural(2, "child", "children")'],
  "Pad.char": ["@Pad(5, 3)", '@Pad(5, 3, "x")'],
  "Split.sep": ['@Split("a b,c")', '@Split("a b,c", " ")'],
  "Duration.style": ['@Duration(3725, "short")', '@Duration(3725, "clock")'],
  "FormatDate.style": ["date", "short", "long", "weekday", "month", "time", "datetime", "iso"].map(
    (style) => `@FormatDate("2026-10-09T14:30:00", "${style}")`,
  ),
  "GroupBy.field": ['@GroupBy(ROWS, "region")', '@GroupBy(ROWS, "region", "amount")'],
  "GroupBy.agg": ["sum", "avg", "count", "min", "max"].map(
    (agg) => `@GroupBy(ROWS, "region", "amount", "${agg}")`,
  ),
  "Pivot.field": [
    '@Pivot(ROWS, "region", "product")',
    '@Pivot(ROWS, "region", "product", "amount")',
  ],
  "Pivot.agg": ["sum", "avg", "count", "min", "max"].map(
    (agg) =>
      `@Pivot([{r: "W", p: "A", v: 2}, {r: "W", p: "A", v: 8}, {r: "W", p: "B", v: 4}, {r: "E", p: "B", v: 6}], "r", "p", "v", "${agg}")`,
  ),
  "Top.direction": ['@Top(ROWS, "amount", 1, "desc")', '@Top(ROWS, "amount", 1, "asc")'],
  "Between.min": ['@Between(ROWS, "amount")', '@Between(ROWS, "amount", 6)'],
  "Between.max": ['@Between(ROWS, "amount", 1)', '@Between(ROWS, "amount", 1, 8)'],
  "Bucket.unit": ["day", "week", "month"].map(
    (unit) => `@Bucket(ROWS, "date", "${unit}", "amount")`,
  ),
  "Bucket.field": ['@Bucket(ROWS, "date", "month")', '@Bucket(ROWS, "date", "month", "amount")'],
  "Bucket.agg": ["sum", "avg", "count", "min", "max"].map(
    (agg) => `@Bucket(ROWS, "date", "month", "amount", "${agg}")`,
  ),
  "Histogram.min": ["@Histogram([1, 2, 3, 4, 9], 2)", "@Histogram([1, 2, 3, 4, 9], 2, 0)"],
  "Histogram.max": ["@Histogram([1, 2, 3, 4, 9], 2, 0)", "@Histogram([1, 2, 3, 4, 9], 2, 0, 20)"],
  "Random.integer": ["@Random(0, 10, true)", "@Random(0, 10, false)"],
};

const optionsProgram = () => {
  const names = Object.keys(optionSets);
  const id = (name: string) => `o${name.replace(".", "_")}`;
  const buttons = names.map((name) => {
    const context = optionSets[name]!.map(
      (call, index) => `v${index}: ${call.replaceAll("ROWS", OPTION_ROWS)}`,
    ).join(", ");
    return `${id(name)} = Button("${name}", @ToAssistant("${name}", {${context}}))`;
  });
  return [`root = Col([${names.map(id).join(", ")}])`, ...buttons].join("\n");
};

export const behaviourPrograms = [
  ...Object.entries(programs).map(([id, code]) => ({ id, title: id, code })),
  {
    id: "behaviour-functions",
    title: "The @functions' known answers",
    code: functionsProgram(false),
  },
  {
    id: "behaviour-functions-null",
    title: "The @functions' known answers to bad input",
    code: functionsProgram(true),
  },
  { id: "behaviour-awkward", title: "Every @function given awkward input", code: awkwardProgram() },
  { id: "behaviour-options", title: "Every optional @function argument", code: optionsProgram() },
];
