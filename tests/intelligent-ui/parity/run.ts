/**
 * The parity run: the library's built package against the real open-intelligent-ui app.
 *
 *   PARITY_SOURCE=/path/to/open-intelligent-ui node tests/intelligent-ui/parity/run.ts
 *
 * It renders #160's 45 gallery programs on both sides, on four screens, uses every control once,
 * runs three flows, and writes everything to `results/<run>/` (PARITY_RUN names it, today's date by
 * default). Every difference is a judgement call for the review pile, never a failure: the run exits 0
 * whatever it finds, unless it can't capture at all.
 *
 * The library side is compared with the pinned `fixtures/source-baseline.json`, so the numbers don't
 * depend on today's install of the source app. PARITY_SOURCE also captures the source app again, for
 * its screenshots and to say how far it has drifted from the baseline. Without it, the review pile
 * has the library's screenshots only.
 */
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { captureSource } from "./capture-source.ts";
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
  launch,
  MODES,
  programs,
  programsFor,
  serveHarness,
  writeJson,
  type Fingerprint,
  type FlowResult,
  type Interaction,
} from "./driver.ts";
import { accepted, isFollowOn, isMapMotion, needsFix, ruleFor } from "./known-differences.ts";

type Capture = {
  visual: Record<string, Record<string, Fingerprint>>;
  functional: Record<string, Interaction[]>;
  flows: Record<string, FlowResult[]>;
  errors: Record<string, string[]>;
  spec: unknown;
};

const here = path.dirname(fileURLToPath(import.meta.url));
const runId = process.env["PARITY_RUN"] ?? new Date().toISOString().slice(0, 10);
const out = path.join(here, "results", runId);
const shots = {
  source: path.join(out, "shots", "source"),
  library: path.join(out, "shots", "library"),
};
const read = <T>(file: string) => JSON.parse(readFileSync(file, "utf8")) as T;
const seconds = (since: number) => Math.round((Date.now() - since) / 1000);
const git = (...args: string[]) =>
  execFileSync("git", args, { cwd: here, encoding: "utf8" }).trim();

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const started = Date.now();
const timings: Record<string, number> = {};

// 1. The library, from dist, in the parity harness.
let step = Date.now();
const server = await serveHarness(
  HARNESS,
  path.join(HARNESS, "target.library.tsx"),
  mkdtempSync(path.join(tmpdir(), "parity-")),
);
const library = (await captureTarget(server.url, {
  side: "library",
  screenshots: shots.library,
})) as Capture;
await server.close();
writeJson(path.join(out, "library-capture.json"), library);
timings["library capture"] = seconds(step);

// 2. The source app again, for its screenshots.
const sourceCheckout = process.env["PARITY_SOURCE"];
let fresh: Capture | null = null;
if (sourceCheckout) {
  step = Date.now();
  fresh = (await captureSource(sourceCheckout, {
    out: path.join(out, "source-capture.json"),
    screenshots: shots.source,
  })) as Capture;
  timings["source capture"] = seconds(step);
}

// 3. Compare with the pinned baseline.
step = Date.now();
const baseline = read<Capture>(path.join(FIXTURES, "source-baseline.json"));

const compareAll = (source: Capture, target: Capture) => {
  const list: Difference[] = [];
  for (const program of programs) {
    for (const mode of MODES) {
      const a = source.visual[program.id]?.[mode.baseline];
      const b = target.visual[program.id]?.[mode.id];
      if (a && b) list.push(...compareVisual(program.id, mode.id, a, b));
    }
    list.push(
      ...compareFunctional(
        program.id,
        source.functional[program.id] ?? [],
        target.functional[program.id] ?? [],
      ),
    );
  }
  for (const flow of FLOWS)
    list.push(...compareFlow(flow.id, source.flows[flow.id] ?? [], target.flows[flow.id] ?? []));
  return list;
};

type Classified = Difference & {
  /** `follow-on`: a box or position moved by something else; `map-motion`: where a map's camera got to. */
  group: "follow-on" | "map-motion" | "judge";
  /** The #160 rule that already described it, and whether #160 thought it needed fixing. */
  rule: string | null;
  ruleStatus: "needsFix" | "accepted" | null;
};
const classify = (difference: Difference): Classified => {
  if (isMapMotion(difference))
    return { ...difference, group: "map-motion", rule: null, ruleStatus: null };
  if (isFollowOn(difference))
    return { ...difference, group: "follow-on", rule: null, ruleStatus: null };
  const rule = ruleFor(difference);
  return {
    ...difference,
    group: "judge",
    rule: rule?.id ?? null,
    ruleStatus: rule ? (needsFix.includes(rule) ? "needsFix" : "accepted") : null,
  };
};
const differences = compareAll(baseline, library).map(classify);
const drift = fresh
  ? compareAll(baseline, fresh).filter((d) => !isMapMotion(d) && !isFollowOn(d))
  : null;

