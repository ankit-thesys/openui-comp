import { expect, test } from "@playwright/test";
import type { Host } from "../harness/matrix";
import { programs } from "../harness/programs";
import { failures, render } from "../harness/render";

/**
 * The prompt's own examples (#202) render cleanly on every host: the model copies them, so they
 * are held to the same checks as the gallery.
 */
const host = () => test.info().project.metadata["host"] as Host;
const examples = programs.filter((program) => program.set === "example");

test("the library has prompt examples to render", () => {
  expect(examples.length).toBeGreaterThan(0);
});

for (const program of examples) {
  test(`${program.id} (${program.title}) renders cleanly`, async ({ page }) => {
    const rendered = await render(page, host(), program.id);
    expect(await failures(rendered)).toEqual([]);
  });
}
