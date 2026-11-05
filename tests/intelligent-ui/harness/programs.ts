import { examples } from "@openuidev/intelligent-ui-library";
import gallery from "../fixtures/gallery.json" with { type: "json" };
import { behaviourPrograms } from "./behaviour-programs";

/**
 * Every program the host can render, by id. #160's gallery programs come first, migrated to the
 * current Chart signature (no `currency` argument). Since f9d86dd5 there are 44: the map-only
 * `map` program is gone, `route` and `roadtrip` lost their Map, and every SearchImage is an Image
 * with a fixed picsum.photos URL. The prompt's examples (#202) and the saved model programs (#199)
 * are added here as further sets.
 */
export type Program = {
  id: string;
  set: "gallery" | "example" | "regressions" | "theme" | "layout" | "self-test" | "behaviour";
  section: string;
  title: string;
  code: string;
};

/**
 * Programs that must fail the checks, so a check that stops seeing problems is caught. They're
 * never part of a normal run.
 */
const selfTest: Program[] = [
  {
    id: "self-test-invalid-props",
    title: "A component missing a required argument",
    code: `root = Col([Title()])`,
  },
  {
    id: "self-test-unresolved",
    title: "A reference to a statement that doesn't exist",
    code: `root = Col([Text("here"), missing])`,
  },
  {
    id: "self-test-orphaned",
    title: "A statement the root never reaches",
    code: `root = Col([Text("here")])\nextra = Text("never shown")`,
  },
].map((entry) => ({ ...entry, set: "self-test" as const, section: "self-test" }));

/** The prompt's own examples (#202), from the library's root export: "Example N: title:" then the code. */
const promptExamples: Program[] = examples.map((example, index) => {
  const [heading = "", ...code] = example.trim().split("\n");
  return {
    id: `example-${index + 1}`,
    set: "example",
    section: "prompt examples",
    title: heading.replace(/^Example \d+:\s*/, "").replace(/:$/, ""),
    code: code.join("\n").trim(),
  };
});

/**
 * The same content under each root the library allows, for the check that ThemeProvider themes
 * the output whatever its root is (#201). Without a provider, only `Col` themes itself.
 */
const themeContent = `Badge("Good", "success"), Badge("Careful", "warning"), Text("Body")`;
const themeRoots: Program[] = [
  { id: "theme-root-col", code: `root = Col([${themeContent}])` },
  { id: "theme-root-card", code: `root = Card([${themeContent}])` },
  { id: "theme-root-row", code: `root = Row([${themeContent}])` },
  { id: "theme-root-box", code: `root = Box([${themeContent}])` },
].map((entry) => ({ ...entry, set: "theme" as const, section: "theme", title: entry.id }));

/** Bugs earlier review rounds found, as the programs that showed them, so they stay fixed. */
const pieRows = `[{k: "Rent", v: 50}, {k: "Food", v: 30}, {k: "Fun", v: 20}]`;
const regressions: Program[] = [
  {
    id: "regression-short-pie",
    title: "A pie given a short height, followed by text and a button (fixed in 4b498a9b)",
    code: `root = Col([Card([Title("Spending", "md"), Chart("pie", ${pieRows}, "k", ["v"], "percent", null, 140), Text("Text right under the pie"), Button("A button under it")])])`,
  },
  {
    id: "regression-short-donut",
    title: "A donut given a short height, followed by text and a button (fixed in 4b498a9b)",
    code: `root = Col([Card([Title("Spending", "md"), Chart("donut", ${pieRows}, "k", ["v"], "percent", null, 140), Text("Text right under the donut"), Button("A button under it")])])`,
  },
  {
    id: "regression-loose-options",
    title:
      "Options written loosely: numbers, a label-only object, a null value and an empty one (fixed in f867a6c9)",
    code: `root = Col([size, mode, pick, pref])
$size = "15"
$mode = "2"
$pick = "Medium"
$pref = "No preference"
size = RadioGroup($size, [13, 15, 16], "Size")
mode = SegmentedControl($mode, [1, 2, 3])
pick = Select($pick, [{label: "Small"}, {label: "Medium"}, {value: null, label: "Any size"}, {}], "Pick")
pref = RadioGroup($pref, [{value: null, label: "No preference"}, {value: "a", label: "Aisle"}, {value: null, label: null}], "Seat")`,
  },
].map((entry) => ({ ...entry, set: "regressions" as const, section: "regressions" }));

/** Small programs for the layout checks ported from #160's layout and schema-fixes suites. */
const layout: Program[] = [
  {
    id: "layout-grid",
    code: `root = Grid([Card([Text("Cell A")]), Card([Text("Cell B")])], 2, 200, 3)`,
  },
  {
    id: "layout-radio-cards",
    code: `$pick = "a"
root = RadioGroup($pick, [{value: "a", label: "One", description: "The first"}, {value: "b", label: "Two", description: "The second"}, {value: "c", label: "Three", description: "The third"}], "Choose", "cards")`,
  },
  {
    id: "layout-shape-outside-svg",
    code: `root = Col([Text("Above"), Circle(50, 50, 30, "info")])`,
  },
  {
    id: "layout-text-in-svg",
    code: `root = Svg([Circle(50, 50, 30), Text("A caption for the drawing")], "0 0 100 100", 120, 120)`,
  },
  { id: "layout-badge-in-text", code: `root = Text(["Status: ", Badge("Live", "success")])` },
].map((entry) => ({ ...entry, set: "layout" as const, section: "layout", title: entry.id }));

export const programs: Program[] = [
  ...(gallery as Omit<Program, "set">[]).map((entry) => ({ ...entry, set: "gallery" as const })),
  ...promptExamples,
  ...regressions,
  ...themeRoots,
  ...layout,
  ...selfTest,
  // #203's behaviour programs, driven by specs/interactions, actions and functions.
  ...behaviourPrograms.map((entry) => ({
    ...entry,
    set: "behaviour" as const,
    section: "behaviour",
  })),
];

/**
 * The programs a run renders. The tracer renders one gallery program; #201 widens this to every
 * program. `IU_PROGRAMS=a,b` picks others for a local run, and `IU_PROGRAMS=all` renders them all.
 */
const DEFAULT = ["web-analytics"];

export function selected(list: string | undefined): Program[] {
  if (list === "all") {
    return programs.filter((entry) => entry.set !== "self-test" && entry.set !== "behaviour");
  }
  const ids = list ? list.split(",").map((id) => id.trim()) : DEFAULT;
  return ids.map((id) => {
    const found = programs.find((entry) => entry.id === id);
    if (!found) throw new Error(`No program called "${id}" in harness/programs.ts`);
    return found;
  });
}
