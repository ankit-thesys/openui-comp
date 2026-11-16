import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
export const testsDir = resolve(here, "..");
export const repoDir = resolve(testsDir, "../..");
export const libraryDir = join(repoDir, "packages/libraries/intelligent-ui");

/**
 * The CLI the run uses: the repository's own build by default, so a change to the CLI is tested
 * with the library. `IU_CLI` points at another one, such as a published copy's `dist/index.js`.
 */
export const cliPath = process.env["IU_CLI"] ?? join(repoDir, "packages/openui-cli/dist/index.js");

export type Generated = { prompt: string; spec: unknown; output: string; status: number | null };

/** Runs `openui generate` on prompt/entry.ts, the way the README does, and returns what it wrote and printed. */
export function generate(): Generated {
  const out = join(mkdtempSync(join(tmpdir(), "iu-prompt-")), "system-prompt.txt");
  const run = spawnSync(process.execPath, [cliPath, "generate", "prompt/entry.ts", "--out", out], {
    cwd: testsDir,
    encoding: "utf8",
    env: { ...process.env, DO_NOT_TRACK: "1", OPENUI_TELEMETRY_DISABLED: "1", NO_COLOR: "1" },
  });
  const output = `${run.stdout}${run.stderr}`;
  if (run.status !== 0) return { prompt: "", spec: null, output, status: run.status };
  return {
    prompt: readFileSync(out, "utf8"),
    spec: JSON.parse(readFileSync(out.replace(/\.txt$/, ".spec.json"), "utf8")),
    output,
    status: run.status,
  };
}

/** esbuild's warning blocks in the CLI's output, one string per warning. */
export function warnings(output: string): string[] {
  const lines = output.split("\n");
  const blocks: string[] = [];
  lines.forEach((line, index) => {
    if (!/\[WARNING\]/.test(line)) return;
    const rest = lines.slice(index + 1);
    const end = rest.findIndex((next) => /\[WARNING\]|\[ERROR\]|^Written /.test(next));
    blocks.push([line, ...(end === -1 ? rest : rest.slice(0, end))].join("\n").trim());
  });
  return blocks;
}

/** The code of each "Example N:" block in the prompt, as the model reads it. */
export function examplesIn(prompt: string): string[] {
  const section = prompt.split(/^## Examples$/m)[1]?.split(/^## /m)[0] ?? "";
  return section
    .split(/^Example \d+:.*$/m)
    .slice(1)
    .map((block) => block.trim());
}
