/**
 * Model generation (ankit-thesys/openui-comp#206). A manual command, never run in CI: it sends the
 * CLI-generated system prompt with each user prompt in models/prompts.json to a real model, and saves
 * what the model writes as a fixture in fixtures/models/<model>/<id>.json.
 *
 *   ANTHROPIC_API_KEY=… pnpm generate:models            every prompt to Sonnet, the opus ones to Opus too
 *   pnpm generate:models --dry-run                       the jobs and a cost estimate, no API calls
 *   pnpm generate:models --only forms-01,maps-01         some prompts
 *   pnpm generate:models --model sonnet --force          one model, redoing fixtures that exist
 *
 * The key comes only from ANTHROPIC_API_KEY. It is never printed, logged or written to a fixture.
 * Existing fixtures are kept unless --force, so a run that stops part-way can be resumed.
 */
import Anthropic from "@anthropic-ai/sdk";
import { library } from "@openuidev/intelligent-ui-library";
import { createParser } from "@openuidev/react-lang";
import { Data, Effect, Result, Schedule } from "effect";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { generate } from "../prompt/cli.ts";

const here = dirname(fileURLToPath(import.meta.url));
const fixturesDir = resolve(here, "../fixtures/models");

/** The models #206 names, with their per-million-token prices for the estimate. */
const MODELS = {
  sonnet: { id: "claude-sonnet-5-5", input: 2, output: 10, cacheRead: 0.2 },
  opus: { id: "claude-opus-5-5", input: 4, output: 20, cacheRead: 0.2 },
} as const;
type ModelKey = keyof typeof MODELS;
type Effort = "low" | "medium" | "high" | "xhigh" | "max";

type PromptEntry = { id: string; area: string; prompt: string; opus: boolean };
type Job = { entry: PromptEntry; model: ModelKey };

export type ModelFixture = {
  id: string;
  area: string;
  prompt: string;
  model: string;
  /** When the response was written, as an ISO date-time. */
  date: string;
  effort: Effort;
  stopReason: string | null;
  usage: { input: number; output: number; cacheRead: number; cacheWrite: number };
  /** Which system prompt the program was written from. */
  systemPromptSha256: string;
  /** The model's text, unchanged: the openui-lang program. */
  program: string;
};

class MissingKey extends Data.TaggedError("MissingKey")<{}> {}
class InCi extends Data.TaggedError("InCi")<{}> {}
class PromptFailed extends Data.TaggedError("PromptFailed")<{ readonly output: string }> {}
class ApiFailed extends Data.TaggedError("ApiFailed")<{
  readonly status: number | undefined;
  readonly message: string;
  readonly retryable: boolean;
}> {}
class Unusable extends Data.TaggedError("Unusable")<{ readonly reason: string }> {}

// ── Arguments ────────────────────────────────────────────────────────────────

const { values: args } = parseArgs({
  options: {
    "dry-run": { type: "boolean", default: false },
    force: { type: "boolean", default: false },
    only: { type: "string" },
    model: { type: "string" },
    effort: { type: "string", default: "medium" },
    concurrency: { type: "string", default: "4" },
  },
});
const effort = args.effort as Effort;
if (!["low", "medium", "high", "xhigh", "max"].includes(effort)) {
  throw new Error(`--effort must be low, medium, high, xhigh or max, not "${effort}"`);
}
if (args.model !== undefined && !(args.model in MODELS)) {
  throw new Error(`--model must be ${Object.keys(MODELS).join(" or ")}, not "${args.model}"`);
}

// ── Jobs ─────────────────────────────────────────────────────────────────────

const prompts = JSON.parse(readFileSync(join(here, "prompts.json"), "utf8")) as PromptEntry[];
const only = args.only ? new Set(args.only.split(",").map((id) => id.trim())) : undefined;
const unknown = [...(only ?? [])].filter((id) => !prompts.some((entry) => entry.id === id));
if (unknown.length > 0) throw new Error(`No prompt called ${unknown.join(", ")} in prompts.json`);

