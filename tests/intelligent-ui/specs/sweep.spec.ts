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
  : programs.filter((entry) => ["gallery", "example", "regressions"].includes(entry.set));

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
 * react-components' default status palette: a success and a warning Badge's text on its background.
 */
const palette = {
  light: {
    Good: "oklch(0.448 0.108 151.328) on oklch(0.627 0.17 149.214 / 0.12)",
    Careful: "oklch(0.476 0.103 61.907) on oklch(0.795 0.162 86.047 / 0.16)",
  },
  dark: {
    Good: "oklch(0.871 0.136 154.449) on oklch(0.627 0.17 149.214 / 0.12)",
    Careful: "oklch(0.905 0.166 98.111) on oklch(0.795 0.162 86.047 / 0.16)",
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
  // Inside ThemeProvider every root gets the palette; without one, only a Col root themes itself.
  for (const root of ["col", "card", "row", "box"]) {
    test(`a ${root} root gets the theme's palette`, async ({ page }) => {
      test.skip(
        root !== "col" && !host().provider,
        "without ThemeProvider only a Col root themes itself",
      );
      const rendered = await render(page, host(), `theme-root-${root}`);
      expect(await failures(rendered)).toEqual([]);
      expect(await badgeColours(page)).toEqual(palette[host().theme]);
    });
  }

  // A Col root used to bring a theme of its own and reset an app's colours inside the response.
  test("a response keeps the app's own colours", async ({ page }) => {
    test.skip(!host().provider, "only a page with ThemeProvider has colours of its own");
    const rendered = await render(page, host(), "theme-root-col", { custom: "1" });
    expect(await failures(rendered)).toEqual([]);
    expect((await badgeColours(page)).Good).toMatch(/^rgb\(1, 2, 3\) on /);
  });
});