const specNames = (spec: unknown, key: string) =>
  Object.keys((spec as Record<string, Record<string, unknown>>)[key] ?? {}).sort();
const pinnedSpec = read<unknown>(path.join(FIXTURES, "source-spec.json"));
const names = Object.fromEntries(
  ["components", "functions", "actions"].map((key) => {
    const a = specNames(pinnedSpec, key);
    const b = specNames(library.spec, key);
    return [
      key,
      { onlySource: a.filter((n) => !b.includes(n)), onlyLibrary: b.filter((n) => !a.includes(n)) },
    ];
  }),
);
// #160 expected these: the Form validation and the drawing slots the library adds.
const specDifferences = compareSpec(pinnedSpec, library.spec).filter(
  ({ path: at }) =>
    !/\/(Input|TextArea|Select|Checkbox|RadioGroup|DatePicker)\/(signature|properties\/rules)$/.test(
      at,
    ) &&
    !/\/(Svg|G)\/(signature|properties\/children(\/.*)?)$/.test(at) &&
    !/\/Form\/description$/.test(at) &&
    at !== "/componentGroups",
);

// 4. How much of each screenshot differs, measured in the browser so no image library is needed.
const pixels: Record<string, number> = {};
if (fresh) {
  const browser = await launch();
  const page = await browser.newPage();
  const dataUrl = (file: string) =>
    `data:image/jpeg;base64,${readFileSync(file).toString("base64")}`;
  for (const file of readdirSync(shots.source)) {
    const other = path.join(shots.library, file);
    if (!readdirSync(shots.library).includes(file)) continue;
    pixels[file.replace(/\.jpg$/, "")] = await page.evaluate(
      async ([left, right]) => {
        const loadImage = (src: string) =>
          new Promise<HTMLImageElement>((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = reject;
            image.src = src;
          });
        const [one, two] = await Promise.all([loadImage(left!), loadImage(right!)]);
        const width = Math.max(one.width, two.width);
        const height = Math.max(one.height, two.height);
        const pixelsOf = (image: HTMLImageElement) => {
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const context = canvas.getContext("2d")!;
          context.drawImage(image, 0, 0);
          return context.getImageData(0, 0, width, height).data;
        };
        const [p, q] = [pixelsOf(one), pixelsOf(two)];
        let differing = 0;
        for (let i = 0; i < p.length; i += 4) {
          const gap = Math.max(
            Math.abs(p[i]! - q[i]!),
            Math.abs(p[i + 1]! - q[i + 1]!),
            Math.abs(p[i + 2]! - q[i + 2]!),
            Math.abs(p[i + 3]! - q[i + 3]!),
          );
          if (gap > 32) differing++;
        }
        return Math.round((differing / (p.length / 4)) * 1000) / 1000;
      },
      [dataUrl(path.join(shots.source, file)), dataUrl(other)],
    );
  }
  await browser.close();
}

