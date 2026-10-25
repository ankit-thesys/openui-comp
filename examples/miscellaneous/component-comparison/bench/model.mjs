import { isDeepStrictEqual } from "node:util";
export const RUNNER_VERSION = "1.0.0";
export const CHROME_VERSION = "156.0.8078.47";
export const DEFAULT_CHROME =
  "/private/tmp/beta17-cft/156.0.8078.47/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
export const WIDTHS = [390, 768, 1280];
export const THEMES = ["light", "dark"];
export const ENVIRONMENTS = [
  "plain",
  "tailwind3-before",
  "tailwind3-after",
  "tailwind4-before",
  "tailwind4-after",
];
export const NORMALIZATION = [
  "DOM-generated IDs are excluded from semantic comparison; ARIA references are checked for resolution independently.",
  "CSS animations/transitions and caret painting are disabled only during deterministic captures; JavaScript chart geometry must settle independently.",
  "Screenshots place each unchanged iframe at screen origin (0,0) to equalize Chromium raster coordinates; original parent placement is restored after capture. Pixel tolerance remains zero. Explicit pending media fixtures retain their pending state; other media decode and SVG markup stability are awaited.",
  "Browser clock uses fixed UTC2026-01-15T12:00:00Z, locale en-US, timezone UTC, DPR1.",
  "Keyboard steps hold keys for50ms so Radix deferred roving-focus runs between keydown and keyup; no synthetic component event handlers are called.",
  "Action events use ordinary JSON serialization, omitting undefined properties. No payload values are ignored.",
];
export function verdict(layers, { cancelled = false, requested = true } = {}) {
  if (cancelled) return "Not covered";
  const values = Object.values(layers).map((x) => x.status);
  if (values.includes("Fail")) return "Fail";
  if (values.includes("Review")) return "Review";
  if (values.includes("Known issue")) return "Known issue";
  if (values.includes("Not covered")) return "Not covered";
  if (!requested || values.every((x) => x === "Not applicable"))
    return "Not applicable";
  return "Pass";
}
export function summarize(results, expected) {
  const counts = Object.fromEntries(
    [
      "Pass",
      "Fail",
      "Review",
      "Known issue",
      "Not covered",
      "Not applicable",
    ].map((s) => [s, results.filter((r) => r.verdict === s).length]),
  );
  const complete = results.length === expected;
  return {
    expected,
    executed: results.filter((r) => r.executed).length,
    recorded: results.length,
    complete,
    counts,
    verdict: !complete
      ? "Not covered"
      : verdict(
          Object.fromEntries(
            Object.entries(counts)
              .filter(([, n]) => n)
              .map(([s]) => [s, { status: s }]),
          ),
        ),
  };
}
export function compareLayer(left, right, label) {
  if (isDeepStrictEqual(left, right))
    return { status: "Pass", differences: [] };
  const differences = [];
  function visit(a, b, path) {
    if (isDeepStrictEqual(a, b)) return;
    if (a && b && typeof a === "object" && typeof b === "object")
      for (const key of new Set([...Object.keys(a), ...Object.keys(b)]))
        visit(a[key], b[key], `${path}.${key}`);
    else differences.push({ path, legacy: a ?? null, migrated: b ?? null });
  }
  visit(left, right, label);
  return { status: "Fail", differences };
}
export function classifyKnown(layers, issues) {
  const behavior = layers.behavior;
  if (
    behavior.status !== "Fail" ||
    behavior.error ||
    behavior.pageErrors?.length
  )
    return layers;
  const failures = behavior.assertions.filter((a) => !a.pass);
  const matches = failures.map((f) =>
    (issues ?? []).find(
      (issue) =>
        issue.assertionIds.includes(f.id) &&
        isDeepStrictEqual(f.actual, issue.actual),
    ),
  );
  if (failures.length && matches.every(Boolean)) {
    behavior.status = "Known issue";
    behavior.issues = [...new Set(matches)];
  }
  return layers;
}
export function matrix(
  cases,
  mode = "quick",
  widths = WIDTHS,
  themes = THEMES,
) {
  const cells = [];
  for (const c of cases)
    for (const environment of mode === "full" ? ENVIRONMENTS : ["plain"])
      for (const width of widths)
        for (const theme of themes)
          for (const delivery of c.deliveries)
            cells.push({
              id: `${c.id}--${environment}--${width}--${theme}--${delivery}`,
              caseId: c.id,
              environment,
              width,
              height: 720,
              theme,
              delivery,
            });
  return cells;
}
export function validateCase(c) {
  if (
    !c ||
    typeof c.id !== "string" ||
    !/^[a-z0-9][a-z0-9-]{0,100}$/.test(c.id) ||
    typeof c.name !== "string" ||
    typeof c.source !== "string" ||
    c.source.length > 100000 ||
    !Array.isArray(c.coverage) ||
    !Array.isArray(c.assertions) ||
    !Array.isArray(c.steps) ||
    !Array.isArray(c.deliveries) ||
    !c.deliveries.every((d) => ["instant", "stream"].includes(d))
  )
    throw Error("Invalid deterministic case");
  const allowed = [
    "text",
    "count",
    "value",
    "checked",
    "focused",
    "attribute",
    "actions",
    "noNotices",
    "empty",
    "imagePending",
    "imageError",
    "css",
    "allDisabled",
    "clipboardText",
    "stableHeight",
    "actionCount",
    "session",
  ];
  for (const a of c.assertions)
    if (!allowed.includes(a.kind) || typeof a.id !== "string")
      throw Error("Unsupported assertion");
  for (const s of c.steps)
    if (
      ![
        "click",
        "fill",
        "key",
        "hover",
        "scroll",
        "select",
        "checkpoint",
        "dblclick",
      ].includes(s.op)
    )
      throw Error("Unsupported interaction step");
  return c;
}

export function rendererNoticesPass(notices) {
  return notices.every((arm) => arm.length === 0);
}
