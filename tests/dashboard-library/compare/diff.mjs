// Compares the two sides value by value (#230). Numbers within 0.5px are equal; a list of a
// different length counts as one difference. Each difference is classified by known.mjs, and any
// it doesn't name is a real gap to report.
import { KNOWN } from "./known.mjs";

const TOLERANCE = 0.5;

function walk(his, ours, path, out) {
  const object = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
  if (object(his) && object(ours)) {
    for (const key of [...new Set([...Object.keys(his), ...Object.keys(ours)])].sort()) {
      walk(
        key in his ? his[key] : "<missing>",
        key in ours ? ours[key] : "<missing>",
        [...path, key],
        out,
      );
    }
    return;
  }
  if (Array.isArray(his) && Array.isArray(ours) && his.length === ours.length) {
    his.forEach((value, i) => walk(value, ours[i], [...path, String(i)], out));
    return;
  }
  out.compared++;
  const same =
    JSON.stringify(his) === JSON.stringify(ours) ||
    (typeof his === "number" && typeof ours === "number" && Math.abs(his - ours) <= TOLERANCE);
  if (!same) out.differences.push({ path: path.join(" › "), his, ours });
}

export const UNEXPLAINED = "not explained yet";

export function classify(entryKey, difference, all) {
  const rule = KNOWN.find((k) => k.entry.test(entryKey) && k.match(difference, all));
  return rule ? { kind: rule.kind, cause: rule.cause } : { kind: "gap", cause: UNEXPLAINED };
}

/** Per theme and entry: values compared and every difference, classified. */
export function compare(his, ours) {
  const result = {};
  for (const theme of Object.keys(his)) {
    result[theme] = {};
    for (const [key, entry] of Object.entries(his[theme].entries)) {
      const mine = ours[theme]?.entries[key];
      const out = { compared: 0, differences: [] };
      if (entry.error || !entry.program) {
        out.skipped = entry.error ?? "no program captured";
      } else if (!mine) {
        out.skipped = "not rendered on our side";
      } else {
        const strip = ({ units, scope, error }) => ({ scope, units, error });
        walk(strip(entry), strip(mine), [], out);
        if (mine.consoleErrors) out.consoleErrors = mine.consoleErrors;
      }
      out.units = Object.keys(entry.units ?? {}).length;
      const all = out.differences;
      out.differences = all.map((d) => ({ ...d, ...classify(key, d, all) }));
      result[theme][key] = out;
    }
  }
  return result;
}

const short = (value) => {
  const text = JSON.stringify(value);
  return text.length > 160 ? `${text.slice(0, 157)}…` : text;
};

/** The summary: totals per theme, a row per program, then each cause with what it covers. */
export function summarize(result, { title = "Preview comparison" } = {}) {
  const lines = [`# ${title}`, ""];
  const kinds = {
    gap: "Real gap",
    deliberate: "Known deliberate difference",
    "preview-only": "Preview-only page style",
  };
  for (const [theme, entries] of Object.entries(result)) {
    const list = Object.entries(entries);
    const compared = list.reduce((sum, [, e]) => sum + e.compared, 0);
    const units = list.reduce((sum, [, e]) => sum + (e.units ?? 0), 0);
    const differences = list.flatMap(([key, e]) => e.differences.map((d) => ({ key, ...d })));
    const pages = [...new Set(list.map(([key]) => key.split(" / ")[0]))];
    const causes = [...new Set(differences.map((d) => d.cause))];
    const label = (cause) =>
      cause === UNEXPLAINED
        ? "?"
        : String.fromCharCode(65 + causes.filter((c) => c !== UNEXPLAINED).indexOf(cause));
    lines.push(
      `## ${theme}: ${pages.length} pages, ${list.length} programs, ${units} units, ${compared} values compared, ${differences.length} different`,
      "",
      "| Program | Units | Values | Different | Causes |",
      "| --- | ---: | ---: | ---: | --- |",
      ...list.map(([key, e]) => {
        const of = [...new Set(e.differences.map((d) => label(d.cause)))].join(", ");
        const status = e.skipped ? `skipped: ${e.skipped}` : String(e.differences.length);
        const errors = e.consoleErrors ? ` (${e.consoleErrors.length} console errors)` : "";
        return `| ${key} | ${e.units ?? 0} | ${e.compared} | ${status}${errors} | ${of} |`;
      }),
      "",
    );
    for (const cause of causes) {
      const of = differences.filter((d) => d.cause === cause);
      const programs = [...new Set(of.map((d) => d.key))];
      lines.push(
        `### ${label(cause)}. ${kinds[of[0].kind]}: ${of.length} differences in ${programs.length} programs`,
        "",
        cause === UNEXPLAINED ? "Not explained yet; every difference follows." : cause,
        "",
      );
      const shown =
        cause === UNEXPLAINED
          ? of
          : of.filter((d) => !/› box › [yh]$|content › h$/.test(d.path)).slice(0, 12);
      for (const d of shown) {
        lines.push(
          `- ${d.key}: \`${d.path}\`: preview \`${short(d.his)}\`, ours \`${short(d.ours)}\``,
        );
      }
      if (cause !== UNEXPLAINED)
        lines.push(
          `- …and ${of.length - shown.length} more (positions and heights below it); all are in baseline.json.`,
        );
      lines.push("");
    }
  }
  return lines.join("\n");
}
