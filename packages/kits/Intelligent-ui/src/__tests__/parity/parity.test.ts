import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  compareFlow,
  compareFunctional,
  compareSpec,
  compareVisual,
  type Difference,
} from "./compare.ts";
import {
  captureTarget,
  FIXTURES,
  FLOWS,
  HARNESS,
  MODES,
  programs,
  serveHarness,
  type Fingerprint,
  type FlowResult,
  type Interaction,
} from "./driver.ts";
import { accepted, isFollowOn, isMapMotion, needsFix, ruleFor, type Rule } from "./known-differences.ts";

type Capture = {
  visual: Record<string, Record<string, Fingerprint>>;
  functional: Record<string, Interaction[]>;
  flows: Record<string, FlowResult[]>;
  errors: Record<string, string[]>;
  spec: unknown;
};

const read = <T>(name: string) => JSON.parse(readFileSync(path.join(FIXTURES, name), "utf8")) as T;
const source = read<Capture>("source-baseline.json");

let kit: Capture;
let all: Difference[] = [];
const hits = new Map<Rule, Difference[]>();
let unexplained: Difference[] = [];
const followOn = new Map<string, number>();

/**
 * How many follow-on differences a screen may have, and how many each rule may match. A rule's count
 * has no margin, so a new bug can't hide by looking like a difference that's already listed.
 */
const BUDGET_FILE = path.join(FIXTURES, "layout-budget.json");
const budgetMargin = (key: string, allowed: number) => {
  // What a map does on a click depends on where its camera has got to, so this one moves a little.
  if (key === "rule map-vector-tiles") return 8;
  return key.startsWith("rule ") ? 0 : Math.max(4, Math.ceil(allowed * 0.1));
};

beforeAll(async () => {
  const server = await serveHarness(
    HARNESS,
    path.join(HARNESS, "target.kit.ts"),
    mkdtempSync(path.join(tmpdir(), "parity-")),
  );
  kit = (await captureTarget(server.url)) as unknown as Capture;
  await server.close();

  for (const program of programs) {
    for (const mode of MODES) {
      all.push(
        ...compareVisual(
          program.id,
          mode.id,
          source.visual[program.id]![mode.baseline]!,
          kit.visual[program.id]![mode.id]!,
        ),
      );
    }
    all.push(...compareFunctional(program.id, source.functional[program.id]!, kit.functional[program.id]!));
  }
  for (const flow of FLOWS) all.push(...compareFlow(flow.id, source.flows[flow.id]!, kit.flows[flow.id]!));

  for (const difference of all) {
    if (isMapMotion(difference)) continue;
    if (isFollowOn(difference)) {
      const key = `${difference.program} ${difference.mode}`;
      followOn.set(key, (followOn.get(key) ?? 0) + 1);
      continue;
    }
    const rule = ruleFor(difference);
    if (rule) hits.set(rule, [...(hits.get(rule) ?? []), difference]);
    else unexplained.push(difference);
  }
  for (const [rule, list] of hits) followOn.set(`rule ${rule.id}`, list.length);
}, 900_000);

afterAll(() => {
  all = [];
  unexplained = [];
});

const short = (list: Difference[]) =>
  list.slice(0, 25).map((item) => {
    const values = `${JSON.stringify(item.source)} -> ${JSON.stringify(item.kit)}`.slice(0, 120);
    return `${item.program} [${item.mode}] ${item.kind}: ${item.subject} (${values})`;
  });

describe("the library", () => {
  it("has the same components, functions and actions as the source app", () => {
    const names = (spec: unknown, key: string) =>
      Object.keys((spec as Record<string, Record<string, unknown>>)[key] ?? {}).sort();
    const pinned = read<unknown>("source-spec.json");
    for (const key of ["components", "functions", "actions"]) {
      expect(names(kit.spec, key)).toEqual(names(pinned, key));
    }
  });

  it("differs from the source's spec only by the Form validation the kit adds", () => {
    const differences = compareSpec(read<unknown>("source-spec.json"), kit.spec).filter(
      ({ path: at }) =>
        !/\/(Input|TextArea|Select|Checkbox|RadioGroup|DatePicker)\/(signature|properties\/rules)$/.test(at) &&
        !/\/Form\/description$/.test(at) &&
        at !== "/componentGroups",
    );
    expect(differences).toEqual([]);
  });
});

describe("every program", () => {
  it("renders with no errors on either side", () => {
    expect(source.errors).toEqual({});
    expect(kit.errors).toEqual({});
  });

  it("uses the same controls as the source, or a listed difference explains why not", () => {
    expect(short(unexplained.filter((item) => item.mode === "functional" || item.mode === "flow"))).toEqual([]);
  });

  it("looks like the source, or a listed difference explains why not", () => {
    expect(short(unexplained.filter((item) => item.mode !== "functional" && item.mode !== "flow"))).toEqual([]);
  });

  it("doesn't move or restyle more boxes than it did, or add to a listed difference", () => {
    const counts = Object.fromEntries([...followOn].sort());
    if (process.env["PARITY_UPDATE"]) writeFileSync(BUDGET_FILE, `${JSON.stringify(counts, null, 1)}\n`);
    const budget = read<Record<string, number>>("layout-budget.json");
    const over = Object.entries(counts)
      .filter(([key, count]) => count > (budget[key] ?? 0) + budgetMargin(key, budget[key] ?? 0))
      .map(([key, count]) => `${key}: ${count}, allowed ${budget[key] ?? 0}`);
    expect(over).toEqual([]);
  });

  it("has no listed difference that no longer happens", () => {
    const stale = [...accepted, ...needsFix].filter((rule) => !hits.has(rule)).map((rule) => rule.id);
    expect(stale).toEqual([]);
  });
});

/**
 * Each of these is a known problem. The test passes while the problem exists, and fails once it is
 * fixed, which is the reminder to delete the rule from known-differences.ts.
 */
describe("needs fixing", () => {
  for (const rule of needsFix) {
    it.fails(`${rule.id}: ${rule.summary}`, () => {
      expect(hits.get(rule) ?? []).toEqual([]);
    });
  }
});