const fixturePath = (job: Job) => join(fixturesDir, MODELS[job.model].id, `${job.entry.id}.json`);
const jobs: Job[] = prompts
  .filter((entry) => !only || only.has(entry.id))
  .flatMap((entry): Job[] => [
    { entry, model: "sonnet" },
    ...(entry.opus ? [{ entry, model: "opus" as const }] : []),
  ])
  .filter((job) => !args.model || job.model === args.model)
  .filter((job) => args.force || !existsSync(fixturePath(job)));

// ── One request ──────────────────────────────────────────────────────────────

const retryable = (error: unknown) =>
  error instanceof Anthropic.APIConnectionError ||
  error instanceof Anthropic.RateLimitError ||
  error instanceof Anthropic.InternalServerError ||
  (error instanceof Anthropic.APIError &&
    (error.status === 408 || error.status === 409 || error.status === 529));

const write = (client: Anthropic, system: string, job: Job) =>
  Effect.tryPromise({
    // Streaming, so a long program doesn't hit the HTTP timeout; finalMessage collects it.
    try: (signal) =>
      client.messages
        .stream(
          {
            model: MODELS[job.model].id,
            max_tokens: 32000,
            // The same system prompt for every request: cached after the first.
            system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
            messages: [{ role: "user", content: job.entry.prompt }],
            output_config: { effort },
          },
          { signal },
        )
        .finalMessage(),
    catch: (error) =>
      new ApiFailed({
        status: error instanceof Anthropic.APIError ? error.status : undefined,
        message: error instanceof Error ? error.message : String(error),
        retryable: retryable(error),
      }),
  }).pipe(
    Effect.timeout("10 minutes"),
    Effect.mapError((error) =>
      error._tag === "ApiFailed"
        ? error
        : new ApiFailed({
            status: undefined,
            message: "timed out after 10 minutes",
            retryable: true,
          }),
    ),
    Effect.retry({
      schedule: Schedule.jittered(Schedule.exponential("2 seconds")),
      times: 5,
      while: (error) => error.retryable,
    }),
  );

const toFixture = (job: Job, message: Anthropic.Message, systemSha: string) =>
  Effect.gen(function* () {
    if (message.stop_reason === "refusal") yield* new Unusable({ reason: "the model refused" });
    if (message.stop_reason === "max_tokens") yield* new Unusable({ reason: "it hit max_tokens" });
    const program = message.content
      .flatMap((block) => (block.type === "text" ? [block.text] : []))
      .join("")
      .trim();
    if (program === "") yield* new Unusable({ reason: "no text in the response" });
    const fixture: ModelFixture = {
      id: job.entry.id,
      area: job.entry.area,
      prompt: job.entry.prompt,
      model: message.model,
      date: new Date().toISOString(),
      effort,
      stopReason: message.stop_reason,
      usage: {
        input: message.usage.input_tokens,
        output: message.usage.output_tokens,
        cacheRead: message.usage.cache_read_input_tokens ?? 0,
        cacheWrite: message.usage.cache_creation_input_tokens ?? 0,
      },
      systemPromptSha256: systemSha,
      program,
    };
    return fixture;
  });