// 5. The review pile: one item per screen, per program's controls and per flow that differs.
const componentNames = new Set(specNames(library.spec, "components"));
const componentsIn = (code: string) =>
  [...new Set([...code.matchAll(/\b([A-Z][A-Za-z0-9]*)\(/g)].map((match) => match[1]!))]
    .filter((name) => componentNames.has(name))
    .sort();
const programById = new Map(programsFor.library.map((program) => [program.id, program]));
const shot = (side: "source" | "library", program: string, mode: string) => {
  const file = path.join(shots[side], `${program}--${mode}.jpg`);
  return existsSync(file) ? path.relative(out, file) : null;
};
const exists = (dir: string) => {
  try {
    readdirSync(dir);
    return true;
  } catch {
    return false;
  }
};

type ReviewItem = {
  id: string;
  program: string;
  title: string;
  section: string;
  screen: string;
  components: string[];
  screenshots: { source: string | null; library: string | null; sourceBaseline: string | null };
  pixelShare: number | null;
  followOn: number;
  differences: Omit<Classified, "program" | "mode" | "group">[];
  /** Filled in by the sorting session: "probably fine" or "worth a look", with one sentence. */
  verdict: null | "probably fine" | "worth a look";
  note: null | string;
};

const pile: ReviewItem[] = [];
const screens = [...MODES.map((mode) => mode.id), "functional"];
for (const program of programs) {
  const meta = programById.get(program.id)!;
  for (const screen of screens) {
    const found = differences.filter((d) => d.program === program.id && d.mode === screen);
    const judged = found.filter((d) => d.group === "judge");
    if (judged.length === 0) continue;
    const mode = MODES.find((item) => item.id === screen);
    const shotMode = mode ?? MODES[0]!;
    pile.push({
      id: `${program.id}/${screen}`,
      program: program.id,
      title: meta.title,
      section: meta.section,
      screen,
      components: componentsIn(meta.code),
      screenshots: {
        source: exists(shots.source) ? shot("source", program.id, shotMode.baseline) : null,
        library: shot("library", program.id, shotMode.id),
        sourceBaseline: mode ? mode.baseline : null,
      },
      pixelShare: mode ? (pixels[`${program.id}--${mode.id}`] ?? null) : null,
      followOn: found.filter((d) => d.group !== "judge").length,
      differences: judged.map(({ program: _p, mode: _m, group: _g, ...rest }) => rest),
      verdict: null,
      note: null,
    });
  }
}
for (const flow of FLOWS) {
  const judged = differences.filter((d) => d.program === flow.id && d.mode === "flow");
  if (judged.length === 0) continue;
  const meta = programById.get(flow.program)!;
  pile.push({
    id: `flow/${flow.id}`,
    program: flow.program,
    title: `${flow.id} flow on ${meta.title}`,
    section: "flow",
    screen: "flow",
    components: componentsIn(meta.code),
    screenshots: { source: null, library: null, sourceBaseline: null },
    pixelShare: null,
    followOn: 0,
    differences: judged.map(({ program: _p, mode: _m, group: _g, ...rest }) => rest),
    verdict: null,
    note: null,
  });
}
timings["compare"] = seconds(step);
timings["total"] = seconds(started);

writeFileSync(path.join(out, "differences.json"), `${JSON.stringify(differences, null, 1)}\n`);
writeFileSync(path.join(out, "review-pile.json"), `${JSON.stringify(pile, null, 1)}\n`);
writeFileSync(path.join(out, "pixels.json"), `${JSON.stringify(pixels, null, 1)}\n`);

// 6. The summary.
const judged = differences.filter((d) => d.group === "judge");
const count = <T>(list: T[], key: (item: T) => string) => {
  const map = new Map<string, number>();
  for (const item of list) map.set(key(item), (map.get(key(item)) ?? 0) + 1);
  return [...map].sort((a, b) => b[1] - a[1]);
};
const table = (head: string[], rows: (string | number)[][]) =>
  [
    `| ${head.join(" | ")} |`,
    `|${head.map(() => "---").join("|")}|`,
    ...rows.map((row) => `| ${row.join(" | ")} |`),
  ].join("\n");
const rulesHit = new Set(judged.map((d) => d.rule).filter(Boolean));
const staleRules = [...needsFix, ...accepted].filter((rule) => !rulesHit.has(rule.id));
const libraryCommit = git(
  "log",
  "-1",
  "--format=%h %s",
  "--",
  "../../../packages/libraries/intelligent-ui",
);
const sourcePin = read<{ commit: string }>(path.join(FIXTURES, "SOURCE.json")).commit;

const byProgram = programs.map((program) => {
  const list = judged.filter(
    (d) =>
      d.program === program.id || FLOWS.some((f) => f.id === d.program && f.program === program.id),
  );
  const items = pile.filter((item) => item.program === program.id);
  return [
    `\`${program.id}\``,
    programById.get(program.id)!.section,
    list.length,
    list.filter((d) => !d.rule).length,
    items.length,
  ] as (string | number)[];
});

const summary = `# Parity run ${runId}

The library's built package (\`@openuidev/intelligent-ui-library\`, from \`dist\` through its root
exports) against the open-intelligent-ui source app, on #160's 45 gallery programs. Part of
ankit-thesys/openui-comp#204 under #199. Every difference here is a **judgement call** for the review
pile, not an automatic failure.

- Library: \`${libraryCommit}\`
- Source app: thesysdev/open-intelligent-ui at \`${sourcePin.slice(0, 8)}\`, compared through the pinned
  \`fixtures/source-baseline.json\`${fresh ? "; captured again for screenshots" : "; not captured again, so no source screenshots"}
- Screens: ${MODES.map((mode) => `\`${mode.id}\``).join(", ")}, plus every control once and ${FLOWS.length} flows
- Time: ${Object.entries(timings)
  .map(([name, value]) => `${name} ${Math.floor(value / 60)}m ${value % 60}s`)
  .join(", ")}

