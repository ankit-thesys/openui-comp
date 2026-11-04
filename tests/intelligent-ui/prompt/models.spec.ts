import { expect, test } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { testsDir } from "./cli";

/**
 * #205's prompt list and #206's model fixtures. The generation script is a manual command; these
 * check what it reads and writes, and that CI can't make it call the API.
 */
type PromptEntry = { id: string; area: string; prompt: string; opus: boolean };
const prompts = JSON.parse(
  readFileSync(join(testsDir, "models/prompts.json"), "utf8"),
) as PromptEntry[];
const fixturesDir = join(testsDir, "fixtures/models");
const MODELS = ["claude-sonnet-5-5", "claude-opus-5-5"];

const fixtures = () =>
  existsSync(fixturesDir)
    ? readdirSync(fixturesDir).flatMap((model) =>
        readdirSync(join(fixturesDir, model)).map((file) => ({
          model,
          file,
          text: readFileSync(join(fixturesDir, model, file), "utf8"),
        })),
      )
    : [];

test.describe("the approved prompt list", () => {
  test("has 33 prompts with unique ids, 10 of them for Opus, across the seven areas", () => {
    expect(prompts).toHaveLength(33);
    expect(new Set(prompts.map((entry) => entry.id)).size).toBe(prompts.length);
    expect(prompts.filter((entry) => entry.opus)).toHaveLength(10);
    expect(new Set(prompts.map((entry) => entry.area)).size).toBe(7);
    expect(prompts.filter((entry) => entry.prompt.trim() === "")).toEqual([]);
  });
});

test.describe("the model fixtures", () => {
  test("each name a prompt and a model, and carry the prompt, date and program", () => {
    const problems = fixtures().flatMap(({ model, file, text }) => {
      const fixture = JSON.parse(text) as Record<string, unknown>;
      const entry = prompts.find((candidate) => `${candidate.id}.json` === file);
      const found: string[] = [];
      if (!MODELS.includes(model)) found.push(`unknown model folder ${model}`);
      if (!entry) found.push("no prompt with this id");
      if (entry && fixture["prompt"] !== entry.prompt)
        found.push("prompt differs from prompts.json");
      if (model === "claude-opus-5-5" && entry && !entry.opus) found.push("not marked for Opus");
      if (typeof fixture["model"] !== "string" || !String(fixture["model"]).startsWith(model)) {
        found.push(`model is ${String(fixture["model"])}`);
      }
      if (Number.isNaN(Date.parse(String(fixture["date"])))) found.push("no date");
      if (typeof fixture["program"] !== "string" || fixture["program"] === "")
        found.push("no program");
      return found.map((problem) => `${model}/${file}: ${problem}`);
    });
    expect(problems).toEqual([]);
  });

  test("hold nothing that looks like an API key", () => {
    const leaks = fixtures().filter(({ text }) => /sk-ant-[A-Za-z0-9_-]{8,}/.test(text));
    expect(leaks.map(({ model, file }) => `${model}/${file}`)).toEqual([]);
  });
});

test.describe("the generation script", () => {
  test("refuses to run in CI, before it builds a client", () => {
    const result = spawnSync(process.execPath, ["models/generate.ts", "--only", "forms-01"], {
      cwd: testsDir,
      encoding: "utf8",
      env: { ...process.env, CI: "1", ANTHROPIC_API_KEY: "placeholder-not-a-key" },
    });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("never runs in CI");
  });
});
