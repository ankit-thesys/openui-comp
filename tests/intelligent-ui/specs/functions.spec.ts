import { library } from "@openuidev/intelligent-ui-library";
import { expect, test, type Page } from "@playwright/test";
import {
  FUNCTION_COUNT,
  functionAnswers,
  NOW,
  RANDOM,
  type Answer,
} from "../fixtures/function-answers";
import type { Host } from "../harness/matrix";
import { failures, render } from "../harness/render";

/**
 * #203: every @function against known answers (fixtures/function-answers.ts), evaluated by the
 * Renderer in the host page. Each function's button hands its values to the host through
 * @ToAssistant's context, so they arrive exactly as the evaluator produced them.
 */
const host = () => test.info().project.metadata["host"] as Host;

// The answers are written for en-US and UTC, with the clock and Math.random pinned.
test.use({ locale: "en-US", timezoneId: "UTC" });

test("the answers cover every @function the library has", () => {
  const names = Object.keys(library.toJSONSchema().functions ?? {}).sort();
  expect(names).toHaveLength(FUNCTION_COUNT);
  expect(Object.keys(functionAnswers).sort()).toEqual(names);
});

/** Opens a functions program with the clock and Math.random pinned, and returns its values by call. */
async function evaluate(page: Page, program: string) {
  await page.clock.setFixedTime(new Date(NOW));
  await page.addInitScript((value) => {
    Math.random = () => value;
  }, RANDOM);
  const rendered = await render(page, host(), program);
  const values = new Map<Answer, unknown>();
  for (const [name, { answers }] of Object.entries(functionAnswers)) {
    const button = page.getByRole("button", { name, exact: true });
    if ((await button.count()) === 0) continue;
    await button.click();
    const sent = await page.evaluate(() => window.__iu.actions.at(-1));
    expect(sent?.humanFriendlyMessage, `the ${name} button's action`).toBe(name);
    const context = (sent?.params as { context?: Record<string, unknown> }).context ?? {};
    answers.forEach((answer, index) => {
      // A null value is left out of the context, so a missing key reads as null.
      if (`c${index}` in context || (answer.expected === null) === program.endsWith("-null")) {
        values.set(answer, context[`c${index}`] ?? null);
      }
    });
  }
  return { rendered, values };
}

/** Every answer the page gave that differs from the known one, as sentences for the report. */
function mismatches(values: Map<Answer, unknown>) {
  const wrong: string[] = [];
  for (const [name, { answers, source }] of Object.entries(functionAnswers)) {
    for (const answer of answers) {
      if (!values.has(answer)) continue;
      const got = JSON.stringify(values.get(answer));
      if (got !== JSON.stringify(answer.expected)) {
        wrong.push(
          `@${name}: ${answer.call} gave ${got}, expected ${JSON.stringify(answer.expected)} (${source})`,
        );
      }
    }
  }
  return wrong;
}

test("every @function matches its known answers", async ({ page }) => {
  const { rendered, values } = await evaluate(page, "behaviour-functions");
  expect(await failures(rendered)).toEqual([]);
  expect(values.size).toBe(
    Object.values(functionAnswers).flatMap(({ answers }) =>
      answers.filter((answer) => answer.expected !== null),
    ).length,
  );
  expect(mismatches(values)).toEqual([]);
});

test("bad input makes a call null, and the Renderer says which call failed", async ({ page }) => {
  const { rendered, values } = await evaluate(page, "behaviour-functions-null");
  const nulls = Object.values(functionAnswers).flatMap(({ answers }) =>
    answers.filter((answer) => answer.expected === null),
  );
  expect(values.size).toBe(nulls.length);
  expect(mismatches(values)).toEqual([]);
  // The program parses; the only problems are the bad calls, each reported by name, and nothing is
  // logged to the console.
  const found = await failures(rendered);
  expect(found.map((entry) => entry.check)).toEqual(["no render errors"]);
  for (const problem of found[0]!.problems) {
    expect(problem).toMatch(/^render error: runtime-error: .*@[A-Z][A-Za-z]+ threw: /);
  }
});
