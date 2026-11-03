import { library } from "@openuidev/intelligent-ui-library";
import { expect, test, type Page } from "@playwright/test";
import {
  FUNCTION_COUNT,
  functionAnswers,
  NOW,
  RANDOM,
  type Answer,
} from "../fixtures/function-answers";
import { AWKWARD, optionSets } from "../harness/behaviour-programs";
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

/** Clicks each named button and returns the context its @ToAssistant sent. */
async function contexts(page: Page, names: string[]) {
  const sent: Record<string, Record<string, unknown>> = {};
  for (const name of names) {
    await page.getByRole("button", { name, exact: true }).click();
    const action = await page.evaluate(() => window.__iu.actions.at(-1));
    expect(action?.humanFriendlyMessage).toBe(name);
    sent[name] = ((action?.params as { context?: Record<string, unknown> }).context ??
      {}) as Record<string, unknown>;
  }
  return sent;
}

test("awkward input never gives NaN, Infinity or broken text", async ({ page }) => {
  const rendered = await render(page, host(), "behaviour-awkward");
  const names = Object.keys(library.toJSONSchema().functions ?? {});
  const sent = await contexts(page, names);
  const bad: string[] = [];
  const visit = (value: unknown, where: string) => {
    if (typeof value === "number" && !Number.isFinite(value)) bad.push(`${where} is ${value}`);
    else if (typeof value === "string" && /NaN|Infinity|undefined|\[object Object\]/.test(value)) {
      bad.push(`${where} is "${value}"`);
    } else if (value && typeof value === "object") {
      for (const [key, inner] of Object.entries(value)) visit(inner, `${where}.${key}`);
    }
  };
  for (const name of names) {
    AWKWARD.forEach((input, index) => visit(sent[name]![`k${index}`], `@${name}(${input}, …)`));
  }
  expect(bad).toEqual([]);
  // Bad calls are reported by the Renderer; nothing is thrown or logged.
  rendered.state = await page.evaluate(() => window.__iu);
  const found = await failures(rendered);
  expect(found.filter((entry) => entry.check !== "no render errors")).toEqual([]);
});

test("every optional argument changes the result", async ({ page }) => {
  const rendered = await render(page, host(), "behaviour-options");
  expect(await failures(rendered)).toEqual([]);
  const sent = await contexts(page, Object.keys(optionSets));
  const same: string[] = [];
  for (const [name, calls] of Object.entries(optionSets)) {
    const values = calls.map((_, index) => JSON.stringify(sent[name]![`v${index}`] ?? null));
    values.forEach((value, index) => {
      if (value === "null") same.push(`${calls[index]} is null`);
      values.slice(index + 1).forEach((other, offset) => {
        if (other === value) same.push(`${calls[index]} = ${calls[index + offset + 1]} → ${value}`);
      });
    });
  }
  expect(same).toEqual([]);
});

test("the working-tool patterns compute and update", async ({ page }) => {
  await page.addInitScript((value) => {
    Math.random = () => value;
  }, RANDOM);
  const rendered = await render(page, host(), "behaviour-patterns");
  const main = page.locator("main");
  // 1000 at 5% a year: 1000 × 1.05ⁿ.
  await expect(main).toContainText("Balances: 0:1000, 1:1050, 2:1102.5");
  // A owes half the 30 and all the 10; B owes the other half.
  await expect(main).toContainText("Shares: A owes 25, B owes 15");
  // @Set steps run in order at click time: the name is appended before it is cleared.
  await page.getByRole("button", { name: "Add person" }).click();
  await expect(main).toContainText("People: You, Alex");
  await expect(main).toContainText("Name: []");
  // A nested @Each gives one button per item and person; each toggles one person on one item.
  await page.getByRole("button", { name: "Wine B" }).click();
  await page.getByRole("button", { name: "Mains A" }).click();
  await expect(main).toContainText("Split: Mains=B; Wine=A+B");
  // @Each over a @Range follows $state.
  await page.getByRole("button", { name: "Four years" }).click();
  await expect(main).toContainText("Balances: 0:1000, 1:1050, 2:1102.5, 3:1157.63, 4:1215.51");
  // @Random inside @Set draws on the click: 0 + floor(0.5 × 3).
  await expect(main).toContainText("Door -1");
  await page.getByRole("button", { name: "Pick a door" }).click();
  await expect(main).toContainText("Door 1");
  rendered.state = await page.evaluate(() => window.__iu);
  expect(await failures(rendered)).toEqual([]);
});
