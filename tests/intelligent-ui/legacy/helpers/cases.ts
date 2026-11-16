import gallery from "../parity/fixtures/programs.json";

export type Program = { id: string; section: string; title: string; code: string };

/** The source app's own gallery programs and prompt examples, which between them use every component. */
export const programs = gallery as Program[];

export const program = (id: string) => {
  const found = programs.find((item) => item.id === id);
  if (!found) throw new Error(`No program called ${id}`);
  return found.code;
};

/** Small programs, one for each thing the tests look at. */
export const small = {
  badges: `root = Col([Badge("Plain"), Badge("Note", "info"), Badge("Good", "success"), Badge("Careful", "warning"), Badge("Bad", "danger"), Badge("Purple", "purple"), Badge("Pink", "pink")])`,
  badgeInRow: `root = Row([Title("Heading", "md"), Badge("Tag", "success")])`,
  badgeInText: `root = Text(["Mix ", Badge("inline", "purple"), " into text"])`,
  checkboxes: `$open = false
$done = true
$off = false
root = Card([Checkbox($open, "Open"), Checkbox($done, "Done", true), Checkbox($off, "Not done", true)])`,
  radios: `$pick = "b"
root = Card([RadioGroup($pick, [{value: "a", label: "First"}, {value: "b", label: "Second"}, {value: "c", label: "Third"}], "Choose")])`,
  radioCards: `$pick = "a"
root = RadioGroup($pick, [{value: "a", label: "One", description: "The first"}, {value: "b", label: "Two", description: "The second"}, {value: "c", label: "Three", description: "The third"}], "Choose", "cards")`,
  code: `root = Col([Code("x = 1", "python"), Code("no language")])`,
  buttons: `root = Row([Button("Solid", null, "solid"), Button("Outline", null, "outline"), Button("Off", null, "outline", null, null, null, true)])`,
  card: `root = Card([Title("Heading", "md"), Text("Body text")])`,
  timeline: `root = List([ListItem("One", "First"), ListItem("Two", "Second"), ListItem("Three", "Third")], "number", true)`,
  grid: `root = Grid([Card([Text("A")]), Card([Text("B")])], 2, 200, 3)`,
  segmented: `$mode = "a"
root = Col([SegmentedControl($mode, [{value: "a", label: "Alpha"}, {value: "b", label: "Beta"}]), $mode == "a" ? Text("Showing alpha") : Text("Showing beta")])`,
  slider: `$level = 5
root = Col([Slider($level, 0, 10, 1, "Level"), Text("Value " + $level)])`,
  select: `$pace = "slow"
root = Col([Select($pace, [{value: "slow", label: "Slow"}, {value: "fast", label: "Fast"}], "Pace"), Text("Picked " + $pace)])`,
  input: `$name = ""
root = Col([Input($name, "Name"), Text("Hello " + $name)])`,
  timer: `$left = 90
root = Card([Timer($left, "Left")])`,
  flashcard: `root = Flashcard("Front side", "Back side", "Tap to flip")`,
  popover: `root = Text(["Open ", Popover("the details", "Hidden content")])`,
  form: `$email = ""
root = Form([Input($email, "Email", "text", null, {required: true, email: true}), Button("Send", @ToAssistant("Send it", {email: $email}), "solid")])`,
  copy: `root = Button("Copy", @CopyToClipboard("copied text"), "outline")`,
  pressable: `$on = false
root = Col([Pressable([Text("Tap me")], @Set($on, !$on), $on), $on ? Text("It is on") : Text("It is off")])`,
};
