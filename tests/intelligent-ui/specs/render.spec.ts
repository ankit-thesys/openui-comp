import { expect, test } from "@playwright/test";
import type { Host } from "../harness/matrix";
import { selected } from "../harness/programs";
import { failures, render } from "../harness/render";

const host = () => test.info().project.metadata["host"] as Host;

for (const program of selected(process.env["IU_PROGRAMS"])) {
  test(`${program.id} renders cleanly`, async ({ page }) => {
    const rendered = await render(page, host(), program.id);
    expect(rendered.state.react.split(".")[0], "the host's React major").toBe(host().react);
    expect(await failures(rendered)).toEqual([]);
  });
}
