import type { Reporter, TestCase, TestResult } from "@playwright/test/reporter";
import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { hostName, hosts } from "./matrix";

type Result = { program: string; set: string; failures: { check: string; problems: string[] }[] };

/**
 * Writes the sweep's pass/fail table (#201): one row per program, one column per host, then every
 * problem found. It goes to `sweep-report/sweep.md`, and to the job summary on GitHub Actions.
 */
export default class SweepReporter implements Reporter {
  private results = new Map<string, Map<string, Result | "crashed">>();

  onTestEnd(test: TestCase, result: TestResult) {
    if (!test.titlePath().includes("sweep")) return;
    const host = test.parent.project()?.name ?? "?";
    const attachment = result.attachments.find((entry) => entry.name === "sweep-result");
    const row = this.results.get(test.title) ?? new Map();
    // A test that threw before its checks ran (a timeout, a crash) has no result to show.
    row.set(
      host,
      attachment?.body ? (JSON.parse(attachment.body.toString()) as Result) : "crashed",
    );
    this.results.set(test.title, row);
  }

  onEnd() {
    if (this.results.size === 0) return;
    const columns = hosts
      .map(hostName)
      .filter((name) => [...this.results.values()].some((row) => row.has(name)));
    const short = (name: string) =>
      name
        .replace("react", "R")
        .replace("-light", " light")
        .replace("-dark", " dark")
        .replace("-noprovider", " no TP")
        .replace("-provider", " TP")
        .replace(/-(\d+)$/, " $1");
    const cell = (result: Result | "crashed" | undefined) =>
      result === undefined ? "–" : result === "crashed" ? "💥" : result.failures.length ? "✗" : "✓";

    let failed = 0;
    let passed = 0;
    const details: string[] = [];
    const lines = [
      `| Program | ${columns.map(short).join(" | ")} |`,
      `|---|${columns.map(() => ":-:").join("|")}|`,
    ];
    for (const [program, row] of this.results) {
      lines.push(`| \`${program}\` | ${columns.map((name) => cell(row.get(name))).join(" | ")} |`);
      for (const [host, result] of row) {
        if (result === "crashed") {
          failed++;
          details.push(`- **${program}** on ${host}: the test failed before its checks ran`);
        } else if (result.failures.length > 0) {
          failed++;
          for (const failure of result.failures) {
            for (const problem of failure.problems) {
              details.push(`- **${program}** on ${host}, ${failure.check}: ${problem}`);
            }
          }
        } else {
          passed++;
        }
      }
    }

    const report = [
      "# Rendering sweep",
      "",
      `${passed} passed, ${failed} failed: ${this.results.size} programs on ${columns.length} hosts. ` +
        "TP is react-components' ThemeProvider; no host has a CSS reset.",
      "",
      ...lines,
      "",
      "## Problems",
      "",
      ...(details.length ? details : ["None."]),
      "",
    ].join("\n");

    const out = path.join(process.cwd(), "sweep-report");
    mkdirSync(out, { recursive: true });
    writeFileSync(path.join(out, "sweep.md"), report);
    const summary = process.env["GITHUB_STEP_SUMMARY"];
    if (summary) appendFileSync(summary, report);
  }
}
