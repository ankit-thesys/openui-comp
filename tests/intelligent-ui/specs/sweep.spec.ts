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

  // The library themes itself: a react-components ThemeProvider around the app doesn't reach it.
  test("an app's react-components ThemeProvider is ignored", async ({ page }) => {
    test.skip(host().provider || host().theme !== "light", "a light page with no library provider");
    const rendered = await render(page, host(), "theme-root-col", { components: "dark" });
    expect(await failures(rendered)).toEqual([]);
    expect(await badgeColours(page)).toEqual(palette.light);
  });

  // Series 1 to 4 take chart colours 1 to 4 in order, as in the original app, and an app's
  // intelligentChart1 reaches the chart.
  // react-components' charts give each series its colour as --color-tk-<i> on the chart.
  const barFills = (page: Page) =>
    page.evaluate(() => {
      const chart = document.querySelector<HTMLElement>("#host [data-openui-chart]");
      if (!chart) return [];
      return [0, 1, 2, 3].map((i) => chart.style.getPropertyValue(`--color-tk-${i}`).trim());
    });
  test("chart series take the theme's chart colours in order", async ({ page }) => {
    const rendered = await render(page, host(), "theme-chart");
    expect(await failures(rendered)).toEqual([]);
    expect(await barFills(page)).toEqual(["#0285ff", "#00a67d", "#8b5cf6", "#f4a340"]);
  });
  test("an app's chart colour reaches the chart", async ({ page }) => {
    test.skip(!host().provider, "only a page with ThemeProvider has colours of its own");
    await render(page, host(), "theme-chart", { custom: "1" });
    expect((await barFills(page))[0]).toBe("rgb(4, 5, 6)");
  });

  // The confetti is portaled to body, outside the provider's scope, and keeps its theme.
  test("the confetti keeps the theme's chart colours", async ({ page }) => {
    test.skip(!host().provider, "only a page with ThemeProvider has colours of its own");
    await render(page, host(), "theme-confetti", { custom: "1" });
    await page.getByRole("button", { name: "Win" }).click();
    const pieces = page.locator(".openui-intelligent-celebration-piece");
    await expect(pieces.first()).toBeAttached();
    const colours = await pieces.evaluateAll((all) =>
      all.map((piece) => getComputedStyle(piece).backgroundColor),
    );
    expect(colours).toContain("rgb(4, 5, 6)");
    expect(colours).toContain("rgb(0, 166, 125)");
  });

  // Text sets no colour of its own. It takes the library's theme, not the page's: a page whose
  // text is red (say, white in an app's dark mode) doesn't reach a response.
  test("text takes the library's colour, not the page's", async ({ page }) => {
    await render(page, host(), "theme-root-col");
    await page.addStyleTag({ content: "body { color: rgb(255, 0, 0); }" });
    const colours = await page.evaluate(() => {
      const text = [...document.querySelectorAll("#host *")].find(
        (el) => el.children.length === 0 && el.textContent === "Body",
      ) as HTMLElement;
      const probe = document.createElement("span");
      probe.style.color = "var(--openui-text-neutral-primary)";
      text.parentElement!.appendChild(probe);
      const expected = getComputedStyle(probe).color;
      probe.remove();
      return { text: getComputedStyle(text).color, expected };
    });
    expect(colours.text).not.toBe("rgb(255, 0, 0)");
    expect(colours.text).toBe(colours.expected);
  });

  // Reopening a finished chat restores its state after the first render, so the condition turns
  // true with no one acting. That isn't a win to celebrate.
  test("restoring a finished answer doesn't replay the confetti", async ({ page }) => {
    // The burst is over in about two seconds, so watch for it appearing at all.
    await page.addInitScript(() => {
      const w = window as Window & { __confetti?: number };
      w.__confetti = 0;
      new MutationObserver(() => {
        if (document.querySelector(".openui-intelligent-celebration")) w.__confetti! += 1;
      }).observe(document, { childList: true, subtree: true });
    });
    const rendered = await render(page, host(), "theme-confetti", { restore: "1" });
    expect(await failures(rendered)).toEqual([]);
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => (window as Window & { __confetti?: number }).__confetti)).toBe(
      0,
    );
  });

  // A nested library ThemeProvider with no mode takes its parent's.
  test("a nested ThemeProvider takes its parent's mode", async ({ page }) => {
    test.skip(!host().provider, "only a page with ThemeProvider has a parent to follow");
    const rendered = await render(page, host(), "theme-root-card", { nest: "1" });
    expect(await failures(rendered)).toEqual([]);
    expect(await badgeColours(page)).toEqual(palette[host().theme]);
  });
});
