import gallery from "../fixtures/gallery.json" with { type: "json" };

/**
 * Every program the host can render, by id. #160's 45 gallery programs come first, migrated to the
 * current Chart signature (no `currency` argument). The prompt's examples (#202) and the saved
 * model programs (#199) are added here as further sets.
 */
export type Program = {
  id: string;
  set: "gallery" | "self-test";
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

export const programs: Program[] = [
  ...(gallery as Omit<Program, "set">[]).map((entry) => ({ ...entry, set: "gallery" as const })),
  ...selfTest,
];

/**
 * The programs a run renders. The tracer renders one gallery program; #201 widens this to every
 * program. `IU_PROGRAMS=a,b` picks others for a local run, and `IU_PROGRAMS=all` renders them all.
 */
const DEFAULT = ["web-analytics"];

export function selected(list: string | undefined): Program[] {
  if (list === "all") return programs.filter((entry) => entry.set !== "self-test");
  const ids = list ? list.split(",").map((id) => id.trim()) : DEFAULT;
  return ids.map((id) => {
    const found = programs.find((entry) => entry.id === id);
    if (!found) throw new Error(`No program called "${id}" in harness/programs.ts`);
    return found;
  });
}
