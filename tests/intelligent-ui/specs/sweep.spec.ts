import { expect, test, type Page } from "@playwright/test";
import type { Host } from "../harness/matrix";
import { programs, selected } from "../harness/programs";
import { failures, render } from "../harness/render";

/**
 * The full sweep (#201): every gallery program, every prompt example and every past regression, on
 * every host in the matrix, through every automatic check. `IU_PROGRAMS` narrows it for a local run. Each result is
 * attached for harness/sweep-reporter.ts, which writes the pass/fail table.
 */
const host = () => test.info().project.metadata["host"] as Host;

const sweep = process.env["IU_PROGRAMS"]
  ? selected(process.env["IU_PROGRAMS"])
  : programs.filter((entry) => ["gallery", "examples", "regressions"].includes(entry.set));

test.describe("sweep", () => {
  for (const program of sweep) {
    test(program.id, async ({ page }) => {
      const found = await failures(await render(page, host(), program.id));
      await test.info().attach("sweep-result", {
        body: JSON.stringify({ program: program.id, set: program.set, failures: found }),
        contentType: "application/json",
      });
      expect(found).toEqual([]);
    });
  }
});

/**
 * The library's status palette, from the source app's theme: a success and a warning Badge's text
 * on its background. react-components' own defaults are different colours.
 */
const palette = {
  light: {
    Good: "rgb(0, 128, 93) on rgb(237, 249, 242)",
    Careful: "rgb(138, 83, 0) on rgb(255, 239, 199)",
  },
  dark: {
    Good: "rgb(91, 207, 156) on rgb(19, 41, 31)",
    Careful: "rgb(240, 184, 79) on rgb(48, 37, 15)",
  },
};

/** A Badge's text colour, on the nearest background behind it. */
const badgeColours = (page: Page) =>
  page.evaluate(() => {
    const colours = (label: string) => {
      const text = [...document.querySelectorAll("#host *")].find(
        (element) => element.childElementCount === 0 && element.textContent === label,
      );
      if (!text) return "not found";
      let back: Element | null = text;
      while (back && getComputedStyle(back).backgroundColor === "rgba(0, 0, 0, 0)") {
        back = back.parentElement;
      }
      return `${getComputedStyle(text).color} on ${back ? getComputedStyle(back).backgroundColor : "nothing"}`;
    };
    return { Good: colours("Good"), Careful: colours("Careful") };
  });

test.describe("theme", () => {
  // Inside ThemeProvider every root gets the palette; without it, only a Col root themes itself.
  for (const root of ["col", "card", "row", "box"]) {
    test(`a ${root} root gets the library's palette`, async ({ page }) => {
      test.skip(
        root !== "col" && !host().provider,
        "only a Col root themes itself without ThemeProvider",
      );
      const rendered = await render(page, host(), `theme-root-${root}`);
      expect(await failures(rendered)).toEqual([]);
      expect(await badgeColours(page)).toEqual(palette[host().theme]);
    });
  }
});