const save = (fixture: ModelFixture, path: string) =>
  Effect.sync(() => {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${JSON.stringify(fixture, null, 2)}\n`);
  });

// ── The run ──────────────────────────────────────────────────────────────────

const parser = createParser(library.toJSONSchema(), library.root);
const parsesCleanly = (program: string) => {
  const { root, meta } = parser.parse(program);
  return (
    root?.typeName === "Col" &&
    !meta.incomplete &&
    meta.errors.length === 0 &&
    meta.unresolved.length === 0 &&
    meta.orphaned.length === 0
  );
};

const cost = (model: ModelKey, usage: ModelFixture["usage"]) => {
  const price = MODELS[model];
  // Cache writes at 5 minutes cost 1.25x the input price.
  return (
    (usage.input * price.input +
      usage.cacheWrite * price.input * 1.25 +
      usage.cacheRead * price.cacheRead +
      usage.output * price.output) /
    1_000_000
  );
};

const program = Effect.gen(function* () {
  const cli = generate();
  if (cli.status !== 0) return yield* new PromptFailed({ output: cli.output });
  const system = cli.prompt;
  const systemSha = createHash("sha256").update(system).digest("hex");

  if (args["dry-run"]) {
    // About 4 characters a token; output is a guess at a program plus thinking at medium effort.
    const systemTokens = Math.round(system.length / 4);
    const guess = { input: 150, cacheWrite: 0, cacheRead: systemTokens, output: 6000 };
    const total = jobs.reduce(
      (sum, job, index) =>
        sum +
        cost(job.model, index === 0 ? { ...guess, cacheRead: 0, cacheWrite: systemTokens } : guess),
      0,
    );
    console.log(
      `${jobs.length} requests; system prompt ≈ ${systemTokens} tokens (sha256 ${systemSha.slice(0, 12)})`,
    );
    for (const job of jobs) console.log(`  ${MODELS[job.model].id}  ${job.entry.id}`);
    console.log(`Estimate at ~6k output tokens each: about $${total.toFixed(2)}`);
    return;
  }

  // CI never calls the API, whatever its environment holds.
  if (process.env["CI"]) return yield* new InCi();
  // Only ANTHROPIC_API_KEY: no auth token or saved profile is picked up instead.
  const apiKey = process.env["ANTHROPIC_API_KEY"];
  if (!apiKey) return yield* new MissingKey();
  // Retries are the Effect schedule's, so the SDK doesn't retry underneath it.
  const client = new Anthropic({ apiKey, authToken: null, maxRetries: 0 });

  console.log(`${jobs.length} requests at ${effort} effort, ${args.concurrency} at a time`);
  const results = yield* Effect.forEach(
    jobs,
    (job) =>
      write(client, system, job).pipe(
        Effect.flatMap((message) => toFixture(job, message, systemSha)),
        Effect.tap((fixture) => save(fixture, fixturePath(job))),
        Effect.tap((fixture) =>
          Effect.sync(() =>
            console.log(
              `  ok    ${MODELS[job.model].id}  ${job.entry.id}  ${fixture.usage.output} out` +
                (parsesCleanly(fixture.program) ? "" : "  (does not parse cleanly)"),
            ),
          ),
        ),
        Effect.tapError((error) =>
          Effect.sync(() =>
            console.error(
              `  fail  ${MODELS[job.model].id}  ${job.entry.id}  ` +
                (error._tag === "ApiFailed"
                  ? `${error.status ?? "-"} ${error.message}`
                  : error.reason),
            ),
          ),
        ),
        Effect.result,
        Effect.map((result) => ({ job, result })),
      ),
    { concurrency: Number(args.concurrency) },
  );

  const done = results.flatMap(({ job, result }) =>
    Result.isSuccess(result) ? [{ job, fixture: result.success }] : [],
  );
  const failed = results.length - done.length;
  const clean = done.filter(({ fixture }) => parsesCleanly(fixture.program)).length;
  const spent = done.reduce((sum, { job, fixture }) => sum + cost(job.model, fixture.usage), 0);
  const tokens = done.reduce(
    (sum, { fixture }) => ({
      input: sum.input + fixture.usage.input + fixture.usage.cacheRead + fixture.usage.cacheWrite,
      output: sum.output + fixture.usage.output,
    }),
    { input: 0, output: 0 },
  );
  console.log(
    `\n${done.length} saved, ${failed} failed; ${clean} of ${done.length} parse cleanly.\n` +
      `${tokens.input} input tokens (cached included), ${tokens.output} output; about $${spent.toFixed(2)}.`,
  );
  if (failed > 0) process.exitCode = 1;
});

Effect.runPromise(
  program.pipe(
    Effect.catchTag("InCi", () =>
      Effect.sync(() => {
        console.error("generate:models never runs in CI. Run it by hand.");
        process.exitCode = 1;
      }),
    ),
    Effect.catchTag("MissingKey", () =>
      Effect.sync(() => {
        console.error("Set ANTHROPIC_API_KEY in the environment, then run this again.");
        process.exitCode = 1;
      }),
    ),
    Effect.catchTag("PromptFailed", (error) =>
      Effect.sync(() => {
        console.error(`The CLI didn't generate the system prompt:\n${error.output}`);
        process.exitCode = 1;
      }),
    ),
  ),
);
