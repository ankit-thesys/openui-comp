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

  "behaviour-actions": `root = Col([copy, open, ask, plain, Row([add, reset], 2), Text("Count " + $count + ", name " + $name)], 3)
$count = 0
$name = "Ada"
copy = Button("Copy note", @CopyToClipboard("copied text"))
open = Button("Open docs", @OpenUrl("https://example.com/docs"))
ask = Button("Ask", @ToAssistant("Tell me more", {id: 7}))
plain = Button("Just a label")
add = Button("Add", Action([@Set($count, $count + 1), @Set($name, "Grace")]))
reset = Button("Start over", @Reset($count, $name))`,
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
];