## Counts

- Raw differences: ${differences.length}. Of these, ${differences.filter((d) => d.group === "follow-on").length} are follow-on
  (a box or position moved by something else) and ${differences.filter((d) => d.group === "map-motion").length} are a map's camera. They're
  kept in \`differences.json\` but not in the pile.
- **To judge: ${judged.length} differences in ${pile.length} review items** (one item per program and screen).
  ${judged.filter((d) => d.ruleStatus === "needsFix").length} match a rule #160 marked \`needsFix\`,
  ${judged.filter((d) => d.ruleStatus === "accepted").length} match one it \`accepted\`, and **${judged.filter((d) => !d.rule).length} are new**.
- #160 rules that no longer match anything (probably fixed): ${staleRules.length ? staleRules.map((rule) => `\`${rule.id}\``).join(", ") : "none"}.
- Render errors on the library side: ${
  Object.keys(library.errors).length
    ? Object.entries(library.errors)
        .map(([id, list]) => `\`${id}\` (${list.join("; ")})`)
        .join(", ")
    : "none"
}.
- Components, functions and actions only in the source: ${["components", "functions", "actions"].map((key) => `${key} ${(names[key] as { onlySource: string[] }).onlySource.join(", ") || "none"}`).join("; ")}.
  Only in the library: ${["components", "functions", "actions"].map((key) => `${key} ${(names[key] as { onlyLibrary: string[] }).onlyLibrary.join(", ") || "none"}`).join("; ")}.
- Spec differences from the source's that #160 didn't expect (\`spec-differences.json\`): ${specDifferences.length}.
${drift ? `- The source app today against its pinned baseline: ${drift.length} differences that aren't follow-on (\`source-drift.json\`); its screenshots are today's install.` : ""}

## By program

Judged differences per gallery program (its controls and flows included). A components-section
program shows the component it's named after; \`review-pile.json\` lists every component each item uses.

${table(
  ["Program", "Section", "To judge", "New (no #160 rule)", "Review items"],
  byProgram.filter((row) => (row[2] as number) > 0),
)}

Programs with nothing to judge: ${
  byProgram
    .filter((row) => row[2] === 0)
    .map((row) => row[0])
    .join(", ") || "none"
}.

## By kind

${table(
  ["Kind", "Count", "New"],
  count(judged, (d) => d.kind).map(([kind, n]) => [
    kind,
    n,
    judged.filter((d) => d.kind === kind && !d.rule).length,
  ]),
)}

## By #160 rule

${table(
  ["Rule", "Status", "Count"],
  count(
    judged.filter((d) => d.rule),
    (d) => `${d.rule}|${d.ruleStatus}`,
  ).map(([key, n]) => [...key.split("|"), n]),
)}

## Files

- \`review-pile.json\`: the pile. Each item has its program, screen, components, both screenshots, the
  share of pixels that differ, and its differences with the #160 rule that already described each one.
  \`verdict\` and \`note\` are empty for the sorting session to fill.
- \`differences.json\`: every raw difference, classified.
- \`shots/source/\` and \`shots/library/\`: full-page screenshots, \`<program>--<screen>.jpg\`. The
  source has no \`plain-1280\`; that screen is compared with its \`light-1280\`.
- \`library-capture.json\`${fresh ? ", `source-capture.json`" : ""}: the raw captures, for comparing the next run with this one.
`;
writeFileSync(path.join(out, "summary.md"), summary);
writeFileSync(
  path.join(out, "spec-differences.json"),
  `${JSON.stringify({ names, specDifferences }, null, 1)}\n`,
);
if (drift)
  writeFileSync(path.join(out, "source-drift.json"), `${JSON.stringify(drift, null, 1)}\n`);
writeFileSync(path.join(out, "timings.json"), `${JSON.stringify(timings, null, 1)}\n`);

console.log(
  `${differences.length} raw differences, ${judged.length} to judge in ${pile.length} items (${judged.filter((d) => !d.rule).length} new). ${timings["total"]}s. Results in ${out}`,
);
process.exit(0);
